import { createClient } from 'redis';

let redisClient = null;
let redisSubscriber = null;
let redisPublisher = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisSubscriber = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisPublisher = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    await Promise.all([
      redisClient.connect(),
      redisSubscriber.connect(),
      redisPublisher.connect()
    ]);

    console.log('Redis connected successfully');

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
    redisPublisher.on('error', (err) => console.error('Redis Publisher Error:', err));

  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

export { redisClient, redisSubscriber, redisPublisher };