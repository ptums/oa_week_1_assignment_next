import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    const redis = await getRedisClient();

    // Get all players
    const allPlayers = await redis.zRangeWithScores('leaderboard', 0, -1, {
      REV: true
    });

    // Fetch full data
    const playersData = await Promise.all(
      allPlayers.map(async (player) => {
        const username = player.value;
        const playerKey = `player:${username}`;
        const data = await redis.hGetAll(playerKey);

        return {
          username,
          times_played: parseInt(data.times_played || '0'),
          highest_score: parseInt(data.highest_score || '0')
        };
      })
    );

    // Sort by times_played DESC, then highest_score DESC
    playersData.sort((a, b) => {
      if (b.times_played !== a.times_played) {
        return b.times_played - a.times_played;
      }
      return b.highest_score - a.highest_score;
    });

    return NextResponse.json(playersData.slice(0, 10));
  } catch (error) {
    console.error('Scores API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

