# Vim Arcade - Next.js 15

Retro arcade Vim learning game built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Redis**.

> 🚀 **This is a Next.js migration** from the Vite + React version to properly support serverless API functions.

---

## Why Next.js?

The Vite version had `api/` directory files that **weren't actually serverless functions**. Next.js makes API routes work properly on Vercel.

**Before (Vite)**:
```
api/player.ts  ❌ Not a serverless function
```

**After (Next.js)**:
```
app/api/player/route.ts  ✅ Serverless function!
```

---

## Status

### ✅ Completed

- ✅ Next.js 15 project created with App Router
- ✅ Dependencies installed (redis, @headlessui/react, framer-motion)
- ✅ Game engine logic copied (buffer.ts, sim.ts, questions.ts)
- ✅ Tailwind configured with arcade theme
- ✅ Directory structure set up
- ✅ Migration plan documented

### 🚧 To Do

- [ ] Create API route handlers (app/api/*/route.ts)
- [ ] Migrate types and contexts
- [ ] Copy and update components (add 'use client')
- [ ] Create pages (home, game, scores)
- [ ] Test locally
- [ ] Deploy to Vercel

**See**: [NEXT_MIGRATION_PLAN.md](./NEXT_MIGRATION_PLAN.md) for detailed steps.

---

## Quick Start (After Migration)

```bash
# Install dependencies (already done)
npm install

# Set up environment variables
cp .env.example .env.local
# Add your REDIS_URL

# Run development server
npm run dev

# Visit http://localhost:3000
```

---

## Migration Guide

Follow the steps in [NEXT_MIGRATION_PLAN.md](./NEXT_MIGRATION_PLAN.md):

1. Create API routes
2. Copy types
3. Set up Redis client
4. Migrate components
5. Create pages
6. Test and deploy

**Estimated time**: 2-3 hours for manual migration

---

## Project Structure

```
vim-arcade-next/
├── app/
│   ├── api/              # API routes (serverless functions)
│   │   ├── init/
│   │   ├── player/
│   │   └── scores/
│   ├── game/
│   │   └── page.tsx      # /game route
│   ├── scores/
│   │   └── page.tsx      # /scores route
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
│
├── components/           # React components ('use client')
├── contexts/            # React Context providers
├── lib/
│   ├── game/
│   │   └── engine/      # Game logic (already copied)
│   ├── api/             # API client functions
│   └── redis.ts         # Redis connection
│
└── types/               # TypeScript types
```

---

## Key Differences from Vite

### 1. 'use client' Directive

All interactive components need this:

```typescript
'use client'  // ← Add this at the top

import { useState } from 'react';

export default function MyComponent() {
  // ...
}
```

### 2. File-based Routing

No React Router needed:

```
app/game/page.tsx  → /game
app/scores/page.tsx → /scores
```

### 3. API Routes Work

```typescript
// app/api/player/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // This is a real serverless function!
  return NextResponse.json({ data });
}
```

### 4. Environment Variables

```bash
# Client-side (public)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Server-side only (private)
REDIS_URL=redis://...
```

---

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with inline @theme
- **Redis** - Database for leaderboards
- **Headless UI** - Accessible UI components
- **Framer Motion** - Animations
- **Vercel** - Deployment platform

---

## Development

```bash
# Run dev server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## Deployment

```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo in Vercel dashboard
```

**Environment Variables** (add in Vercel):
- `REDIS_URL` (from Vercel KV)
- `KV_URL` (from Vercel KV)
- `NEXT_PUBLIC_API_URL` (your Vercel URL)

---

## Documentation

- [NEXT_MIGRATION_PLAN.md](./NEXT_MIGRATION_PLAN.md) - Detailed migration steps
- [Original Vite App](../vim-arcade-react/) - Source project

---

## Why This Migration Matters

### Before (Vite)
```
✗ API routes don't work
✗ Fallback to localStorage only
✗ No serverless functions
✗ Manual Vercel configuration needed
```

### After (Next.js)
```
✓ API routes work automatically
✓ Redis integration works
✓ Serverless functions included
✓ Seamless Vercel deployment
```

---

**Next Steps**: Follow [NEXT_MIGRATION_PLAN.md](./NEXT_MIGRATION_PLAN.md) to complete the migration.

*Created: November 2, 2025*
