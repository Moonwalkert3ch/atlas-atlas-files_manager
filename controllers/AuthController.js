import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import{ v4 as uuidv4 } from 'uuid';

const sha1 = require('sha1');

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const base64Auth = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Auth, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      const db = await dbClient.connect();
      const usersCollection = dbClient.client.db().collection('users');
      const user = await usersCollection.findOne({
        email,
        password: sha1(password)
      });

      if (!dbClient.isAlive()) {
        console.error('MongoDB connection is not alive');
        return res.status(500).json({ error: 'MongoDB connection error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4(); // generates the token
      const key = `auth_${token}`;
      const duration = 24 * 60 * 60; // 24 hours

      await redisClient.set(key, user._id.toString(), duration);
      console.log(`Token stored in Redis: ${token}`);
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(key);
      return res.status(204).end();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    };
  };
}

export default AuthController;