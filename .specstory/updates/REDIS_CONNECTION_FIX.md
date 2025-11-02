# Redis Connection Fix

**Date**: November 2, 2025  
**Issue**: Redis connection failing with TLS mismatch error  
**Status**: ✅ **FIXED**

---

## Problem

Redis client was failing to connect with error:
```
TypeError: tls socket option is set to true which is mismatch with 
protocol or the URL redis://... passed
```

API endpoints returned:
```json
{"status":"error","message":"Failed to connect to Redis"}
```

---

## Root Cause

**Incorrect TLS Configuration**: Code was forcing TLS for all Redis connections, including `redis://` URLs that don't use TLS.

```typescript
// ❌ WRONG - Forces TLS for redis:// protocol
client = createClient({
  url: redisUrl,
  socket: {
    tls: true,              // This conflicts with redis://
    rejectUnauthorized: false,
  },
});
```

**The Issue**:
- `redis://` = Plain connection (no TLS)
- `rediss://` = TLS connection (with TLS)
- Redis client validates protocol matches socket config
- Mismatch = connection fails

---

## Solution

**Only enable TLS when URL explicitly uses `rediss://` protocol**:

```typescript
// ✅ CORRECT - Auto-detect TLS from protocol
const usesTLS = redisUrl.startsWith('rediss://');

client = createClient({
  url: redisUrl,
  // Only add socket config if TLS is required
  ...(usesTLS ? {
    socket: {
      tls: true,
      rejectUnauthorized: false,
    }
  } : {})
});
```

---

## Changes Made

### File: `lib/redis.ts`

**Before**:
```typescript
client = createClient({
  url: redisUrl,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});
```

**After**:
```typescript
const usesTLS = redisUrl.startsWith('rediss://');

client = createClient({
  url: redisUrl,
  ...(usesTLS ? {
    socket: {
      tls: true,
      rejectUnauthorized: false,
    }
  } : {})
});
```

---

## Testing

### Test Script
Created `test-redis-direct.js` to verify connection:

```javascript
const { createClient } = require('redis');
const usesTLS = url?.startsWith('rediss://');

const client = createClient({
  url,
  ...(usesTLS ? {
    socket: { tls: true, rejectUnauthorized: false }
  } : {})
});

await client.connect();
await client.ping();
// ✅ Success!
```

### Results

```bash
$ node test-redis-direct.js

=== Redis Connection Test (Fixed) ===
URL (masked): redis-19692.c277.us-east-1-3.ec2.redns.redis-cloud.com:19692
Using TLS: false

Connecting...
✅ Connected!
Pinging...
✅ Ping: PONG

✅✅✅ ALL TESTS PASSED! ✅✅✅
```

---

## API Endpoint Tests

### Health Check
```bash
curl http://localhost:3000/api/init
# {"status":"ok","message":"Redis connected"}
```

### Create Player
```bash
curl -X POST http://localhost:3000/api/player \
  -H "Content-Type: application/json" \
  -d '{"username":"TestPlayer","score":15}'
# {"username":"TestPlayer","times_played":1,"highest_score":15}
```

### Get Scores
```bash
curl http://localhost:3000/api/scores
# [{"username":"TestPlayer","times_played":1,"highest_score":15}]
```

**All endpoints working! ✅**

---

## Why This Works

### Redis Protocol Standards
- **`redis://`**: Standard TCP connection (default port 6379)
- **`rediss://`**: TLS-encrypted connection (default port 6380)

### Provider-Specific Behavior

**Redis Cloud** (our provider):
- Uses `redis://` protocol
- Does **not** require TLS
- Handles security at network level

**Upstash**:
- Uses `rediss://` protocol
- **Requires** TLS
- Our code now handles both!

**Vercel KV**:
- Uses `redis://` or `rediss://` depending on config
- Auto-detected by our fix

---

## Lessons Learned

1. **Don't assume TLS**: Not all Redis providers require TLS
2. **Trust the protocol**: `redis://` vs `rediss://` tells you what to use
3. **Test locally first**: Created test script to isolate issue
4. **Check provider docs**: Each provider has different requirements

---

## Related Issues

### Environment Variables
Make sure `.env.local` uses correct variable names:

```bash
# ✅ CORRECT
REDIS_URL=redis://...
KV_URL=redis://...

# ❌ WRONG (Vercel-specific prefix)
ao_week_1_REDIS_URL=redis://...
```

---

## Future Improvements

- [ ] Add connection retry logic
- [ ] Cache client more aggressively
- [ ] Add connection pooling
- [ ] Monitor connection health

---

## Related Files

- `lib/redis.ts` - Redis client configuration
- `app/api/init/route.ts` - Health check endpoint
- `app/api/player/route.ts` - Player operations
- `app/api/scores/route.ts` - High scores

---

**Impact**: All API endpoints now working with Redis Cloud  
**Build Status**: ✅ Passing  
**Deployment**: Ready for production

*Fixed: November 2, 2025*

