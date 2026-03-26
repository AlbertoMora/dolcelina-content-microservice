import { connect } from 'mongoose';
import { createClient } from 'redis';

export const initMongoDB = async () => {
    const { MONGODB_URI: mongoUri } = process.env;
    try {
        await connect(mongoUri ?? '');
        console.log('MongoDB connection has been established successfully.');
    } catch {
        console.log('Cannot connect to MongoDB Server');
    }
};

export const redisClient = createClient();

redisClient.connect().then(s => {
    console.log('Redis connection established successfully');
});
