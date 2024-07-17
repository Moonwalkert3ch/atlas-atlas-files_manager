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

      // Return the new user with minimal information
      return res.status(201).json({ id: result.insertedId, email });

    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // /users/me endpoint
  async getMe(req, res) {
    const token = req.headers['X-Token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Retrieve user ID from Redis
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        console.log(`Token not found in Redis: ${token}`);
        return res.status(401).json({ error: 'Unauthorized no userid redis' });
      }

      console.log(`Retrieved userId from Redis: ${userId}`);

      // Fetch user details from MongoDB
      const usersCollection = dbClient.client.db().collection('users');
      const user = await usersCollection.findOne({ _id: ObjectId(userId) });

      if (!user) {
        console.log(`User not found in MongoDB for userId: ${userId}`);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return user information
      return res.status(200).json({ id: user._id.toString(), email: user.email });
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default UsersController;
