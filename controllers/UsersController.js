import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import sha1 from 'sha1';

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
  }
};

export default UsersController;
