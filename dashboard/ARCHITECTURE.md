# Agent Dashboard Architecture

## Overview

A full-stack web application that orchestrates the 10 AI agents, manages project state, and provides a visual interface for building products with AI.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (User)                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Frontend (React + TypeScript)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Dashboard UI                                     │  │
│  │  - Project Overview                               │  │
│  │  - Agent Controls                                 │  │
│  │  - Artifact Viewer                                │  │
│  │  - Chat Interface                                 │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls (REST + WebSocket)
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Backend (Node.js + TypeScript)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Agent Orchestrator                               │  │
│  │  - Agent Lifecycle Management                     │  │
│  │  - Task Routing                                   │  │
│  │  - State Management                               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Agent Runtime                                    │  │
│  │  - LangGraph Integration                          │  │
│  │  - Claude API Client                              │  │
│  │  - Artifact Generator                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────┬─────────────────┬──────────────────────────────┘
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │   File System   │
│  (State + Logs) │  │   (Artifacts)   │
└─────────────────┘  └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  - Anthropic API (Claude)                                │
│  - OpenAI API (GPT-4, optional)                          │
│  - GitHub API (for code commits, optional)               │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Real-time**: WebSocket (Socket.io client)
- **Charts**: Recharts (for analytics visualization)
- **Code Display**: Monaco Editor (VS Code editor)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Agent Framework**: LangGraph
- **LLM Client**: Anthropic SDK (@anthropic-ai/sdk)
- **Database**: PostgreSQL (via Prisma ORM)
- **Real-time**: Socket.io
- **File Storage**: Local filesystem (can extend to S3)
- **Job Queue**: BullMQ (for async agent tasks)
- **Validation**: Zod

### DevOps
- **Hosting**: Vercel (frontend) + Railway (backend + DB)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (errors) + PostHog (analytics)
- **Logging**: Winston + Better Stack

## Data Models

### Core Entities

```typescript
// Project
{
  id: string (uuid)
  name: string
  description: string
  version: string (e.g., "0.1")
  stage: 'discover' | 'design' | 'build' | 'test' | 'deploy' | 'analyze'
  status: 'active' | 'paused' | 'completed' | 'archived'
  constraints: {
    timeline: string
    budget: string
    techStack: Record<string, string>
  }
  createdAt: timestamp
  updatedAt: timestamp
}

// Artifact
{
  id: string (uuid)
  projectId: string (FK)
  agentId: number (0-9)
  type: 'problem-brief' | 'competitive-analysis' | 'prd' | 'ux-flows' | 'architecture' | 'code' | 'test-plan' | 'deployment-plan' | 'analytics-plan'
  version: string (e.g., "0.1")
  status: 'draft' | 'review' | 'locked' | 'archived'
  content: text (markdown or JSON)
  metadata: jsonb
  createdAt: timestamp
  updatedAt: timestamp
}

// AgentExecution
{
  id: string (uuid)
  projectId: string (FK)
  agentId: number (0-9)
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  input: jsonb
  output: jsonb
  artifacts: string[] (artifact IDs)
  duration: number (ms)
  tokensUsed: number
  cost: number (USD)
  error: text (nullable)
  createdAt: timestamp
  completedAt: timestamp
}

// Message (chat history)
{
  id: string (uuid)
  projectId: string (FK)
  executionId: string (FK, nullable)
  role: 'user' | 'agent' | 'system'
  agentId: number (nullable)
  content: text
  metadata: jsonb
  createdAt: timestamp
}

// Decision
{
  id: string (uuid)
  projectId: string (FK)
  title: string
  context: text
  decision: text
  reasoning: text
  alternatives: text
  tradeoffs: text
  reversible: boolean
  createdAt: timestamp
}
```

## API Design

### REST Endpoints

```
# Projects
GET    /api/projects                     → List all projects
POST   /api/projects                     → Create new project
GET    /api/projects/:id                 → Get project details
PUT    /api/projects/:id                 → Update project
DELETE /api/projects/:id                 → Delete project

# Artifacts
GET    /api/projects/:id/artifacts       → List project artifacts
GET    /api/artifacts/:id                → Get artifact details
PUT    /api/artifacts/:id                → Update artifact
DELETE /api/artifacts/:id                → Delete artifact

# Agent Execution
POST   /api/projects/:id/agents/:agentId/execute  → Execute agent
GET    /api/projects/:id/executions      → List executions
GET    /api/executions/:id               → Get execution details
POST   /api/executions/:id/cancel        → Cancel running execution

# Chat
GET    /api/projects/:id/messages        → Get chat history
POST   /api/projects/:id/messages        → Send message

# Decisions
GET    /api/projects/:id/decisions       → List decisions
POST   /api/projects/:id/decisions       → Log decision
PUT    /api/decisions/:id                → Update decision
DELETE /api/decisions/:id                → Delete decision

# Analytics
GET    /api/projects/:id/stats           → Get project statistics
GET    /api/analytics                    → Get global analytics
```

### WebSocket Events

```typescript
// Client → Server
{
  'agent:execute': { projectId, agentId, input }
  'agent:cancel': { executionId }
  'message:send': { projectId, content }
}

// Server → Client
{
  'agent:started': { executionId, agentId }
  'agent:progress': { executionId, progress, currentStep }
  'agent:completed': { executionId, artifacts, output }
  'agent:failed': { executionId, error }
  'message:received': { message }
  'artifact:updated': { artifactId, content }
}
```

## Agent Orchestration Flow

### 1. User Initiates Agent Execution
```
User clicks "Run Agent 1 (Problem Framer)"
  ↓
Frontend sends POST /api/projects/:id/agents/1/execute
  ↓
Backend creates AgentExecution record (status: queued)
  ↓
Job added to BullMQ queue
  ↓
Response: { executionId }
```

### 2. Agent Execution (Background Job)
```
BullMQ worker picks up job
  ↓
Load agent prompt from agents/agent-1-problem-framer.md
  ↓
Load project context (previous artifacts, constraints)
  ↓
Build LangGraph agent with:
  - System prompt
  - Context (previous artifacts)
  - Tools (if needed)
  ↓
Stream execution to Claude API
  ↓
WebSocket: Send progress updates to client
  ↓
Parse output, extract artifacts
  ↓
Save artifacts to database + filesystem
  ↓
Update AgentExecution (status: completed)
  ↓
WebSocket: Send completion event
```

### 3. Multi-Agent Workflows (Advanced)
```
User: "Run full discovery phase"
  ↓
Orchestrator creates workflow:
  1. Agent 1 (Problem Framer)
  2. Wait for user approval
  3. Agent 2 (Competitive Mapper)
  4. Wait for user approval
  5. Agent 0 (Orchestrator) - recommend next steps
  ↓
Execute sequentially with human-in-the-loop checkpoints
```

## Key Features

### 1. Project Dashboard
- **Overview**: Current stage, progress, next steps
- **Timeline**: Visual project timeline
- **Artifacts**: Grid view of all artifacts with status
- **Activity Feed**: Recent agent executions, decisions

### 2. Agent Control Panel
- **Agent Cards**: Visual representation of all 10 agents
- **Status Indicators**: Idle, running, completed
- **Quick Actions**: "Run Agent", "View Output", "Retry"
- **Dependencies**: Visual graph showing agent dependencies

### 3. Artifact Viewer
- **Markdown Renderer**: Display artifacts with formatting
- **Version History**: Compare versions (v0.1 vs v0.2)
- **Inline Editing**: Edit artifacts directly
- **Export**: Download as .md or PDF

### 4. Chat Interface
- **Conversational UI**: Talk to agents naturally
- **Context Awareness**: Agents see previous artifacts
- **Suggestions**: Quick actions ("Run Agent 3", "Review PRD")
- **Multi-turn**: Iterate on agent output

### 5. Analytics & Insights
- **Cost Tracking**: Track API costs per agent, per project
- **Time Tracking**: How long each phase takes
- **Quality Metrics**: Artifacts locked vs revised
- **Agent Performance**: Success rate, avg tokens used

### 6. Collaboration (Future)
- **Team Projects**: Multiple users on one project
- **Comments**: Discuss artifacts inline
- **Approvals**: Review workflow for artifact locking

## Security

### Authentication
- **Auth Provider**: Clerk
- **Session Management**: JWT tokens
- **API Keys**: Encrypted in database

### Authorization
- **Project Ownership**: Users can only access their projects
- **API Key Isolation**: Each user's Anthropic key is separate
- **Rate Limiting**: Per-user API limits

### Data Protection
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: HTTPS/WSS
- **Secrets Management**: Environment variables (never committed)

## Deployment Architecture

### Development
```
localhost:3000 (Frontend - Next.js dev server)
localhost:4000 (Backend - Express + nodemon)
localhost:5432 (PostgreSQL - Docker)
localhost:6379 (Redis - Docker, for BullMQ)
```

### Production
```
Frontend: Vercel (auto-deploy from main branch)
Backend: Railway (Docker container)
Database: Railway PostgreSQL
Redis: Railway Redis
Monitoring: Sentry + PostHog
Logs: Better Stack
```

## Performance Considerations

### Caching
- **Agent Prompts**: Cache in memory (rarely change)
- **Artifacts**: Cache frequently accessed artifacts (Redis)
- **API Responses**: Cache static project lists

### Optimization
- **Streaming**: Stream agent responses via WebSocket
- **Pagination**: Paginate message history, execution logs
- **Lazy Loading**: Load artifacts on demand
- **Code Splitting**: Split frontend by route

### Scalability
- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Job Queue**: Distributed job processing with BullMQ
- **Database**: Connection pooling, read replicas (if needed)

## Monitoring & Observability

### Metrics to Track
- **Agent Executions**: Count, duration, success rate
- **API Costs**: Total spend, per-agent breakdown
- **User Activity**: Projects created, agents run
- **Errors**: Failed executions, API errors

### Alerts
- **High Error Rate**: > 10% agent executions fail
- **High Costs**: Daily spend > $X threshold
- **Performance**: Agent execution > 2 minutes
- **System Health**: Backend down, database issues

## Development Roadmap

### Phase 1: MVP (2 weeks)
- [ ] Basic project CRUD
- [ ] Single agent execution (Agent 1)
- [ ] Simple chat interface
- [ ] Artifact storage and display
- [ ] Deploy to staging

### Phase 2: Core Features (2 weeks)
- [ ] All 10 agents working
- [ ] WebSocket real-time updates
- [ ] Artifact versioning
- [ ] Decision logging
- [ ] Analytics dashboard

### Phase 3: Polish (1 week)
- [ ] Improved UI/UX
- [ ] Error handling
- [ ] Cost tracking
- [ ] Export functionality
- [ ] Deploy to production

### Phase 4: Advanced (Future)
- [ ] Multi-agent workflows
- [ ] Team collaboration
- [ ] GitHub integration
- [ ] Custom agent prompts
- [ ] Agent marketplace

## Cost Estimation

### Infrastructure (Monthly)
- **Vercel**: $0 (Hobby) or $20 (Pro)
- **Railway**: ~$10-20 (backend + DB + Redis)
- **Sentry**: $0 (free tier)
- **PostHog**: $0 (free tier)
- **Total**: ~$10-40/month

### API Costs (Variable)
- **Claude API**: ~$0.003/1K input tokens, ~$0.015/1K output tokens
- **Estimated per project**: $2-5 for full v0.1 workflow (all 10 agents)
- **Heavy user (10 projects/month)**: ~$20-50/month

### Total (Solo User)
- **Fixed**: $10-40/month (infrastructure)
- **Variable**: $20-50/month (API usage)
- **Total**: ~$30-90/month

## Next Steps

1. Set up project structure
2. Initialize Next.js frontend
3. Build Express backend
4. Implement Agent 1 (Problem Framer) as proof of concept
5. Add real-time WebSocket communication
6. Build dashboard UI
7. Deploy to staging
8. Iterate based on usage

---

**This architecture provides:**
- ✅ Scalable foundation
- ✅ Real-time agent execution
- ✅ Persistent state management
- ✅ Beautiful UI for interaction
- ✅ Cost tracking and analytics
- ✅ Production-ready deployment
