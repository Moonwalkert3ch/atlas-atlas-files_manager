const { MongoClient } = require('mongodb');
require('dotenv').config();


class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_PORT || 'files_manager';

        this.uri = `mongodb://${host}:${port}`;
        this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });

        //connect to server
        this.client.connect()
            .then(() => {
                console.log('Connected to Mongodb');
                this.db = this.client.db(database);
            })
            .catch(err => {
                console.error('Connection Failed', err);
            });
    }

    isAlive() {
        return !!this.client && this.client.isConnected();
    }
    
    async nbUsers() {
        try {
            const collection = this.db.collection('users');
            const numberOfDocs = await collection.countDocuments();
            return numberOfDocs;
        } catch (err) {
            console.error('Error counting docs', err);
            return 0;
        }
    }

    async nbFiles() {
        try {
            const collection = this.db.collection('users');
            const numberOfFiles = await collection.countFiles();
            return numberOfFiles;
        } catch (err) {
            console.error('Error counting files', err);
            return 0;
        }
    }
}

// create and export an instance of DBClient and dbClient
const dbClient = new DBClient();
module.exports = dbClient;