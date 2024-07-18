import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const {
      DB_HOST = 'localhost',
      DB_PORT = 27017,
      DB_DATABASE = 'files_manager',
    } = process.env;

    const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.error(`MongoDB connection error: ${err}`);
      // Optionally, implement retry logic here
    }
  }

  isAlive() {
    return this.client.topology && this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      const usersCollection = this.client.db().collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error);
      throw error; // Ensure errors are propagated
    }
  }

  async nbFiles() {
    try {
      const filesCollection = this.client.db().collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error);
      throw error; // Ensure errors are propagated
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
