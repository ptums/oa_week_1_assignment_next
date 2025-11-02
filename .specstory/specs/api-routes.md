# API Routes Specification

**Component**: Next.js Serverless Functions  
**Location**: `app/api/` & `lib/redis.ts`  
**Last Updated**: November 2, 2025

---

## Overview

Next.js API routes provide serverless functions for Redis database integration. These handle player data, high scores, and database health checks.

---

## Architecture

```
app/api/
├── init/
│   └── route.ts        # Redis health check
├── player/
│   └── route.ts        # Player CRUD operations
└── scores/
    └── route.ts        # High scores leaderboard

lib/
└── redis.ts            # Redis client singleton
```

---

## Redis Client (`lib/redis.ts`)

Manages Redis connection with singleton pattern.

### Configuration

```typescript
import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType>
```

**TLS Handling**:
- `redis://` - No TLS (standard connection)
- `rediss://` - TLS enabled (Upstash, some cloud providers)

**Auto-detection**:
```typescript
const usesTLS = redisUrl.startsWith('rediss://');
```

### Connection Logic

1. Check for existing client (singleton)
2. Load `REDIS_URL` or `KV_URL` from env
3. Detect TLS requirement from protocol
4. Create client with appropriate config
5. Connect and ping to verify
6. Return connected client

**Error Handling**:
- Logs connection attempts
- Logs errors with full details
- Nullifies client on failure
- Throws error to caller

---

## API Endpoints

### 1. Health Check (`/api/init`)

**Method**: `GET`  
**Purpose**: Verify Redis connection

#### Request
```bash
GET /api/init
```

#### Response

**Success**:
```json
{
  "status": "ok",
  "message": "Redis connected"
}
```

**Error**:
```json
{
  "status": "error",
  "message": "Failed to connect to Redis"
}
```

#### Implementation

```typescript
export async function GET() {
  try {
    const redis = await getRedisClient();
    await redis.ping();
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Redis connected' 
    });
  } catch (error) {
    console.error('Redis init error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to connect to Redis' },
      { status: 500 }
    );
  }
}
```

---

### 2. Player Operations (`/api/player`)

**Methods**: `POST`, `GET`  
**Purpose**: Create/update player data and retrieve player info

#### POST - Create/Update Player

**Request**:
```bash
POST /api/player
Content-Type: application/json

{
  "username": "PlayerName",
  "score": 15
}
```

**Response**:
```json
{
  "username": "PlayerName",
  "times_played": 1,
  "highest_score": 15
}
```

**Logic**:
1. Get existing player data from Redis
2. Increment `times_played`
3. Update `highest_score` if new score is higher
4. Save to Redis hash (`player:username`)
5. Add to leaderboard sorted set (`leaderboard`)
6. Return updated player data

**Implementation**:
```typescript
export async function POST(request: NextRequest) {
  const { username, score } = await request.json();
  const redis = await getRedisClient();
  const playerKey = `player:${username}`;

  // Get existing data
  const existingData = await redis.hGetAll(playerKey);
  const currentTimesPlayed = parseInt(existingData.times_played || '0');
  const currentHighScore = parseInt(existingData.highest_score || '0');

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
}
```

#### GET - Retrieve Player

**Request**:
```bash
GET /api/player?username=PlayerName
```

**Response**:
```json
{
  "username": "PlayerName",
  "times_played": 5,
  "highest_score": 42
}
```

---

### 3. High Scores (`/api/scores`)

**Method**: `GET`  
**Purpose**: Get top 10 players on leaderboard

#### Request
```bash
GET /api/scores
```

#### Response
```json
[
  {
    "username": "Player1",
    "times_played": 10,
    "highest_score": 50
  },
  {
    "username": "Player2",
    "times_played": 8,
    "highest_score": 45
  }
]
```

#### Sorting Logic

**Primary**: `times_played` (descending)  
**Secondary**: `highest_score` (descending)

```typescript
playersData.sort((a, b) => {
  if (b.times_played !== a.times_played) {
    return b.times_played - a.times_played;
  }
  return b.highest_score - a.highest_score;
});
```

**Limit**: Top 10 players

#### Implementation

```typescript
export async function GET() {
  const redis = await getRedisClient();

  // Get all players
  const allPlayers = await redis.zRangeWithScores('leaderboard', 0, -1, {
    REV: true
  });

  // Fetch full data for each
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

  // Sort and return top 10
  playersData.sort((a, b) => {
    if (b.times_played !== a.times_played) {
      return b.times_played - a.times_played;
    }
    return b.highest_score - a.highest_score;
  });

  return NextResponse.json(playersData.slice(0, 10));
}
```

---

## Redis Data Structure

### Player Data (Hash)
```
Key: player:username
Fields:
  - username: string
  - times_played: number
  - highest_score: number
```

### Leaderboard (Sorted Set)
```
Key: leaderboard
Members: usernames
Scores: highest_score (for fast score-based queries)
```

**Note**: Actual sorting uses `times_played` first, but sorted set uses `highest_score` for efficient retrieval.

---

## Environment Variables

### Required

```bash
# .env.local
REDIS_URL=redis://default:password@host:port
# OR
KV_URL=redis://default:password@host:port
```

### Optional

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000  # For client-side calls
```

---

## Error Handling

### Connection Errors
- Log error message
- Log full error object
- Return 500 status
- Nullify client (force reconnect)

### Validation Errors
- Check required fields
- Return 400 status
- Descriptive error message

### Not Found Errors
- Return 404 status
- Clear error message

---

## Testing

### Health Check
```bash
curl http://localhost:3000/api/init
```

### Create Player
```bash
curl -X POST http://localhost:3000/api/player \
  -H "Content-Type: application/json" \
  -d '{"username":"test","score":10}'
```

### Get Scores
```bash
curl http://localhost:3000/api/scores
```

---

## Related Files

- `app/api/init/route.ts` - Health check
- `app/api/player/route.ts` - Player operations
- `app/api/scores/route.ts` - High scores
- `lib/redis.ts` - Redis client
- `types/index.ts` - TypeScript types
- `app/game/page.tsx` - API consumer
- `app/scores/page.tsx` - Scores display

---

## Deployment

### Vercel
API routes automatically deploy as serverless functions.

**Configuration** (`vercel.json`):
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Environment Variables
Add in Vercel dashboard:
- `REDIS_URL` (from Vercel KV or Redis Cloud)
- `KV_URL` (same as REDIS_URL)

---

*Last Updated: November 2, 2025*

