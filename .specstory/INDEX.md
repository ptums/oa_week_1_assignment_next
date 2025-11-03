# Vim Arcade - Documentation Index

**Project**: Vim Arcade (Next.js 15)  
**Last Updated**: November 2, 2025

---

## 📚 Navigation

### 🎯 Core Specifications
Technical specs for major features and systems.

- [Game Engine](./specs/game-engine.md) - Vim buffer operations and command simulation
- [API Routes](./specs/api-routes.md) - Next.js serverless functions and Redis integration
- [UI Components](./specs/ui-components.md) - React components, animations, and styling
- [Game Flow](./specs/game-flow.md) - State management and game logic

---

### 🔄 Updates & Migrations
Recent changes, migrations, and improvements.

- [Paste Question Fix](./updates/PASTE_QUESTION_FIX.md) - Fixed broken standalone paste question 🐛 **NEW**
- [New Vim Challenges Added](./updates/NEW_CHALLENGES_ADDED.md) - 10 new questions (hjkl navigation, counts) ✨
- [Challenges Summary](./updates/CHALLENGES_SUMMARY.md) - Complete breakdown of all questions ✨
- [Next.js 15 Migration Plan](./updates/NEXT_MIGRATION_PLAN.md) - Detailed migration steps from Vite
- [Migration Complete](./updates/MIGRATION_COMPLETE.md) - Full migration summary
- [Redis Connection Fix](./updates/REDIS_CONNECTION_FIX.md) - TLS protocol configuration

---

### 📖 Guides & Troubleshooting
Setup instructions, how-tos, and problem solving.

- [Redis Troubleshooting](./guides/REDIS_TROUBLESHOOTING.md) - Connection and configuration issues
- [Deployment Guide](./guides/DEPLOYMENT.md) - Deploy to Vercel with Redis

---

## 🚀 Quick Start

### For New Developers
1. Read [README](../README.md) for project overview
2. Review [Game Engine Spec](./specs/game-engine.md) to understand core logic
3. Check [API Routes Spec](./specs/api-routes.md) for backend structure
4. See [Migration Complete](./updates/MIGRATION_COMPLETE.md) for current state

### For Troubleshooting
1. Start with [Redis Troubleshooting](./guides/REDIS_TROUBLESHOOTING.md)
2. Check recent updates in [updates/](./updates/)
3. Review [Deployment Guide](./guides/DEPLOYMENT.md) for production issues

---

## 📂 File Organization

```
.specstory/
├── README.md                           # Documentation guide
├── INDEX.md                            # This file - navigation hub
│
├── specs/                              # Core specifications
│   ├── game-engine.md                  # Vim simulation logic
│   ├── api-routes.md                   # Serverless API functions
│   ├── ui-components.md                # React components
│   └── game-flow.md                    # State and game loop
│
├── updates/                            # Changes & migrations
│   ├── NEXT_MIGRATION_PLAN.md          # Migration planning
│   ├── MIGRATION_COMPLETE.md           # Migration summary
│   └── REDIS_CONNECTION_FIX.md         # Redis TLS fix
│
└── guides/                             # How-to guides
    ├── REDIS_TROUBLESHOOTING.md        # Redis setup help
    └── DEPLOYMENT.md                   # Deployment instructions
```

---

## 🔍 Search Tips

### Find by keyword:
```bash
grep -r "keyword" .specstory/
```

### Find in specs only:
```bash
grep -r "keyword" .specstory/specs/
```

### List all files:
```bash
find .specstory -name "*.md"
```

---

## 📊 Documentation Coverage

| Area | Status | Docs |
|------|--------|------|
| **Game Engine** | ✅ Complete | [specs/game-engine.md](./specs/game-engine.md) |
| **API Routes** | ✅ Complete | [specs/api-routes.md](./specs/api-routes.md) |
| **UI Components** | ⏳ In Progress | [specs/ui-components.md](./specs/ui-components.md) |
| **Deployment** | ⏳ In Progress | [guides/DEPLOYMENT.md](./guides/DEPLOYMENT.md) |

---

**Start Exploring**: Pick a section above or check [README.md](./README.md) for an overview!

