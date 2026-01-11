# Using AI Agent Workflow with Claude Code

This guide explains how to use the AI Agent Workflow system with Claude Code (CLI) in **Orchestrator-Driven Mode** - where Agent 0 drives the development process and only asks you key questions.

## Quick Setup (5 minutes)

### Option A: Use the Init Script (Fastest)

```bash
# From anywhere, run the init script
/path/to/ai-agent-workflow/scripts/init-project.sh my-new-project

# Then start Claude Code
cd my-new-project && claude
```

The script creates everything you need and provides next-step instructions.

### Option B: Manual Setup

#### 1. Create Your Project

```bash
# Create project directory
mkdir my-new-project && cd my-new-project

# Create folder structure
mkdir -p artifacts state

# Initialize git
git init
```

### 2. Set Up Agent Access

**Option A: Symlink (Recommended)**
```bash
# Link to your local agent-workflow copy
ln -s /path/to/ai-agent-workflow/agents ./agents
```

**Option B: Clone Agents Only**
```bash
# Copy just the agents folder
cp -r /path/to/ai-agent-workflow/agents ./agents
```

### 3. Create CLAUDE.md

Copy the template and customize:

```bash
cp /path/to/ai-agent-workflow/templates/CLAUDE.md.template ./CLAUDE.md
```

Then edit `CLAUDE.md` with your project details:

```markdown
# Project: My Awesome App

## Project Context

### Overview
- **Name**: My Awesome App
- **One-liner**: A tool that helps developers track their coffee consumption
- **Target Users**: Software developers who drink too much coffee

### Constraints
- **Timeline**: 4 weeks to v0.1
- **Budget**: $0/month (free tiers)
- **Tech Preferences**: TypeScript, React, PostgreSQL
- **Hard Requirements**: Must work offline
```

### 4. Start Claude Code

```bash
cd my-new-project
claude
```

## How Orchestrator-Driven Mode Works

### Starting a Session

When you start Claude Code in your project directory, Claude reads your `CLAUDE.md` file. Simply describe what you want to work on:

```
I want to build a coffee tracking app for developers. Let's start from the beginning.
```

### What Happens Next

1. **Agent 0 (Orchestrator) assesses your project state**
   - Checks what artifacts exist
   - Identifies which validation gate you're at
   - Uses the decision framework to select the next agent

2. **The appropriate agent executes**
   - For a new project: Agent 1 (Problem Framer)
   - After problem defined: Agent 2 (Competitive Mapper)
   - And so on through the workflow

3. **You only get asked key questions**
   - Product decisions: "Should we prioritize feature A or B?"
   - Technical tradeoffs: "SQLite is simpler but PostgreSQL scales better. Which do you prefer?"
   - Ambiguities: "When you say 'tracking', do you mean daily totals or each individual cup?"

4. **Artifacts are saved automatically**
   - `artifacts/problem-brief-v0.1.md`
   - `artifacts/competitive-analysis-v0.1.md`
   - etc.

5. **The orchestrator returns after each task**
   - Reviews what was completed
   - Plans the next step
   - Continues the workflow

### Example Session

```
You: I want to build a coffee tracking app for developers. Let's get started.

Claude: [Reads CLAUDE.md, sees no artifacts]

I'll start by acting as Agent 0 (Orchestrator) to assess your project state.

## Project Status
- **Phase:** Discovery
- **Artifacts:** None
- **Next Gate:** Gate 1 (Problem & Market Validated)

Based on the decision framework, we need to start with Agent 1 (Problem Framer)
to define the problem clearly.

**Key Question:** Before I proceed, I need to understand:
- Is this for tracking caffeine intake for health reasons, or more of a fun/social feature?
- Are you experiencing this problem yourself, or is this based on observations of others?

You: It's for health reasons - I drink way too much coffee and lose track.
I experience this myself and my dev friends complain about the same thing.

Claude: [Proceeds with Agent 1 methodology, asks a few more clarifying questions,
then produces the Problem Brief]

I've completed the Problem Brief and saved it to `artifacts/problem-brief-v0.1.md`.

## Summary
- Primary persona: Health-conscious developers
- Core JTBD: Track coffee consumption to maintain healthy limits
- Key insight: Developers lose track during flow states

Returning to orchestration...

**Next Step:** Agent 2 (Competitive Mapper) to analyze existing solutions.
Shall I proceed?

You: Yes, continue.

Claude: [Continues through the workflow...]
```

## Controlling the Flow

You can adjust how the orchestrator works at any time:

### Speed Up
```
Speed up - I trust your judgment, make reasonable assumptions.
```
Claude will make more decisions autonomously and ask fewer questions.

### Slow Down
```
Slow down - I want to understand each decision.
```
Claude will explain reasoning in more detail and validate assumptions.

### Skip an Agent
```
Skip the competitive analysis - I already know the market well.
```
Claude will acknowledge the risk and proceed to the next agent.

### Go Back
```
Go back to the Problem Brief - I want to reconsider the target user.
```
Claude will return to Agent 1 to revise the problem definition.

### Direct Execution
```
Just implement the login feature - skip the orchestration.
```
Claude will directly invoke Agent 6 (Engineer) for the specific task.

### Pause
```
Pause - what's our current state?
```
Claude will provide a complete status summary without taking action.

## Validation Gates

The orchestrator enforces quality gates between phases:

### Gate 1: Problem & Market Validated (After Agents 1-2)
- Problem statement is falsifiable
- Target persona is specific
- Competitive landscape mapped
- Go/No-Go decision made

### Gate 2: Design & Architecture Validated (After Agents 3-5)
- PRD has 5-8 MUST features (hard limit)
- UX flows cover all MUST features
- Architecture uses proven technology
- Build estimate is realistic

### Gate 3: Code Complete (After Agents 6-7)
- All MUST features implemented
- Test coverage targets met
- No critical bugs

### Gate 4: Launch Ready (After Agents 8-9)
- Deployed and verified
- Monitoring configured
- Analytics tracking key events

## Project Structure

After a complete workflow, your project will look like:

```
my-new-project/
├── CLAUDE.md                    # Project config & state
├── agents/                      # Symlink to agent prompts
├── artifacts/
│   ├── problem-brief-v0.1.md
│   ├── competitive-analysis-v0.1.md
│   ├── prd-v0.1.md
│   ├── ux-flows-v0.1.md
│   ├── architecture-v0.1.md
│   ├── test-plan-v0.1.md
│   ├── deployment-plan-v0.1.md
│   └── analytics-plan-v0.1.md
├── src/                         # Your code
├── tests/                       # Test files
└── state/                       # Session state (optional)
```

## Best Practices

### 1. Keep CLAUDE.md Updated
Update the "Current State" section as you progress. This helps Claude understand context between sessions.

### 2. Record Key Decisions
Add major decisions to the "Decisions Made" section so they persist across sessions.

### 3. Review Artifacts Before Proceeding
When the orchestrator completes an artifact, review it before saying "continue". This is your checkpoint.

### 4. Use Gate Transitions for Breaks
The validation gates are natural stopping points. Take breaks between gates.

### 5. Trust But Verify
The orchestrator makes good recommendations, but you're the product owner. Override when your judgment differs.

## Troubleshooting

### "Claude isn't reading my CLAUDE.md"
Make sure the file is in the project root where you run `claude`.

### "The orchestrator keeps asking too many questions"
Say "Speed up" or "Make reasonable assumptions and proceed".

### "I want to work on something specific"
Say "Just do [X]" to skip orchestration for that task.

### "The workflow feels too rigid"
The orchestrator is a guide, not a dictator. Skip agents or phases as needed for your project.

## Advanced: Multiple Projects

If you're working on multiple projects with agents:

```bash
# Create a shared agents location
mkdir -p ~/ai-agents
cp -r /path/to/ai-agent-workflow/agents ~/ai-agents/

# In each project
ln -s ~/ai-agents/agents ./agents
```

Each project gets its own `CLAUDE.md` with project-specific context.

## Cost Estimates

Using orchestrator-driven mode with Claude:

- **Discovery phase (Agents 1-2)**: ~$0.50-1.00
- **Definition phase (Agents 3-5)**: ~$1.00-2.00
- **Implementation phase (Agents 6-7)**: ~$1.00-3.00 (varies by complexity)
- **Launch phase (Agents 8-9)**: ~$0.50-1.00

**Total for complete v0.1**: ~$3-7

## Next Steps

1. **Set up your first project** using the Quick Setup above
2. **Start a session** and describe your idea
3. **Follow the orchestrator's guidance** through the workflow
4. **Ship your v0.1!**

For detailed information about each agent, see [agents/README.md](../agents/README.md).
