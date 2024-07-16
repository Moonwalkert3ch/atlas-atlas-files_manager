const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const uri = `mongodb://${host}:${port}/${database}`;

class DBClient {
    constructor() {
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('Connected to MongoDB');
            this.db = this.client.db(database);
        } catch (err) {
            console.error('Connection Failed', err);
        }
    }

    isAlive() {
        return this.client && this.client.topology && this.client.topology.isConnected();
    }

    async nbUsers() {
        try {
            if (!this.isAlive()) throw new Error('Not connected to database');
            const collection = this.db.collection('users');
            const numberOfDocs = await collection.countDocuments();
            return numberOfDocs;
        } catch (err) {
            console.error('Error counting documents in users collection', err);
            return 0;
        }
    }

    async nbFiles() {
        try {
            if (!this.isAlive()) throw new Error('Not connected to database');
            const collection = this.db.collection('files');
            const numberOfFiles = await collection.countDocuments();
            return numberOfFiles;
        } catch (err) {
            console.error('Error counting documents in files collection', err);
            return 0;
        }
    }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
module.exports = dbClient;

// Ensure unhandled promise rejections are logged
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
});
