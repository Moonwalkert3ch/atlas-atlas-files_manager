const redis = require('redis');

class RedisClient {
    constructor() {
        this.client = redis.createClient();

        this.client.on('error', (err) => {
            console.error('Redis error', err);
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });
    }

    isAlive(callback) {
        this.client.ping((err, reply) => {
            if (err) {
                return callback(err);
            }
            callback(null, reply === 'PONG');
        });
    }

    async get(key, callback) {
        this.client.get(key, (err, reply) => {
            if (err) {
                return callback(err);
            }
            callback(null, reply);
        });
    }

    async set(key, value, duration) {
        
    }
}