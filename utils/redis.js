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

    isAlive() {
        return new Promise((resolve) => {
            this.client.ping((err, reply) => {
                if (err) {
                    resolve(false);
                }
                resolve(reply === 'PONG');
            });
        });
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    async set(key, value, duration) {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, 'EX', duration, (err, reply) => {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    async del(key) {
        return new Promise((resolve, reject) => {
            this.client.del(key, (err, reply) => {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    close() {
        this.client.quit();
    }
}

const redisClient = new RedisClient();
module.exports = redisClient;
