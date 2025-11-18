# Getting Started with AI Agent Dashboard

## What Is This?

The AI Agent Dashboard is a full-stack web application that lets you build software products using 10 specialized AI agents. Instead of manually prompting Claude/ChatGPT for each step, the dashboard:

- **Orchestrates agents** automatically
- **Manages project state** across the entire lifecycle
- **Generates artifacts** (PRDs, architecture docs, code, etc.)
- **Tracks costs** and performance
- **Provides a beautiful UI** for the entire workflow

## Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[QUICK_START_DASHBOARD.md](QUICK_START_DASHBOARD.md)** | Get running in 10 minutes | 5 min |
| [README.md](README.md) | Full documentation | 20 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design deep-dive | 30 min |
| [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) | Build guide (for developers) | 1 hour |

## Two Paths

### Path 1: Use the Dashboard (Quickest)

**Time:** 10 minutes to set up, then start building

```bash
# 1. Install dependencies
cd dashboard
npm run setup

# 2. Start database
docker-compose up -d

# 3. Set up environment
cd backend && cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# 4. Run migrations
npm run db:migrate

# 5. Start dashboard
cd .. && npm run dev

# 6. Open http://localhost:3000
```

Then follow the in-app tutorial to create your first project!

**Best for:**
- Non-developers who want to use AI agents
- Quick prototyping
- Testing the agent workflow

### Path 2: Build the Dashboard (For Developers)

**Time:** 4-5 weeks to full implementation

Follow [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) to:
1. Set up infrastructure (Week 1)
2. Implement agent runtime (Week 2)
3. Build real-time UI (Week 3)
4. Add all 10 agents (Week 4)
5. Polish & deploy (Week 5+)

**Best for:**
- Developers who want to customize
- Learning full-stack development
- Building a SaaS product

## What You'll Build

### Example: Building a Literature Review App

**Traditional approach (manual prompting):**
```
1. Open Claude
2. Paste Agent 1 prompt + your idea
3. Copy output to problem-brief.md
4. Open new chat
5. Paste Agent 2 prompt + problem brief
6. Copy output to competitive-analysis.md
7. Repeat 8 more times...
8. Manually track everything
```

**With the dashboard:**
```
1. Create project: "Literature Review App"
2. Click "Run Agent 1"
3. Answer questions in chat
4. Review Problem Brief (auto-saved)
5. Click "Run Agent 2"
6. Review Competitive Analysis (auto-saved)
7. Continue through agents...
8. Dashboard tracks everything, shows costs, manages versions
```

### What Gets Generated

After running all 10 agents, you'll have:

```
your-project/
├── artifacts/
│   ├── problem-brief-v0.1.md          ← Agent 1
│   ├── competitive-analysis-v0.1.md   ← Agent 2
│   ├── prd-v0.1.md                    ← Agent 3
│   ├── ux-flows-v0.1.md               ← Agent 4
│   ├── architecture-v0.1.md           ← Agent 5
│   ├── code/                          ← Agent 6
│   ├── test-plan-v0.1.md              ← Agent 7
│   ├── deployment-plan-v0.1.md        ← Agent 8
│   └── analytics-plan-v0.1.md         ← Agent 9
└── decisions/
    └── decision-log.md                # All major decisions
```

Plus:
- Cost tracking (per agent, per project)
- Execution history
- Chat logs
- Analytics

## Dashboard Features

### 1. Project Management
- Create multiple projects
- Set constraints (timeline, budget, tech stack)
- Track progress through stages (Discover → Design → Build → Deploy)

### 2. Agent Orchestration
- Visual agent cards showing status
- One-click execution
- Real-time progress updates
- Automatic artifact generation

### 3. Chat Interface
- Talk to agents naturally
- Multi-turn conversations
- Context-aware (agents see previous artifacts)
- Markdown rendering

### 4. Artifact Management
- Auto-save all outputs
- Version control (v0.1, v0.2, etc.)
- Inline editing
- Export to Markdown/PDF

### 5. Analytics Dashboard
- Cost per agent
- Time per phase
- Token usage
- Success rates

### 6. Real-time Collaboration (Future)
- Team projects
- Comments on artifacts
- Approval workflows

## How It Works

```
┌──────────────────────────────────────────────────┐
│  You: "I want to build a task management app"   │
└───────────────────┬──────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  Dashboard: Loads Agent 0 (Orchestrator)         │
│  Sends to Claude API with project context        │
└───────────────────┬──────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  Agent 0: "Let's start with Agent 1 to define    │
│  the problem. Here's what I'll ask..."           │
└───────────────────┬──────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  You: Click "Run Agent 1"                        │
└───────────────────┬──────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  Dashboard:                                       │
│  1. Creates execution record (database)           │
│  2. Loads Agent 1 prompt from file                │
│  3. Calls Claude API (streaming)                  │
│  4. Shows real-time response in UI                │
│  5. Parses output, extracts artifact              │
│  6. Saves Problem Brief to database + filesystem  │
│  7. Shows cost, tokens used, time taken           │
└───────────────────┬──────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  You: Review Problem Brief, make edits           │
│       Click "Lock Artifact"                       │
│       Click "Run Agent 2"                         │
└───────────────────┬──────────────────────────────┘
                    ↓
                   ...repeat through all agents...
```

## Technology Overview

### Frontend
- **Next.js 14**: Modern React framework
- **TypeScript**: Type-safe development
- **Shadcn UI**: Beautiful pre-built components
- **Tailwind CSS**: Utility-first styling
- **WebSocket**: Real-time updates

### Backend
- **Express.js**: Web server
- **Prisma**: Database ORM
- **BullMQ**: Job queue for async tasks
- **LangGraph**: Agent orchestration
- **Anthropic SDK**: Claude API client

### Database
- **PostgreSQL**: Relational database for structured data
- **Redis**: In-memory store for job queue

### Infrastructure
- **Docker**: Containerization for easy setup
- **Vercel**: Frontend hosting (optional)
- **Railway**: Backend + database hosting (optional)

## Cost Breakdown

### Development (Local)
- **Infrastructure**: $0 (Docker)
- **API Usage**: ~$2-5 per project (testing)
- **Total**: ~$2-5 one-time

### Production (Deployed)
- **Frontend**: $0-20/month (Vercel free tier or Pro)
- **Backend**: $15-25/month (Railway)
- **Database**: Included in Railway
- **API Usage**: $2-5 per project × N projects
- **Total**: ~$15-45/month + API costs

**Example:** 10 projects/month = $15-45 infra + $20-50 API = **$35-95/month**

## Prerequisites

### Required
- **Node.js 20+**: [Download](https://nodejs.org)
- **Docker Desktop**: [Download](https://docker.com/products/docker-desktop)
- **Anthropic API Key**: [Get Key](https://console.anthropic.com)

### Optional
- **Git**: For version control
- **VSCode**: Recommended editor
- **Cursor/Claude Code**: For AI-assisted development

## Installation Time

- **Setup**: 10 minutes
- **First agent execution**: 5 minutes
- **Full v0.1 workflow** (all 10 agents): 2-3 hours

## Learning Curve

| If You Are... | Time to Productivity |
|---------------|---------------------|
| **Non-technical** | 30 min (just use the UI) |
| **Product Manager** | 1 hour (understand agents) |
| **Frontend Developer** | 4 hours (customize UI) |
| **Full-Stack Developer** | 1 day (understand system) |
| **Never used Claude** | 2 hours (learn AI interaction) |

## Support & Community

### Documentation
- This folder contains all docs
- Start with QUICK_START_DASHBOARD.md
- Read README.md for full details
- Check ARCHITECTURE.md for system design

### Troubleshooting
- Common issues documented in QUICK_START
- Error messages include solutions
- Check backend logs for details

### Contributing
- Fork the repository
- Create feature branch
- Submit pull request
- See CONTRIBUTING.md (if created)

## Roadmap

### v0.1 (Current) - MVP
- [x] Project CRUD
- [x] Database schema
- [x] Basic UI structure
- [ ] Agent 1 execution
- [ ] All 10 agents
- [ ] Real-time updates
- [ ] Deploy to staging

### v0.2 - Enhanced
- [ ] Multi-agent workflows
- [ ] Artifact versioning
- [ ] Export functionality
- [ ] Analytics dashboard
- [ ] Cost tracking

### v1.0 - Production
- [ ] Team collaboration
- [ ] Custom agent prompts
- [ ] GitHub integration
- [ ] Mobile app
- [ ] Agent marketplace

## Frequently Asked Questions

**Q: Do I need to know how to code?**
A: No! Just use the dashboard UI. But developers can customize everything.

**Q: How much does it cost to run?**
A: Development is free (local). Production: ~$35-95/month depending on usage.

**Q: Can I use other LLMs besides Claude?**
A: Currently Claude only, but OpenAI support is planned.

**Q: Is my data private?**
A: Yes. Everything runs on your infrastructure. Anthropic sees API calls but not your data.

**Q: Can I customize agent prompts?**
A: Yes! Edit the markdown files in `../agents/`

**Q: Can multiple people use one dashboard?**
A: Currently single-user. Team features coming in v1.0.

**Q: Can I deploy this publicly?**
A: Yes! Follow deployment guide in README.md

**Q: What if an agent makes a mistake?**
A: Edit the artifact manually or re-run the agent with different inputs.

## Next Steps

Choose your path:

### Just Want to Use It?
→ Open [QUICK_START_DASHBOARD.md](QUICK_START_DASHBOARD.md)

### Want to Understand How It Works?
→ Open [README.md](README.md)

### Want to Build/Customize It?
→ Open [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)

### Want to See the Architecture?
→ Open [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Let's build products with AI! 🚀**
