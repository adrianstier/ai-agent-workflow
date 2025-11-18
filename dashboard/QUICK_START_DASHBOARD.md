# Quick Start: AI Agent Dashboard

**Get the dashboard running in 10 minutes**

## What You'll Build

A full-stack web application that:
- ✅ Manages AI projects
- ✅ Executes 10 specialized AI agents
- ✅ Generates product artifacts (PRDs, architecture, etc.)
- ✅ Provides real-time execution updates
- ✅ Tracks costs and analytics

## Prerequisites

Install these first:

```bash
# 1. Node.js 20+ (check version)
node --version  # Should be v20.0.0 or higher

# 2. Docker Desktop (for PostgreSQL + Redis)
# Download from: https://www.docker.com/products/docker-desktop

# 3. Git
git --version
```

## Step 1: Get the Code

```bash
# Navigate to the dashboard directory
cd /Users/adrianstiermbp2023/Desktop/sass-agent-workflow/dashboard

# Verify you're in the right place
ls
# Should see: README.md, package.json, backend/, frontend/, etc.
```

## Step 2: Install Dependencies

```bash
# Install all dependencies (root + backend + frontend)
npm run setup

# This will take 2-3 minutes
# You should see:
# ✓ Root dependencies installed
# ✓ Backend dependencies installed
# ✓ Frontend dependencies installed
```

## Step 3: Set Up Environment Variables

### Backend Environment

```bash
cd backend
cp .env.example .env
```

**Edit `backend/.env`:**

```bash
# Open in your editor
code .env
# or
nano .env
```

**Required changes:**
1. **ANTHROPIC_API_KEY**: Get from https://console.anthropic.com
   ```
   ANTHROPIC_API_KEY="sk-ant-your-key-here"
   ```

2. **DATABASE_URL**: Already set for Docker (no change needed)
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agent_dashboard"
   ```

3. **REDIS_URL**: Already set for Docker (no change needed)
   ```
   REDIS_URL="redis://localhost:6379"
   ```

Save and close.

### Frontend Environment

```bash
cd ../frontend
cp .env.example .env.local
```

No changes needed unless you change ports.

## Step 4: Start Database

```bash
# From the dashboard/ directory
cd ..
docker-compose up -d

# Wait 10 seconds for PostgreSQL to fully start
sleep 10

# Verify services are running
docker-compose ps
# Should show:
# agent-dashboard-db     running   0.0.0.0:5432->5432/tcp
# agent-dashboard-redis  running   0.0.0.0:6379->6379/tcp
```

## Step 5: Set Up Database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# You should see:
# ✓ Database schema created
# ✓ Applied 1 migration
```

## Step 6: Start the Dashboard

```bash
# From the dashboard/ directory
cd ..
npm run dev

# This starts:
# - Backend on http://localhost:4000
# - Frontend on http://localhost:3000

# Wait for both to finish starting (~30 seconds)
# You should see:
# 🚀 Backend: Server running on port 4000
# ✓ Frontend: Ready on http://localhost:3000
```

## Step 7: Open the Dashboard

Open your browser to:

**http://localhost:3000**

You should see the AI Agent Dashboard!

## What to Do Next

### 1. Create Your First Project

1. Click "**New Project**"
2. Enter:
   - **Name**: "My First Product"
   - **Description**: "Testing the agent workflow"
   - **Timeline**: "4 weeks"
   - **Budget**: "$0"
3. Click "**Create Project**"

### 2. Run Your First Agent

1. Click on your project
2. Find "**Agent 0: Orchestrator**"
3. Click "**Run Agent**"
4. In the chat box, type:
   ```
   I want to build a simple task management app for solo developers.
   What should I do first?
   ```
5. Click "**Execute**"
6. Watch the agent respond in real-time!

### 3. Explore the Dashboard

- **Projects Tab**: See all your projects
- **Agents Tab**: View all 10 agents
- **Artifacts Tab**: See generated documents
- **Analytics Tab**: Track costs and performance

## Troubleshooting

### "Cannot connect to database"

```bash
# Check Docker is running
docker-compose ps

# If not running, start it
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### "Port 3000 already in use"

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change the port in frontend
# Edit frontend/package.json:
# "dev": "next dev -p 3001"
```

### "ANTHROPIC_API_KEY not set"

```bash
# Make sure you edited backend/.env
cat backend/.env | grep ANTHROPIC

# Should show:
# ANTHROPIC_API_KEY="sk-ant-..."

# If blank, edit the file:
cd backend
nano .env
# Add your API key
```

### "Agent execution failed"

Check backend logs:
```bash
# Backend terminal should show error details
# Common issues:
# 1. Invalid API key → Check backend/.env
# 2. Out of credits → Add credits to Anthropic account
# 3. Rate limit → Wait a minute and retry
```

## Verify Everything Works

### Backend Health Check

```bash
curl http://localhost:4000/health

# Should return:
# {"status":"ok","timestamp":"2025-..."}
```

### Database Connection

```bash
cd backend
npm run db:studio

# Opens Prisma Studio in browser
# You should see your database tables
```

### Frontend

Visit http://localhost:3000/api/health (if you added the endpoint)

## Development Workflow

### Making Changes

**Backend:**
```bash
cd backend
# Edit files in src/
# Server auto-restarts (nodemon)
```

**Frontend:**
```bash
cd frontend
# Edit files in src/
# Browser auto-refreshes (Fast Refresh)
```

### Viewing Logs

**Backend:**
```bash
# Logs appear in terminal where you ran `npm run dev`
# Look for lines like:
# [INFO] Agent execution started
# [DEBUG] Calling Claude API
```

**Frontend:**
```bash
# Open browser DevTools (F12)
# Check Console tab
```

### Database GUI

```bash
cd backend
npm run db:studio

# Opens at http://localhost:5555
# Browse all tables
# View and edit data
```

## Next Steps

### Implement More Agents

Currently, only basic infrastructure is set up. To add agent functionality:

1. **Read the implementation roadmap:**
   ```bash
   cat IMPLEMENTATION_ROADMAP.md
   ```

2. **Start with Phase 2** (Agent Runtime)
   - Implement agent loader
   - Integrate Claude API
   - Create execution flow

3. **Follow the step-by-step guide** in the roadmap

### Customize Agent Prompts

```bash
# Agent prompts are in:
cd ../agents

# Edit any agent file:
nano agent-1-problem-framer.md

# If HOT_RELOAD_AGENTS=true in backend/.env,
# changes are picked up automatically
```

### Deploy to Production

See README.md for deployment options:
- Vercel + Railway (recommended)
- Docker
- VPS

## Common Tasks

### Reset Database

```bash
cd backend
npm run db:push --force-reset

# WARNING: This deletes all data!
```

### Add New Database Table

```bash
# 1. Edit backend/prisma/schema.prisma
# 2. Create migration
npm run db:migrate

# 3. Regenerate Prisma client
npm run db:generate
```

### Update Dependencies

```bash
# Update all packages
npm run setup

# Or update individually
cd backend && npm update
cd frontend && npm update
```

### Stop Everything

```bash
# Stop dev servers: Ctrl+C in terminal

# Stop Docker
docker-compose down

# Stop and remove data
docker-compose down -v
```

## Architecture Overview

```
Browser (You)
    ↓
Frontend (Next.js on :3000)
    ↓ HTTP/WebSocket
Backend (Express on :4000)
    ↓
┌────────────┬─────────────┐
│ PostgreSQL │   Redis     │
│  (:5432)   │  (:6379)    │
└────────────┴─────────────┘
    ↓
Anthropic API (Claude)
```

## Cost Tracking

**API Costs (Anthropic):**
- Input tokens: ~$0.003 per 1K
- Output tokens: ~$0.015 per 1K

**Typical agent execution:**
- Problem Framer: ~$0.05
- PRD Writer: ~$0.10
- Full workflow: ~$2-5

**Infrastructure:**
- Development: $0 (local Docker)
- Production: ~$15-45/month (Vercel + Railway)

## Getting Help

### Documentation
- **Full README**: `cat README.md`
- **Architecture**: `cat ARCHITECTURE.md`
- **Roadmap**: `cat IMPLEMENTATION_ROADMAP.md`

### Debug Mode

```bash
# Backend: Set LOG_LEVEL=debug in backend/.env
LOG_LEVEL=debug

# Restart backend
# You'll see much more detailed logs
```

### Common Issues

1. **Port conflicts**: Change ports in package.json
2. **Database errors**: Check Docker is running
3. **API errors**: Verify ANTHROPIC_API_KEY
4. **CORS errors**: Check FRONTEND_URL in backend/.env

## Success Checklist

You've successfully set up the dashboard if:

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads
- [ ] http://localhost:4000/health returns OK
- [ ] You can create a project
- [ ] Database shows data in Prisma Studio
- [ ] Docker containers are running

## What You Have Now

✅ Full-stack TypeScript application
✅ PostgreSQL database with schema
✅ Redis for job queue
✅ Express backend with API
✅ Next.js frontend with UI
✅ WebSocket for real-time updates
✅ Agent orchestration infrastructure

## What's Next

📋 Implement agent execution logic (Phase 2)
🎨 Build dashboard UI (Phase 3)
🤖 Add all 10 agents (Phase 4)
📊 Add analytics (Phase 5)

**Follow IMPLEMENTATION_ROADMAP.md for detailed steps!**

---

**Dashboard is running! 🚀**

Visit: **http://localhost:3000**

Questions? Check README.md or ARCHITECTURE.md
