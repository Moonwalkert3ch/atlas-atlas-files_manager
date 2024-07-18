import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization || '';
    const [type, credentials] = authHeader.split(' ');

    if (type !== 'Basic' || !credentials) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = Buffer.from(credentials, 'base64').toString().split(':');
    const hashedPassword = sha1(password);

    try {
      const user = await dbClient.client.db().collection('users').findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      // console.log(`generated token:${token}`);
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

      // Debugging statement
      console.log(`User ID ${user._id} associated with token ${token}`);

      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized cant find with token' });
    }

    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized cannot find user by id' });
    }

    await redisClient.del(`auth_${token}`);

    // Debugging statement
    console.log(`Token ${token} deleted`);

    return res.status(204).send();
  }
}

export default AuthController;