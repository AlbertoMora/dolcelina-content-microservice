import { connect } from 'mongoose';
import { createClient } from 'redis';

export const initMongoDB = async () => {
    const { MONGODB_URI: mongoUri } = process.env;
    try {
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }
        await connect(mongoUri);
        console.log('✅ MongoDB connection has been established successfully.');
    } catch (error) {
        console.error(
            '❌ Cannot connect to MongoDB Server:',
            error instanceof Error ? error.message : String(error),
        );
        throw error;
    }
};

const redisUrl =
    process.env.REDIS_URL ??
    `redis://${process.env.REDIS_HOST ?? 'redis'}:${process.env.REDIS_PORT ?? '6379'}`;

export const redisClient = createClient({
    url: redisUrl,
});

redisClient
    .connect()
    .then(() => {
        console.log('Redis connection established successfully');
    })
    .catch(() => {
        console.log('Cannot connect to Redis Server');
    });
