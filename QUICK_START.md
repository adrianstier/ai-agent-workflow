# Quick Start Guide - AI Agentic Workflow

**Get started in 5 minutes.**

## Option 1: Manual (Easiest)

### Step 1: Start with the Orchestrator

1. Open [`agents/agent-0-orchestrator.md`](agents/agent-0-orchestrator.md)
2. Copy the system prompt (the text inside the code block)
3. Open Claude or ChatGPT
4. Paste the system prompt
5. Add your project context:

```
Project: [Your idea in one sentence]
Current stage: Just have an idea
Constraints:
  - Timeline: [e.g., 4 weeks to v0.1]
  - Budget: [e.g., $0/month initially]
  - Tech preference: [e.g., TypeScript, prefer managed services]
```

6. Agent 0 will tell you what to do next!

### Step 2: Follow the Agent's Recommendations

Agent 0 will typically recommend starting with Agent 1 (Problem Framer). It will provide you a ready-to-use prompt like:

```
Agent: Problem Framer (Agent 1)
Prompt: "I want to build [your idea]. Ask me clarifying questions to create a Problem Brief."
```

Copy that prompt, open the Agent 1 file, and continue.

### Step 3: Save Your Artifacts

As you work through agents, save the outputs:

```bash
mkdir -p artifacts
```

Then save files like:
- `artifacts/problem-brief-v0.1.md` (from Agent 1)
- `artifacts/competitive-analysis-v0.1.md` (from Agent 2)
- `artifacts/prd-v0.1.md` (from Agent 3)
- etc.

---

## Option 2: Claude Projects (Recommended)

### Step 1: Create a Project

1. Open Claude
2. Click "Projects" in sidebar
3. Create new project: "[Your Product Name]"
4. Add a description: "AI-augmented product development for [brief description]"

### Step 2: Set Up Custom Instructions

1. In Project Settings → Custom Instructions
2. Copy the Agent 0 (Orchestrator) system prompt
3. Paste it as the custom instruction
4. Add your project context:

```
PROJECT CONTEXT:
- Name: [Your product name]
- Idea: [One sentence description]
- Timeline: [e.g., 4 weeks to launch]
- Budget: [e.g., $0/month]
- Tech stack: [e.g., Next.js + TypeScript]
```

### Step 3: Upload Artifacts as You Create Them

As you complete each agent's output:
1. Save the file locally
2. Upload to Project Knowledge
3. Future agents will automatically see previous work

### Step 4: Switch Agents

To switch to a different agent:
1. Start a new chat in the project
2. Paste the new agent's system prompt
3. Reference previous artifacts: "Using the Problem Brief, create a PRD"

---

## Option 3: Single Conversation (Fast)

You can run multiple agents in one conversation:

1. Start with Agent 1's prompt
2. Get the Problem Brief
3. Then say: "Now act as Agent 2 (Competitive Mapper)" + paste Agent 2's prompt
4. Continue chaining agents

**Pro:** Fast, maintains context
**Con:** Very long conversation, harder to track

---

## The 10 Agents at a Glance

| # | Agent | What It Does | When to Use |
|---|-------|--------------|-------------|
| 0 | Orchestrator | Tells you what to do next | Start here, use when stuck |
| 1 | Problem Framer | Defines the problem & users | Turn vague idea into clear problem |
| 2 | Competitive Mapper | Maps competitors & opportunities | Understand market landscape |
| 3 | Product Manager | Writes PRD with scoped features | Define what to build for v0.1 |
| 4 | UX Designer | Designs user flows & screens | Plan user experience |
| 5 | System Architect | Chooses tech stack & architecture | Pick technologies & design system |
| 6 | Engineer | Writes code | Implement features |
| 7 | QA & Test | Creates tests & debugs | Ensure quality |
| 8 | DevOps | Sets up deployment | Deploy to production |
| 9 | Analytics | Defines metrics & experiments | Measure success & iterate |

---

## Typical First Session (30-60 minutes)

**Goal:** Get from idea to clear problem definition

1. **Agent 0 (Orchestrator)** - 5 min
   - Input: Your rough idea
   - Output: Recommended next steps

2. **Agent 1 (Problem Framer)** - 20 min
   - Input: Answer 8-10 clarifying questions
   - Output: Problem Brief with personas, JTBD, constraints
   - Save to: `artifacts/problem-brief-v0.1.md`

3. **Agent 2 (Competitive Mapper)** - 20 min
   - Input: Problem Brief + known competitors
   - Output: Competitive analysis + wedge strategy
   - Save to: `artifacts/competitive-analysis-v0.1.md`

4. **Agent 0 (Orchestrator)** - 5 min
   - Input: Current state (completed Agents 1 & 2)
   - Output: Plan for next session (Agent 3 - PRD)

**What you'll have:** Clear understanding of the problem, users, and competitive landscape.

---

## Typical Second Session (60-90 minutes)

**Goal:** Define what to build for v0.1

1. **Agent 3 (Product Manager)** - 40 min
   - Input: Problem Brief + Competitive Analysis + constraints
   - Output: Complete PRD for v0.1
   - Save to: `artifacts/prd-v0.1.md`

2. **Review & Cut Scope** - 20 min
   - Read the PRD critically
   - Challenge any "MUST have" features that aren't truly essential
   - Ask Agent 3 to revise if needed

3. **Agent 4 (UX Designer)** - 30 min
   - Input: PRD v0.1
   - Output: User flows and wireframes
   - Save to: `artifacts/ux-flows-v0.1.md`

**What you'll have:** Scoped feature list and user experience design.

---

## Typical Third Session (60 minutes)

**Goal:** Decide on technology and architecture

1. **Agent 5 (System Architect)** - 40 min
   - Input: PRD + UX flows + tech preferences
   - Output: Complete architecture plan
   - Save to: `artifacts/architecture-v0.1.md`

2. **Review Tech Choices** - 20 min
   - Validate that you're comfortable with the recommended stack
   - Ask for alternatives if needed
   - Lock the architecture once approved

**What you'll have:** Complete technical plan ready for implementation.

---

## Then: Build & Ship

Use the remaining agents as you build:

- **Agent 6 (Engineer):** Daily, as you implement features
- **Agent 7 (QA & Test):** After each feature, for testing
- **Agent 8 (DevOps):** Once, when ready to deploy
- **Agent 9 (Analytics):** Once before launch, then weekly after launch
- **Agent 0 (Orchestrator):** Weekly check-ins, plan v0.2

---

## Common Questions

**Q: Do I have to use all 10 agents?**
A: No. For small projects, you might skip Agent 2 (Competitive) or Agent 9 (Analytics). Use what's helpful.

**Q: Can I use the same agent multiple times?**
A: Yes! Agent 6 (Engineer) will be used daily. Agent 0 (Orchestrator) should be used weekly.

**Q: What if the agent's output is too generic?**
A: Provide more specific context. Include constraints, examples, and details about your domain.

**Q: What if I disagree with the agent's recommendation?**
A: Challenge it! Say "That scope is too large, cut it by 50%" or "I prefer X technology, adapt the plan."

**Q: Can I customize the prompts?**
A: Absolutely. Edit them to match your style, domain, or specific needs.

---

## Pro Tips

1. **Save everything:** Create an `artifacts/` folder and save all outputs

2. **Version your artifacts:** Use `problem-brief-v0.1.md`, then `problem-brief-v0.2.md` later

3. **Lock before proceeding:** Don't start coding before locking the PRD and architecture

4. **Challenge scope:** Agents tend to be comprehensive. Push back to keep v0.1 minimal.

5. **Use Agent 0 when stuck:** The Orchestrator can help you figure out what to do next

6. **Combine with coding tools:** Use Agent 6 inside Cursor, Aider, or Claude Code for best results

---

## Next Steps

1. ✅ Open [`agents/agent-0-orchestrator.md`](agents/agent-0-orchestrator.md)
2. ✅ Copy the system prompt
3. ✅ Paste into Claude/ChatGPT with your project idea
4. ✅ Follow the agent's recommendations
5. ✅ Save artifacts as you go

**That's it! You're ready to build with AI agents.**

For more details, see:
- [`agents/README.md`](agents/README.md) - Detailed agent guide
- [`agent_implementation_guide.md`](agent_implementation_guide.md) - Comprehensive reference
- Original workflow: [`ai_product_workflow_agents.md`](ai_product_workflow_agents.md)
