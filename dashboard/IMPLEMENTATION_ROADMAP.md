# Dashboard Implementation Roadmap

## Overview

This document provides a step-by-step guide to implementing the AI Agent Dashboard from scratch.

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Get basic infrastructure running

#### Day 1-2: Database & Backend Setup
- [x] Create project structure
- [x] Set up package.json files
- [x] Define Prisma schema
- [ ] Implement database setup script
- [ ] Create basic Express server
- [ ] Add health check endpoint
- [ ] Set up logging (Winston)
- [ ] Configure environment variables

**Tasks:**
```bash
# 1. Initialize backend
cd backend
npm install

# 2. Set up database
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Run migrations
npm run db:generate
npm run db:migrate

# 4. Start backend
npm run dev
# Should see: "🚀 Server running on port 4000"
```

#### Day 3-4: Frontend Setup
- [ ] Create Next.js app
- [ ] Set up Tailwind CSS
- [ ] Install Shadcn UI components
- [ ] Create basic layout
- [ ] Add routing structure
- [ ] Set up API client
- [ ] Configure environment variables

**Tasks:**
```bash
# 1. Initialize frontend
cd frontend
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with API URL

# 3. Start frontend
npm run dev
# Should see: "Next.js running on http://localhost:3000"
```

#### Day 5: Integration Test
- [ ] Create test project via API
- [ ] Display project in frontend
- [ ] Test CRUD operations
- [ ] Verify database persistence

**Deliverable:** Basic full-stack app with project CRUD

---

### Phase 2: Agent Runtime (Week 2)

**Goal:** Execute first agent (Agent 1: Problem Framer)

#### Day 1-2: Agent Loader
- [ ] Create agent prompt loader
- [ ] Parse agent markdown files
- [ ] Extract system prompts
- [ ] Cache agent prompts in memory
- [ ] Hot-reload support (dev mode)

**File:** `backend/src/agents/agent-loader.ts`

```typescript
export class AgentLoader {
  private prompts: Map<number, string> = new Map();

  async loadAgent(agentId: number): Promise<string> {
    // Read from ../agents/agent-{agentId}-name.md
    // Extract system prompt between ``` markers
    // Cache in memory
    // Return prompt
  }

  async reloadAll(): Promise<void> {
    // Reload all agent prompts
  }
}
```

#### Day 3-4: Claude API Integration
- [ ] Set up Anthropic SDK
- [ ] Create Claude client service
- [ ] Implement streaming responses
- [ ] Add token counting
- [ ] Calculate costs
- [ ] Error handling & retries

**File:** `backend/src/services/claude.ts`

```typescript
export class ClaudeService {
  private client: Anthropic;

  async executeAgent(params: {
    agentId: number;
    systemPrompt: string;
    userMessage: string;
    context?: string[];
  }): Promise<{
    output: string;
    tokensUsed: number;
    cost: number;
  }> {
    // Call Claude API
    // Stream response
    // Count tokens
    // Return output + metadata
  }
}
```

#### Day 5: Agent Execution Flow
- [ ] Create AgentExecution model
- [ ] Implement execution endpoint
- [ ] Queue job in BullMQ
- [ ] Execute agent in worker
- [ ] Save output as artifact
- [ ] Update execution status

**File:** `backend/src/api/executions.ts`

```typescript
router.post('/projects/:id/agents/:agentId/execute', async (req, res) => {
  // 1. Create execution record (status: queued)
  // 2. Add job to queue
  // 3. Return execution ID
});
```

**File:** `backend/src/jobs/workers/agent-executor.ts`

```typescript
export async function executeAgent(job: Job) {
  // 1. Load agent prompt
  // 2. Load project context
  // 3. Call Claude API
  // 4. Parse output
  // 5. Save artifact
  // 6. Update execution status
  // 7. Emit WebSocket event
}
```

**Deliverable:** Agent 1 executes and generates Problem Brief

---

### Phase 3: Real-time UI (Week 3)

**Goal:** Beautiful dashboard with live updates

#### Day 1-2: Dashboard UI
- [ ] Create project list view
- [ ] Create project detail page
- [ ] Add agent grid/cards
- [ ] Show execution status
- [ ] Display artifacts
- [ ] Style with Tailwind + Shadcn

**Files:**
- `frontend/src/app/page.tsx` - Project list
- `frontend/src/app/projects/[id]/page.tsx` - Project detail
- `frontend/src/components/agents/AgentCard.tsx` - Agent card
- `frontend/src/components/artifacts/ArtifactViewer.tsx` - Artifact viewer

#### Day 3: WebSocket Integration
- [ ] Set up Socket.io server
- [ ] Create WebSocket service (backend)
- [ ] Create WebSocket hook (frontend)
- [ ] Emit agent progress events
- [ ] Listen for events in UI
- [ ] Update UI in real-time

**File:** `backend/src/services/websocket.ts`

```typescript
export function setupWebSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('agent:execute', async (data) => {
      // Handle agent execution request
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
```

**File:** `frontend/src/hooks/useWebSocket.ts`

```typescript
export function useWebSocket(projectId: string) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);

    socket.on('agent:progress', (data) => {
      // Update UI with progress
    });

    socket.on('agent:completed', (data) => {
      // Show completion, load artifact
    });

    return () => socket.disconnect();
  }, [projectId]);
}
```

#### Day 4-5: Chat Interface
- [ ] Create chat UI component
- [ ] Send messages via WebSocket
- [ ] Display message history
- [ ] Show agent responses
- [ ] Support markdown rendering

**File:** `frontend/src/components/chat/ChatInterface.tsx`

```typescript
export function ChatInterface({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage } = useWebSocket(projectId);

  // Render chat UI
}
```

**Deliverable:** Interactive dashboard with live agent execution

---

### Phase 4: All Agents (Week 4)

**Goal:** Implement all 10 agents

#### Day 1: Agents 0-2
- [ ] Agent 0: Orchestrator
- [ ] Agent 1: Problem Framer (already done)
- [ ] Agent 2: Competitive Mapper

#### Day 2: Agents 3-5
- [ ] Agent 3: Product Manager
- [ ] Agent 4: UX Designer
- [ ] Agent 5: System Architect

#### Day 3: Agents 6-8
- [ ] Agent 6: Engineer
- [ ] Agent 7: QA & Test
- [ ] Agent 8: DevOps

#### Day 4: Agent 9 + Testing
- [ ] Agent 9: Analytics
- [ ] Test all agents end-to-end
- [ ] Fix bugs
- [ ] Improve prompts

#### Day 5: Polish
- [ ] Add loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Artifact export
- [ ] Documentation

**Deliverable:** All 10 agents working end-to-end

---

### Phase 5: Advanced Features (Week 5+)

#### Week 5: Analytics & Cost Tracking
- [ ] Cost tracking dashboard
- [ ] Agent performance metrics
- [ ] Project timeline visualization
- [ ] Export reports

#### Week 6: Workflow Automation
- [ ] Multi-agent workflows
- [ ] Sequential execution (Agent 1 → 2 → 3)
- [ ] Approval checkpoints
- [ ] Retry failed executions

#### Week 7: Collaboration
- [ ] Team projects
- [ ] User management
- [ ] Comments on artifacts
- [ ] Approval workflows

#### Week 8: Integrations
- [ ] GitHub integration (commit artifacts)
- [ ] Export to PDF/Markdown
- [ ] Import existing PRDs
- [ ] API webhooks

---

## Implementation Checklist

### Must Have (v0.1)
- [ ] Project CRUD
- [ ] All 10 agents execute successfully
- [ ] Artifacts saved and displayed
- [ ] Real-time WebSocket updates
- [ ] Basic error handling
- [ ] Cost tracking
- [ ] Deploy to staging

### Should Have (v0.2)
- [ ] Multi-agent workflows
- [ ] Artifact versioning
- [ ] Export functionality
- [ ] Analytics dashboard
- [ ] GitHub integration

### Nice to Have (v1.0)
- [ ] Team collaboration
- [ ] Custom agent prompts
- [ ] Mobile app
- [ ] Advanced analytics

---

## Development Tips

### Start Small
Don't try to build everything at once. Get Agent 1 working end-to-end before adding more agents.

**Recommended order:**
1. Database + basic API
2. Agent 1 execution (no UI)
3. Simple UI to trigger Agent 1
4. Real-time updates
5. Add remaining agents
6. Polish UI
7. Advanced features

### Test Frequently
After each phase, manually test:
- Create project
- Run agent
- View artifact
- Check database
- Verify WebSocket events

### Use Debug Logs
Add extensive logging:
```typescript
logger.info('Agent execution started', { agentId, projectId });
logger.debug('Calling Claude API', { prompt: prompt.slice(0, 100) });
logger.info('Agent execution completed', { tokensUsed, cost });
```

### Monitor Costs
Track API costs from day 1:
```typescript
const COST_PER_INPUT_TOKEN = 0.003 / 1000;
const COST_PER_OUTPUT_TOKEN = 0.015 / 1000;

const cost = (inputTokens * COST_PER_INPUT_TOKEN) +
             (outputTokens * COST_PER_OUTPUT_TOKEN);
```

---

## Code Snippets

### Complete Agent Execution Flow

```typescript
// 1. User clicks "Run Agent 1"
// frontend/src/components/agents/AgentCard.tsx
const handleExecute = async () => {
  const response = await api.post(`/projects/${projectId}/agents/1/execute`, {
    input: { context: userInput }
  });
  const { executionId } = response.data;
  // WebSocket will send updates
};

// 2. Backend receives request
// backend/src/api/executions.ts
router.post('/projects/:id/agents/:agentId/execute', async (req, res) => {
  const execution = await prisma.agentExecution.create({
    data: {
      projectId: req.params.id,
      agentId: parseInt(req.params.agentId),
      status: 'QUEUED',
      input: req.body.input,
    }
  });

  await agentQueue.add('execute-agent', {
    executionId: execution.id,
    projectId: execution.projectId,
    agentId: execution.agentId,
    input: execution.input,
  });

  res.json({ executionId: execution.id });
});

// 3. BullMQ worker picks up job
// backend/src/jobs/workers/agent-executor.ts
agentQueue.process('execute-agent', async (job) => {
  const { executionId, agentId, input } = job.data;

  // Update status
  await prisma.agentExecution.update({
    where: { id: executionId },
    data: { status: 'RUNNING' }
  });

  // Emit WebSocket event
  io.to(projectId).emit('agent:started', { executionId, agentId });

  try {
    // Load agent prompt
    const prompt = await agentLoader.loadAgent(agentId);

    // Call Claude API
    const result = await claudeService.executeAgent({
      systemPrompt: prompt,
      userMessage: input.context,
    });

    // Save artifact
    const artifact = await prisma.artifact.create({
      data: {
        projectId,
        agentId,
        type: getArtifactType(agentId),
        content: result.output,
        status: 'DRAFT',
      }
    });

    // Update execution
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'COMPLETED',
        output: { content: result.output },
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        completedAt: new Date(),
      }
    });

    // Emit completion event
    io.to(projectId).emit('agent:completed', {
      executionId,
      artifact: artifact.id,
    });

  } catch (error) {
    // Handle error
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'FAILED',
        error: error.message,
      }
    });

    io.to(projectId).emit('agent:failed', {
      executionId,
      error: error.message,
    });
  }
});

// 4. Frontend receives WebSocket event
// frontend/src/hooks/useWebSocket.ts
socket.on('agent:completed', (data) => {
  // Fetch artifact
  api.get(`/artifacts/${data.artifact}`).then((response) => {
    // Display artifact in UI
    setArtifact(response.data);
  });

  // Show toast
  toast.success('Agent execution completed!');
});
```

---

## File Creation Order

Create files in this order for smooth development:

### Week 1
1. `backend/prisma/schema.prisma`
2. `backend/src/utils/logger.ts`
3. `backend/src/index.ts`
4. `backend/src/api/routes.ts`
5. `backend/src/api/projects.ts`
6. `frontend/src/app/page.tsx`
7. `frontend/src/lib/api.ts`

### Week 2
8. `backend/src/agents/agent-loader.ts`
9. `backend/src/services/claude.ts`
10. `backend/src/jobs/queue.ts`
11. `backend/src/jobs/workers/agent-executor.ts`
12. `backend/src/api/executions.ts`

### Week 3
13. `backend/src/services/websocket.ts`
14. `frontend/src/hooks/useWebSocket.ts`
15. `frontend/src/components/agents/AgentCard.tsx`
16. `frontend/src/components/artifacts/ArtifactViewer.tsx`
17. `frontend/src/components/chat/ChatInterface.tsx`

### Week 4
18. Implement all agent executors
19. Add UI polish
20. Testing & bug fixes

---

## Next Steps

**To start implementing:**

1. **Set up development environment**
   ```bash
   cd dashboard
   npm run setup
   ```

2. **Create environment files**
   ```bash
   cd backend && cp .env.example .env
   cd ../frontend && cp .env.example .env.local
   ```

3. **Start database**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations**
   ```bash
   cd backend && npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   cd .. && npm run dev
   ```

6. **Begin Phase 1 implementation**
   - Follow the checklist above
   - Test after each step
   - Commit frequently

**Happy coding! 🚀**
