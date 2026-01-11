# AI-Augmented Product Development Workflow

**Build software products faster with 20+ specialized, battle-tested AI agents**

![Version](https://img.shields.io/badge/version-1.1-blue)
![Agents](https://img.shields.io/badge/agents-20+-purple)
![Tested](https://img.shields.io/badge/tested-yes-green)
![Rating](https://img.shields.io/badge/rating-91%25+-brightgreen)

---

## What's New (v1.1)

### 20+ Specialized Agents with Automated Testing

**New in v1.1:**
- **10 New Debug Agents** (Agents 10-16): Specialized debugging for visual bugs, performance, networking, state, errors, and memory leaks
- **4 New Review Agents** (Agents 17-20): Security auditor, code reviewer, database engineer, design reviewer
- **Automated Testing Framework**: JSON-based scenarios with weighted scoring (91%+ pass rates)
- **Edge Case Protocols**: Vague input handling, security refusal, destructive operation safeguards
- **Project Integration Guides**: Ready-to-use templates for integrating agents with existing projects

**Key Improvements**:
- All agents tested with automated scenarios and edge cases
- Added failure recovery and unrealistic scope detection protocols
- Strong guardrails for security, destructive operations, and over-engineering

**See**: [testing/](testing/) for the automated testing framework

---

## What Is This?

This repository contains a complete, production-ready system for building software products using AI agents that emulate:

**Core Development (Agents 0-9):**
- Agent 0: Project Orchestrator
- Agent 1: Problem Framer
- Agent 2: Competitive Mapper
- Agent 3: Product Manager (PRD writing)
- Agent 4: UX Designer
- Agent 5: System Architect
- Agent 6: Engineer
- Agent 7: QA Test Engineer
- Agent 8: DevOps Deployment
- Agent 9: Analytics & Growth

**Debug Suite (Agents 10-16):**
- Agent 10: Debug Detective (triage)
- Agent 11: Visual Debug Specialist
- Agent 12: Performance Profiler
- Agent 13: Network Inspector
- Agent 14: State Debugger
- Agent 15: Error Tracker
- Agent 16: Memory Leak Hunter

**Review & Specialized (Agents 17-20):**
- Agent 17: Security Auditor
- Agent 18: Code Reviewer
- Agent 19: Database Engineer
- Agent 20: Design Reviewer

**Plus**: A full-stack web dashboard to orchestrate everything!

---

## Quick Links

### 🎨 Interactive Visualization

**[Open the Interactive Agent Map](visualization/index.html)** - Explore all 20+ agents in a visual, interactive constellation map with animated workflows.

### 📚 For Users (Just Want to Build Products)

| Document | Purpose | Time |
|----------|---------|------|
| **[QUICK_START.md](QUICK_START.md)** | Get started in 5 minutes | 5 min |
| [CHEAT_SHEET.md](CHEAT_SHEET.md) | One-page quick reference | 2 min |
| [agents/README.md](agents/README.md) | How to use each agent | 15 min |

### 🛠️ For Developers (Want to Build the Dashboard)

| Document | Purpose | Time |
|----------|---------|------|
| **[dashboard/GETTING_STARTED.md](dashboard/GETTING_STARTED.md)** | Dashboard overview | 10 min |
| [dashboard/QUICK_START_DASHBOARD.md](dashboard/QUICK_START_DASHBOARD.md) | Set up in 10 minutes | 10 min |
| [dashboard/ARCHITECTURE.md](dashboard/ARCHITECTURE.md) | System design | 30 min |
| [dashboard/IMPLEMENTATION_ROADMAP.md](dashboard/IMPLEMENTATION_ROADMAP.md) | Week-by-week build guide | 1 hour |

### 📊 Testing & Quality

| Document | Purpose | Time |
|----------|---------|------|
| **[testing/](testing/)** | Automated testing framework | 15 min |
| [AGENT_OPTIMIZATION_SUMMARY.md](AGENT_OPTIMIZATION_SUMMARY.md) | What was optimized & why | 15 min |

### 🔗 Project Integration

| Document | Purpose | Time |
|----------|---------|------|
| **[docs/INTEGRATION_GUIDE_REIMBURSEMENT.md](docs/INTEGRATION_GUIDE_REIMBURSEMENT.md)** | Example integration with ClearConcur | 10 min |
| [docs/CLEARCONCUR_QUICK_START.md](docs/CLEARCONCUR_QUICK_START.md) | Copy-paste prompts for ClearConcur | 5 min |

---

## Project Structure

```
ai-agent-workflow/
│
├── 📘 Documentation
│   ├── README.md                      # This file
│   ├── QUICK_START.md                 # 5-minute guide
│   ├── CHEAT_SHEET.md                 # Quick reference
│   └── AGENT_OPTIMIZATION_SUMMARY.md  # Optimization details
│
├── 🤖 Agents (20+ Ready-to-Use Prompts)
│   ├── agent-0 to agent-9             # Core development agents
│   ├── agent-10 to agent-16           # Debug suite agents
│   ├── agent-17 to agent-20           # Review & specialized agents
│   ├── README.md                      # Agent usage guide
│   └── DEBUG-AGENTS-README.md         # Debug agent guide
│
├── 🧪 Testing
│   ├── scenarios/                     # JSON test scenarios
│   ├── runner.js                      # Automated test runner
│   └── README.md                      # Testing guide
│
├── 📁 docs/ (Integration Guides)
│   ├── INTEGRATION_GUIDE_REIMBURSEMENT.md  # ClearConcur example
│   ├── CLEARCONCUR_QUICK_START.md          # Copy-paste prompts
│   └── CLEARCONCUR_CLAUDE_ADDITION.md      # CLAUDE.md additions
│
└── 💻 Dashboard (Full-Stack App - Optional)
    ├── backend/                       # Express + Prisma + LangGraph
    ├── frontend/                      # Next.js + TypeScript
    └── docker-compose.yml             # PostgreSQL + Redis
```

---

## Two Paths to Choose From

### Path 1: Use the Agents Manually (Quickest)

**Time**: 5 minutes to start, 3-4 hours for full v0.1 workflow

**How it works**:
1. Open [agents/agent-0-orchestrator.md](agents/agent-0-orchestrator.md)
2. Copy the prompt to Claude/ChatGPT
3. Follow the agent's recommendations
4. Work through all 10 agents sequentially
5. Save artifacts as you go

**Best for**:
- Solo builders who want to start immediately
- Testing the workflow
- Projects without coding needs (just planning)

**Cost**: ~$3-4 in API calls for complete workflow

---

### Path 2: Build the Dashboard (Full-Stack)

**Time**: 4-5 weeks to full implementation

**What you get**:
- Beautiful web UI for managing projects
- Real-time agent execution
- Automatic artifact management
- Cost tracking & analytics
- Multi-project support
- WebSocket-powered live updates

**Best for**:
- Developers who want to customize
- Building this as a SaaS product
- Teams who need collaboration features

**Cost**: ~$35-95/month (infrastructure + API)

**Start**: [dashboard/GETTING_STARTED.md](dashboard/GETTING_STARTED.md)

---

## Agent Performance Summary

### Core Development Agents (0-9)

| Agent | Score | Key Strength |
|-------|-------|--------------|
| **Agent 0** (Orchestrator) | 91% | Failure recovery, scope detection |
| **Agent 1** (Problem Framer) | 92% | Vague input handling, solution detection |
| **Agent 3** (Product Manager) | 91% | Over-engineering prevention |
| **Agent 5** (Architect) | 90% | Monolith-first, boring tech |
| **Agent 6** (Engineer) | 91% | Security refusal, conflict detection |
| **Agent 7** (QA) | 92% | Comprehensive test strategies |
| **Agent 19** (Database) | 91% | Destructive operation safeguards |

### Debug Suite (10-16)

| Agent | Purpose |
|-------|---------|
| **Agent 10** | Debug triage and routing |
| **Agent 11** | Visual/CSS debugging |
| **Agent 12** | Performance profiling |
| **Agent 13** | Network/API debugging |
| **Agent 14** | State management debugging |
| **Agent 15** | Error tracking |
| **Agent 16** | Memory leak detection |

### Review Agents (17-20)

| Agent | Purpose |
|-------|---------|
| **Agent 17** | Security auditing |
| **Agent 18** | Code review |
| **Agent 19** | Database migrations & optimization |
| **Agent 20** | Design system review |

**Overall**: **91%+** pass rate on automated testing

---

## What You'll Build

**Example**: Literature review app for PhD students

### Input (to Agent 1)
```
"I want to build a tool to help PhD students manage literature reviews"

Constraints:
- Timeline: 4 weeks
- Budget: $0
- Solo builder
- Tech: TypeScript
```

### Output (from all 10 agents)

```
artifacts/
├── problem-brief-v0.1.md          ✅ Clear problem, personas, JTBD
├── competitive-analysis-v0.1.md   ✅ 5 competitors analyzed, wedge strategy
├── prd-v0.1.md                    ✅ 5 MUST features (not 15!)
├── ux-flows-v0.1.md               ✅ User journeys, wireframes
├── architecture-v0.1.md           ✅ Next.js + PostgreSQL (simple!)
├── code/                          ✅ Implementation guidance
├── test-plan-v0.1.md              ✅ Unit, integration, E2E tests
├── deployment-plan-v0.1.md        ✅ Vercel + Neon setup
└── analytics-plan-v0.1.md         ✅ 5 critical events to track
```

**Result**: Complete product specification, ready to build!

**Time**: 3-4 hours
**Cost**: $3-4

---

## Key Improvements (v1.0)

### 🎯 Scope Control (Biggest Win!)

**Before**:
- Agent 3 suggested 12-15 MUST features
- Agent 5 recommended microservices + Redis + caching
- 6-8 hours of revisions

**After**:
- Agent 3 limited to 5-8 MUST features ✅
- Agent 5 recommends monoliths + boring tech ✅
- 3-4 hours total workflow ✅

**Impact**: **50% scope reduction** while maintaining value!

### 🏗️ Anti-Over-Engineering

**Agent 5 (System Architect) now has strong guardrails**:

❌ **NO** microservices for v0.1
❌ **NO** Redis/caching for simple CRUD
❌ **NO** background jobs unless > 30 seconds
❌ **NO** Elasticsearch (PostgreSQL FTS is fine)
❌ **NO** custom auth (use managed services)

✅ **YES** to boring, proven tech
✅ **YES** to monoliths
✅ **YES** to managed services
✅ **YES** to one-command deploys

### 📊 Better Outputs

**Improvements across all agents**:
- ✅ Testable acceptance criteria (was vague)
- ✅ Specific, measurable success metrics
- ✅ Consistent terminology across agents
- ✅ Actionable recommendations
- ✅ Realistic scope for solo builders

---

## Quick Start (Path 1: Manual)

### 1. Copy Agent 0 Prompt

```bash
cat agents/agent-0-orchestrator.md
```

### 2. Paste into Claude/ChatGPT

Add your project idea:
```
I want to build [YOUR IDEA].

Target users: [WHO]
Main problem: [WHAT]
Constraints:
- Timeline: [X weeks]
- Budget: [$X/month]
- Tech: [preferences]

What should I do first?
```

### 3. Follow the Agent's Recommendations

Agent 0 will tell you to run Agent 1 (Problem Framer) next.

### 4. Continue Through Agents as Needed

**Core Development Flow:**
- Agent 1 → Problem Brief
- Agent 2 → Competitive Analysis
- Agent 3 → PRD
- Agent 4 → UX Flows
- Agent 5 → Architecture
- Agent 6 → Code
- Agent 7 → Tests
- Agent 8 → Deployment
- Agent 9 → Analytics

**When Debugging:**
- Agent 10 → Triage → Route to Agents 11-16

**For Reviews:**
- Agent 17 → Security Audit
- Agent 18 → Code Review
- Agent 19 → Database Changes
- Agent 20 → Design Review

### 5. Save Artifacts

```bash
mkdir -p my-project/artifacts
# Save each agent's output as you go
```

---

## Testing Highlights

### Test Scenario

**Project**: Literature review app for PhD students
**Input**: Vague idea + constraints
**Process**: All 10 agents sequentially
**Result**: Complete v0.1 specification

### Results

| Metric | Score | Notes |
|--------|-------|-------|
| **Clarity** | 4.5/5 | Clear, unambiguous outputs |
| **Completeness** | 4.6/5 | All required sections present |
| **Actionability** | 4.7/5 | Immediately usable |
| **Scope** | 4.3/5 | Realistic for solo builder |
| **Consistency** | 4.5/5 | Terminology aligned |
| **Overall** | **4.5/5** ⭐ | **Production Ready** |

### Cost & Time

- **Time**: 3-4 hours (down from 6-8)
- **Cost**: $3-4 (down from $4-6)
- **Revisions**: 1-2 cycles (down from 3-4)

**Improvement**: **~40% faster, ~25% cheaper**

---

## Use Cases

### ✅ What This System Is Great For

- **SaaS Products**: Build and ship web applications
- **Internal Tools**: Create tools for your team/lab
- **Research Apps**: Specialized domain tools
- **Side Projects**: Solo builder projects
- **Hackathons**: Rapid prototyping
- **MVPs**: Validate ideas quickly
- **Learning**: Understand product development

### ⚠️ What This System Is NOT

- ❌ Not a no-code builder (you still need to code)
- ❌ Not AI that writes all your code (Agent 6 guides, you implement)
- ❌ Not for large teams (optimized for solo builders)
- ❌ Not for enterprise-scale (optimized for 10-1000 users)

---

## FAQ

**Q: Do I need to know how to code?**
A: For Agents 1-5 (planning), no. For Agents 6-8 (implementation), yes.

**Q: Can I customize the agents?**
A: Yes! Edit the markdown files in `agents/`

**Q: How much does it cost?**
A: Manual: ~$3-4 per project. Dashboard: ~$35-95/month.

**Q: Can I use other LLMs besides Claude?**
A: Yes, the prompts work with GPT-4, Gemini, etc.

**Q: Is my data private?**
A: Yes. If using Claude API directly, your data isn't used for training.

**Q: Can multiple people use this?**
A: Manual: yes (share artifacts). Dashboard: planned for v1.0.

**Q: What if an agent makes a mistake?**
A: Edit the artifact manually or re-run with different inputs.

**Q: How long does a full workflow take?**
A: 3-4 hours for all 10 agents (manual prompting).

---

## Contributing

Improvements welcome! Areas of interest:

- 🧪 More test scenarios (different domains)
- 🌍 Translations (agents in other languages)
- 🔧 Integration code (LangGraph, CrewAI examples)
- 📱 Mobile app agents
- 🤖 New specialized agents

**To contribute**:
1. Fork the repository
2. Make your changes
3. Test with real projects
4. Submit a pull request

---

## License

MIT License - see LICENSE file

---

## Credits

**Created by**: Adrian C. Stier

**Built with**:
- [Claude](https://claude.ai) (Anthropic)
- [Next.js](https://nextjs.org)
- [LangGraph](https://github.com/langchain-ai/langgraph)
- [Prisma](https://prisma.io)

**Inspiration**:
- Jobs-to-be-Done framework
- Lean Startup methodology
- Agile development
- Shape Up (Basecamp)

---

## What's Next?

### Immediate Actions

1. **Try the agents**: [QUICK_START.md](QUICK_START.md)
2. **Read the optimization summary**: [AGENT_OPTIMIZATION_SUMMARY.md](AGENT_OPTIMIZATION_SUMMARY.md)
3. **Build something!**

### Roadmap

**v1.1** (Next):
- [ ] Agent performance monitoring
- [ ] More test scenarios
- [ ] Video tutorials
- [ ] Community examples

**v2.0** (Future):
- [ ] Team collaboration features
- [ ] Custom agent marketplace
- [ ] Mobile app support
- [ ] Advanced analytics

---

## Support

- **Documentation**: See files above
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-agent-workflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-agent-workflow/discussions)

---

**Ready to build products with AI agents? 🚀**

**Start here**: [QUICK_START.md](QUICK_START.md)

Or jump to:
- [Agent Documentation](agents/README.md)
- [Dashboard Setup](dashboard/GETTING_STARTED.md)
- [Optimization Summary](AGENT_OPTIMIZATION_SUMMARY.md)

---

![Built with AI](https://img.shields.io/badge/built%20with-AI-blue)
![Tested](https://img.shields.io/badge/tested-comprehensively-green)
![Production Ready](https://img.shields.io/badge/production-ready-brightgreen)
