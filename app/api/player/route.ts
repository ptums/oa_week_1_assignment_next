import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { username, score } = await request.json();
    
    if (!username || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Username and score required' },
        { status: 400 }
      );
    }

    const redis = await getRedisClient();
    const playerKey = `player:${username}`;

    // Get existing data
    const existingData = await redis.hGetAll(playerKey);
    const currentTimesPlayed = existingData.times_played 
      ? parseInt(existingData.times_played)
      : 0;
    const currentHighScore = existingData.highest_score
      ? parseInt(existingData.highest_score)
      : 0;

    // Update
    const newTimesPlayed = currentTimesPlayed + 1;
    const newHighScore = Math.max(currentHighScore, score);

    await redis.hSet(playerKey, {
      username,
      times_played: newTimesPlayed.toString(),
      highest_score: newHighScore.toString(),
    });

    await redis.zAdd('leaderboard', {
      score: newHighScore,
      value: username,
    });

    return NextResponse.json({
      username,
      times_played: newTimesPlayed,
      highest_score: newHighScore,
    });
  } catch (error) {
    console.error('Player API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username required' },
        { status: 400 }
      );
    }

    const redis = await getRedisClient();
    const playerKey = `player:${username}`;
    const data = await redis.hGetAll(playerKey);

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      username: data.username,
      times_played: parseInt(data.times_played || '0'),
      highest_score: parseInt(data.highest_score || '0'),
    });
  } catch (error) {
    console.error('Get player error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

