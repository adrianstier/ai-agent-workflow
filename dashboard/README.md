# AI Agent Dashboard

**A full-stack web application for orchestrating AI agents to build products**

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## Features

- 🤖 **10 Specialized Agents** - Problem Framing, Product Management, UX Design, Architecture, Engineering, QA, DevOps, Analytics
- 📊 **Visual Dashboard** - Track project progress, agent executions, and artifacts
- 💬 **Chat Interface** - Interact with agents conversationally
- 📁 **Artifact Management** - Version control for all planning documents
- 📈 **Analytics** - Track costs, time, and agent performance
- 🔄 **Real-time Updates** - WebSocket-based live agent execution
- 🎯 **Multi-Project** - Manage multiple products simultaneously

## Architecture

```
Frontend (Next.js)  ←→  Backend (Express)  ←→  Database (PostgreSQL)
        ↓                      ↓                        ↓
   Dashboard UI          Agent Orchestrator        Project State
   Chat Interface        LangGraph Runtime         Artifacts
   Analytics             Claude API Client         Execution Logs
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed system design.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Shadcn UI** - Beautiful component library
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js + Express** - Web server
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **LangGraph** - Agent orchestration
- **Anthropic SDK** - Claude API client
- **BullMQ** - Job queue for async tasks
- **Socket.io** - WebSocket server

### Infrastructure
- **PostgreSQL** - Relational database
- **Redis** - Job queue and caching
- **Vercel** - Frontend hosting (optional)
- **Railway** - Backend + DB hosting (optional)

## Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL 14+** (or use Docker)
- **Redis 6+** (or use Docker)
- **Anthropic API Key** (get from https://console.anthropic.com)

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
cd /path/to/sass-agent-workflow/dashboard

# Install dependencies
npm run setup

# This installs:
# - Root dependencies (concurrently)
# - Frontend dependencies (Next.js, React, etc.)
# - Backend dependencies (Express, Prisma, etc.)
```

### 2. Set Up Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agent_dashboard"

# Redis (for job queue)
REDIS_URL="redis://localhost:6379"

# Anthropic API
ANTHROPIC_API_KEY="sk-ant-..."

# Server
PORT=4000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

**Frontend (.env.local)**
```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"
```

### 3. Start Database (Docker)

```bash
# From dashboard/ directory
docker-compose up -d

# This starts:
# - PostgreSQL on port 5432
# - Redis on port 6379
```

**Or manually:**
```bash
# PostgreSQL
brew install postgresql@14
brew services start postgresql@14
createdb agent_dashboard

# Redis
brew install redis
brew services start redis
```

### 4. Run Database Migrations

```bash
cd backend
npm run db:generate
npm run db:migrate
```

### 5. Start Development Servers

```bash
# From dashboard/ directory
npm run dev

# This starts:
# - Frontend on http://localhost:3000
# - Backend on http://localhost:4000
```

### 6. Open Dashboard

Navigate to **http://localhost:3000**

## Project Structure

```
dashboard/
├── backend/                    # Backend API
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── agents/            # Agent runtime & orchestration
│   │   │   ├── orchestrator.ts
│   │   │   ├── agent-loader.ts
│   │   │   └── executors/     # Individual agent executors
│   │   ├── api/               # REST API routes
│   │   │   ├── routes.ts
│   │   │   ├── projects.ts
│   │   │   ├── artifacts.ts
│   │   │   ├── executions.ts
│   │   │   └── ...
│   │   ├── services/          # Business logic
│   │   │   ├── claude.ts      # Claude API client
│   │   │   ├── websocket.ts   # WebSocket handlers
│   │   │   └── artifact.ts    # Artifact management
│   │   ├── jobs/              # Background jobs (BullMQ)
│   │   │   ├── queue.ts
│   │   │   └── workers/
│   │   ├── models/            # TypeScript types
│   │   ├── utils/             # Utilities
│   │   │   ├── logger.ts
│   │   │   └── validation.ts
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend app
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── page.tsx       # Home / dashboard
│   │   │   ├── projects/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Project detail
│   │   │   │       ├── agents/       # Agent execution
│   │   │   │       ├── artifacts/    # Artifact viewer
│   │   │   │       └── analytics/    # Analytics
│   │   │   └── layout.tsx     # Root layout
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Shadcn UI components
│   │   │   ├── dashboard/     # Dashboard-specific
│   │   │   ├── agents/        # Agent cards, controls
│   │   │   ├── artifacts/     # Artifact viewer
│   │   │   └── chat/          # Chat interface
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts         # API client
│   │   │   ├── socket.ts      # Socket.io client
│   │   │   └── utils.ts       # Helpers
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useProjects.ts
│   │   │   ├── useAgents.ts
│   │   │   └── useWebSocket.ts
│   │   └── types/             # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── docker-compose.yml          # PostgreSQL + Redis
├── package.json                # Root workspace config
├── ARCHITECTURE.md             # System architecture
└── README.md                   # This file
```

## Usage

### Creating a Project

1. Click "New Project" on dashboard
2. Enter project name and description
3. Set constraints (timeline, budget, tech preferences)
4. Click "Create"

### Running an Agent

1. Open your project
2. Click on an agent card (e.g., "Agent 1: Problem Framer")
3. Provide inputs in the chat interface
4. Click "Execute Agent"
5. Watch real-time progress in the UI
6. Review generated artifacts

### Viewing Artifacts

1. Navigate to project → Artifacts tab
2. Click on any artifact to view
3. See version history
4. Edit or export as needed
5. Lock artifact when ready to proceed

### Multi-Agent Workflow

```
1. Run Agent 0 (Orchestrator)
   ↓ Recommends starting with Agent 1

2. Run Agent 1 (Problem Framer)
   ↓ Generates Problem Brief

3. Review & approve Problem Brief
   ↓

4. Run Agent 2 (Competitive Mapper)
   ↓ Generates Competitive Analysis

5. Continue through agents...
```

## API Documentation

### Projects

```
GET    /api/projects                 # List all projects
POST   /api/projects                 # Create project
GET    /api/projects/:id             # Get project
PUT    /api/projects/:id             # Update project
DELETE /api/projects/:id             # Delete project
```

### Agents

```
POST   /api/projects/:id/agents/:agentId/execute
  Body: {
    input: {
      context: string
      constraints: object
    }
  }
  Response: {
    executionId: string
    status: 'queued'
  }
```

### Artifacts

```
GET    /api/projects/:id/artifacts   # List artifacts
GET    /api/artifacts/:id            # Get artifact
PUT    /api/artifacts/:id            # Update artifact
```

### WebSocket Events

```typescript
// Client → Server
socket.emit('agent:execute', {
  projectId: string
  agentId: number
  input: object
});

// Server → Client
socket.on('agent:progress', (data) => {
  // { executionId, progress, currentStep }
});

socket.on('agent:completed', (data) => {
  // { executionId, artifacts, output }
});
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Open Prisma Studio (DB GUI)
npm run db:studio
```

### Linting

```bash
# Lint all
npm run lint

# Lint frontend only
npm run lint:frontend

# Lint backend only
npm run lint:backend
```

## Deployment

### Option 1: Vercel + Railway (Recommended)

**Frontend (Vercel):**
```bash
cd frontend
vercel deploy

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api.railway.app
# NEXT_PUBLIC_WS_URL=wss://your-api.railway.app
```

**Backend (Railway):**
```bash
cd backend
railway login
railway init
railway up

# Add environment variables in Railway dashboard:
# DATABASE_URL (auto-generated by Railway PostgreSQL)
# REDIS_URL (auto-generated by Railway Redis)
# ANTHROPIC_API_KEY
# FRONTEND_URL=https://your-app.vercel.app
```

### Option 2: Docker

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into server
ssh user@your-server.com

# Clone repo
git clone https://github.com/yourusername/ai-agent-dashboard.git
cd ai-agent-dashboard/dashboard

# Install dependencies
npm run setup

# Set up environment variables
# (copy .env.example files and edit)

# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js
```

## Configuration

### Agent Prompts

Agent prompts are loaded from `../agents/agent-X-name.md` files. To customize:

1. Edit the agent markdown file
2. Restart backend (prompts are cached on startup)
3. Or use hot-reload (set `HOT_RELOAD_AGENTS=true` in .env)

### Cost Limits

Set per-project cost limits in `backend/.env`:
```bash
MAX_COST_PER_EXECUTION=1.00  # USD
DAILY_COST_LIMIT=10.00       # USD per project
```

## Troubleshooting

### "Database connection failed"
```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL in backend/.env
echo $DATABASE_URL

# Run migrations
cd backend && npm run db:migrate
```

### "Agent execution stuck"
```bash
# Check Redis is running
redis-cli ping
# Should return "PONG"

# Check job queue
cd backend
npm run jobs:list
```

### "WebSocket not connecting"
```bash
# Check CORS settings in backend/src/index.ts
# Check FRONTEND_URL in backend/.env matches your frontend URL
# Check firewall allows WebSocket connections
```

### "Out of memory"
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## Cost Estimation

### API Costs (Anthropic Claude)
- **Input**: ~$0.003 per 1K tokens
- **Output**: ~$0.015 per 1K tokens

**Per agent execution:**
- Agent 1 (Problem Framer): ~5K tokens = $0.05
- Agent 3 (PRD Writer): ~10K tokens = $0.10
- Agent 5 (Architect): ~8K tokens = $0.08
- **Full v0.1 workflow (all 10 agents)**: ~$2-5

### Infrastructure Costs (Monthly)
- **Vercel**: $0 (Hobby) or $20 (Pro)
- **Railway**: ~$15-25 (backend + DB + Redis)
- **Total**: ~$15-45/month

### Scaling Costs (100 users, 10 projects/user/month)
- **API**: ~$2-5 per project × 1000 projects = $2K-5K/month
- **Infrastructure**: ~$100-200/month (scaled services)
- **Total**: ~$2.1K-5.2K/month

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file

## Support

- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/yourusername/ai-agent-dashboard/issues
- **Discussions**: https://github.com/yourusername/ai-agent-dashboard/discussions

## Roadmap

### v0.1 (Current)
- [x] Basic project management
- [x] Single agent execution
- [x] Artifact storage
- [ ] Complete all 10 agents
- [ ] WebSocket real-time updates

### v0.2 (Next)
- [ ] Multi-agent workflows
- [ ] Artifact versioning
- [ ] Cost tracking dashboard
- [ ] Export functionality
- [ ] GitHub integration

### v1.0 (Future)
- [ ] Team collaboration
- [ ] Custom agent prompts
- [ ] Agent marketplace
- [ ] Advanced analytics
- [ ] Mobile app

## Credits

**Built with:**
- [Next.js](https://nextjs.org)
- [Anthropic Claude](https://anthropic.com)
- [LangGraph](https://github.com/langchain-ai/langgraph)
- [Shadcn UI](https://ui.shadcn.com)

**Created by:** Adrian C. Stier

---

**Ready to build products with AI agents? 🚀**

```bash
npm run dev
```

Then visit **http://localhost:3000**
