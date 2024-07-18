import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import sha1 from 'sha1';
import { error } from 'console';
import redisClient from '../utils/redis';

const UsersController = {
  async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email and password presence
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if email already exists
      const usersCollection = dbClient.client.db().collection('users');
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash password using SHA1
      const hashedPassword = sha1(password);

      // Insert new user into the database
      const result = await usersCollection.insertOne({ email, password: hashedPassword });

      // Log user creation
      console.log(`New user created with ID: ${result.insertedId}`);

      // Return the new user with minimal information
      return res.status(201).json({ id: result.insertedId, email });

    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // /users/me endpoint
  async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        console.log(`Token ${token} is not associated with any user ID`);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // debugging
      console.log(`Token ${token} is associated with user ID: ${userId}`);

      const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id, email: user.email });
      // console.log(`found token: ${token} for userid: ${userId}, email:${email}`);
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default UsersController;
