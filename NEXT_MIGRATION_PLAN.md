# Next.js 15 Migration Plan

**Date**: November 2, 2025  
**From**: Vite + React  
**To**: Next.js 15 + App Router

---

## ✅ Completed

1. **✅ Created Next.js 15 project** with App Router
2. **✅ Installed dependencies**: redis, @headlessui/react, framer-motion
3. **✅ Copied game engine logic** (buffer.ts, sim.ts, questions.ts, scoring.ts)
4. **✅ Configured Tailwind** with arcade theme colors
5. **✅ Set up directory structure** (lib/, components/, contexts/, types/)

---

## 🚧 In Progress / To Do

### Critical Path

#### 1. API Routes (HIGH PRIORITY)
The main reason for this migration - API routes will now work properly!

**Create these Route Handlers:**
```
app/api/init/route.ts       - Redis health check
app/api/player/route.ts     - Player CRUD operations  
app/api/scores/route.ts     - High scores leaderboard
```

#### 2. Types & Interfaces
```bash
# Copy and update
cp vim-arcade-react/src/types.ts vim-arcade-next/types/index.ts
```

#### 3. Context Providers
Next.js requires 'use client' directive for React Context.

```bash
# Copy and update
cp vim-arcade-react/src/contexts/GameContext.tsx vim-arcade-next/contexts/GameContext.tsx
# Add 'use client' at top
```

#### 4. Components (All need 'use client')
```bash
# Copy these from vim-arcade-react/src/components/
- WelcomeDialog.tsx
- GameOverDialog.tsx  
- FeedbackEmoji.tsx
- VimBuffer.tsx
- ProtectedRoute.tsx (needs rework for Next.js)
```

**Note**: All interactive components need `'use client'` directive at the top.

#### 5. Pages/Routes

**App Router Structure:**
```
app/
├── page.tsx              # Home (replace current)
├── game/
│   └── page.tsx          # Game page
├── scores/
│   └── page.tsx          # High scores page
└── layout.tsx            # Root layout (keep, update)
```

---

## Key Differences: Vite vs Next.js

### 1. Client vs Server Components

**Vite (all client)**:
```tsx
export default function MyComponent() {
  const [state, setState] = useState();
  // ...
}
```

**Next.js (specify)**:
```tsx
'use client'  // ← Add this for interactive components

export default function MyComponent() {
  const [state, setState] = useState();
  // ...
}
```

### 2. Routing

**Vite (React Router)**:
```tsx
<Route path="/game" element={<GamePage />} />
```

**Next.js (File-based)**:
```
app/game/page.tsx  # Automatically becomes /game route
```

### 3. API Endpoints

**Vite (doesn't work)**:
```
api/player.ts  # ❌ Not a serverless function
```

**Next.js (works!)**:
```
app/api/player/route.ts  # ✅ Serverless function
```

### 4. Environment Variables

**Vite**:
```
VITE_API_URL=...
```

**Next.js**:
```
NEXT_PUBLIC_API_URL=...  # For client-side
API_SECRET=...            # For server-side only
```

---

## Migration Steps (Detailed)

### Step 1: Update Types

```bash
cd vim-arcade-next
```

**File**: `types/index.ts`
```typescript
export interface Buffer {
  lines: string[];
  cursor: { row: number; col: number };
}

export type FeedbackType = 'correct' | 'wrong' | 'hint' | null;

export interface PlayerStats {
  times_played: number;
  highest_score: number;
}

export interface GameState {
  score: number;
  timeLeft: number;
  questionIndex: number;
  gameActive: boolean;
  gameOver: boolean;
  username: string;
  hasCompletedSetup: boolean;
  buffer: Buffer;
  currentQuestion: string;
  expectedAnswer: string[];
  feedback: FeedbackType;
  playerStats: PlayerStats;
}

export interface PlayerRecord {
  username: string;
  times_played: number;
  highest_score: number;
}
```

### Step 2: Create API Routes

**File**: `app/api/init/route.ts`
```typescript
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
```

**File**: `app/api/player/route.ts`
```typescript
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
```

**File**: `app/api/scores/route.ts`
```typescript
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
```

### Step 3: Create Redis Client

**File**: `lib/redis.ts`
```typescript
import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
    
    if (!redisUrl) {
      throw new Error('REDIS_URL or KV_URL environment variable not set');
    }

    client = createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      },
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
  }

  return client;
}
```

### Step 4: Create Database Client (for pages)

**File**: `lib/api/database.ts`
```typescript
import type { PlayerRecord } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function initDatabase(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/init`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Database init error:', error);
    return false;
  }
}

export async function upsertPlayer(username: string, score: number): Promise<PlayerRecord | null> {
  try {
    const response = await fetch(`${API_BASE}/api/player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, score })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Upsert player error:', error);
    return null;
  }
}

export async function getHighScores(): Promise<PlayerRecord[]> {
  try {
    const response = await fetch(`${API_BASE}/api/scores`, {
      cache: 'no-store'  // Always fetch fresh data
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Get high scores error:', error);
    return [];
  }
}

export async function getPlayer(username: string): Promise<PlayerRecord | null> {
  try {
    const response = await fetch(`${API_BASE}/api/player?username=${encodeURIComponent(username)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Get player error:', error);
    return null;
  }
}
```

### Step 5: Create Context

**File**: `contexts/GameContext.tsx`
```typescript
'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
// Import your types
// ... (copy from React app and add 'use client')
```

### Step 6: Update Layout

**File**: `app/layout.tsx`
```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vim Arcade",
  description: "Learn Vim keybindings through an arcade game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-arcade-bg text-white">
        {children}
      </body>
    </html>
  );
}
```

### Step 7: Create Home Page

**File**: `app/page.tsx`
```typescript
// Copy logic from vim-arcade-react/src/pages/HomePage.tsx
// Add 'use client' if needed
```

### Step 8: Create Game Routes

```
app/game/page.tsx   - Game page
app/scores/page.tsx - High scores
```

### Step 9: Copy Components

All components from `vim-arcade-react/src/components/` need:
1. `'use client'` at the top
2. Updated imports (use `@/` alias)
3. No React Router (use Next.js navigation)

### Step 10: Environment Variables

**File**: `.env.local`
```bash
# Public (client-side)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Private (server-side only)
REDIS_URL=redis://...
KV_URL=redis://...
```

### Step 11: Update package.json Scripts

**File**: `package.json`
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Testing

```bash
# In vim-arcade-next directory

# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

Visit: http://localhost:3000

---

## Deployment to Vercel

```bash
# In vim-arcade-next directory
vercel

# Or connect GitHub repo in Vercel dashboard
# API routes will automatically work!
```

---

## Benefits of Next.js

1. ✅ **API routes work properly** (main reason!)
2. ✅ **Server-side rendering** for better SEO
3. ✅ **Automatic code splitting**
4. ✅ **Image optimization**
5. ✅ **Built-in TypeScript support**
6. ✅ **Better Vercel integration**
7. ✅ **App Router** for modern patterns

---

## File Count Estimate

**To migrate**:
- ~15 component files
- ~3 page files
- ~3 API route files
- 1 context file
- 1 types file
- Various config files

**Total**: ~500-700 lines of code to migrate

---

## Next Steps

1. Create API routes (Step 2)
2. Copy types (Step 1)
3. Create Redis client (Step 3)
4. Create database client (Step 4)
5. Copy context with 'use client' (Step 5)
6. Copy components with 'use client' (Step 9)
7. Create pages (Step 7-8)
8. Test locally
9. Deploy

---

**Status**: Foundation ready, manual migration of components/pages needed.

*Last Updated: November 2, 2025*

