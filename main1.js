import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        const maxAttempts = 10;
        let attempts = 0;

        const checkConnection = async () => {
            try {
                attempts++;
                if (attempts > maxAttempts) {
                    throw new Error('Connection timeout');
                }

                if (!dbClient.isAlive()) {
                    console.log(`Connection attempt ${attempts}: MongoDB client not connected yet`);
                    setTimeout(checkConnection, 1000); // Retry after 1 second
                } else {
                    console.log('MongoDB client connected successfully');
                    resolve();
                }
            } catch (error) {
                reject(error);
            }
        };

        checkConnection();
    });
};

(async () => {
    try {
        console.log(dbClient.isAlive());
        await waitConnection();
        console.log(dbClient.isAlive());
        console.log(await dbClient.nbUsers());
        console.log(await dbClient.nbFiles());
    } catch (error) {
        console.error('Error in main script:', error);
        process.exit(1); // Exit the process with a non-zero code to indicate failure
    }
})();
