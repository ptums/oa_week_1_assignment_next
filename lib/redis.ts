import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
    
    if (!redisUrl) {
      throw new Error('REDIS_URL or KV_URL environment variable not set');
    }

    console.log('Attempting to connect to Redis:', redisUrl.split('@')[1] || 'undefined');

    // Only use TLS if URL explicitly specifies rediss:// protocol
    // Let the client auto-detect based on URL protocol
    const usesTLS = redisUrl.startsWith('rediss://');

    client = createClient({
      url: redisUrl,
      // Only add socket config if TLS is explicitly required
      ...(usesTLS ? {
        socket: {
          tls: true,
          rejectUnauthorized: false,
        }
      } : {})
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      console.error('Full error:', err);
    });
    
    client.on('connect', () => console.log('Redis Client Connected'));
    client.on('ready', () => console.log('Redis Client Ready'));

    try {
      await client.connect();
      await client.ping();
      console.log('Redis ping successful');
    } catch (error) {
      console.error('Redis connection failed:', error);
      client = null;
      throw error;
    }
  }

  return client;
}

