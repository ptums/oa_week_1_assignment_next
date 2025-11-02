# Redis Connection Troubleshooting

**Issue**: API routes return `"Failed to connect to Redis"`

---

## ✅ Quick Fix

### 1. Use `.env.local` (Not `.env`)

Next.js prefers `.env.local` for local development:

```bash
cd vim-arcade-next
cp .env .env.local  # Already done!
```

### 2. Verify Environment Variables

Your `.env.local` should have:

```bash
# Public (client-side)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Private (server-side only)
REDIS_URL=redis://default:password@host:port
# OR if using Vercel KV:
KV_URL=redis://default:password@host:port
```

### 3. Restart Dev Server

```bash
# Kill any running servers
lsof -ti:3000,3001 | xargs kill -9

# Start fresh
npm run dev
```

---

## 🔍 Test Redis Connection

Once restarted, test the endpoints:

```bash
# Health check
curl http://localhost:3000/api/init

# Should return:
{"status":"ok","message":"Redis connected"}
```

If it returns `"status":"error"`, continue troubleshooting below.

---

## 🐛 Common Issues

### Issue 1: Wrong Redis URL Format

**Vercel KV format**:
```
redis://default:AbCd1234...@redis-host.vercel.com:6379
```

**Upstash format**:
```
rediss://default:AbCd1234...@redis-host.upstash.io:6379
```

Note: Upstash uses `rediss://` (with double 's' for TLS)

### Issue 2: TLS/SSL Required

Some Redis providers (like Upstash) require TLS. Our `lib/redis.ts` already handles this:

```typescript
socket: {
  tls: true,
  rejectUnauthorized: false,
}
```

### Issue 3: Firewall/Network Issues

If using Vercel KV:
- Make sure you copied the URL from the **correct project**
- URL should include `:6379` port
- Should start with `redis://` (not `http://`)

---

## 🧪 Manual Redis Test

Create a test script to verify Redis connection:

```bash
cd vim-arcade-next
cat > test-redis.js << 'EOF'
const { createClient } = require('redis');

async function test() {
  const url = process.env.REDIS_URL || process.env.KV_URL;
  console.log('Testing connection to:', url?.split('@')[1] || 'undefined');
  
  const client = createClient({
    url,
    socket: { tls: true, rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    await client.ping();
    console.log('✅ Redis connected successfully!');
    await client.disconnect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
}

test();
EOF

node test-redis.js
```

---

## 🔧 Redis Client Configuration

If still having issues, modify `lib/redis.ts`:

**For Upstash (TLS required)**:
```typescript
client = createClient({
  url: redisUrl,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});
```

**For local Redis (no TLS)**:
```typescript
client = createClient({
  url: redisUrl,
  // No socket config needed
});
```

---

## 📝 Checklist

- [ ] File is named `.env.local` (not `.env`)
- [ ] `REDIS_URL` or `KV_URL` is set
- [ ] URL format is correct (`redis://` or `rediss://`)
- [ ] Dev server was restarted after changing `.env.local`
- [ ] API endpoint returns `{"status":"ok"}`

---

## 🎯 Expected Success Output

```bash
curl http://localhost:3000/api/init
# {"status":"ok","message":"Redis connected"}

curl -X POST http://localhost:3000/api/player \
  -H "Content-Type: application/json" \
  -d '{"username":"test","score":10}'
# {"username":"test","times_played":1,"highest_score":10}

curl http://localhost:3000/api/scores
# [{"username":"test","times_played":1,"highest_score":10}]
```

---

## 🆘 Still Not Working?

### Option 1: Check Logs
Look at the dev server console output for detailed error messages.

### Option 2: Verify Redis Provider
- Vercel KV: Check dashboard at vercel.com/storage
- Upstash: Check console at console.upstash.com
- Make sure database is running and accessible

### Option 3: Use localStorage Fallback
The game will work without Redis (uses localStorage), but scores won't persist across devices.

---

**Next Step**: Restart `npm run dev` and test `/api/init` endpoint.

