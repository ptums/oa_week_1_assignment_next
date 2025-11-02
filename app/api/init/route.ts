import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    const redis = await getRedisClient();
    await redis.ping();
    return NextResponse.json({ status: 'ok', message: 'Redis connected' });
  } catch (error) {
    console.error('Redis init error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to connect to Redis' },
      { status: 500 }
    );
  }
}

