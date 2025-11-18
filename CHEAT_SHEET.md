# AI Agent Workflow - Cheat Sheet

**One-page reference for using the 10-agent system**

## Agent Quick Reference

| # | Agent | One-Sentence Description | Input | Output |
|---|-------|-------------------------|-------|--------|
| **0** | Orchestrator | Tells you what to do next | Current state | Next 2-3 actions |
| **1** | Problem Framer | Defines problem & users | Vague idea | Problem Brief |
| **2** | Competitive Mapper | Maps market opportunities | Problem Brief | Competitive Analysis |
| **3** | Product Manager | Scopes features for v0.1 | Problem Brief + Competitive | PRD v0.1 |
| **4** | UX Designer | Designs user flows | PRD | UX Flows & Wireframes |
| **5** | System Architect | Chooses tech stack | PRD + UX Flows | Architecture Plan |
| **6** | Engineer | Writes code | Architecture | Application Code |
| **7** | QA & Test | Ensures quality | Code + PRD | Tests & Bug Reports |
| **8** | DevOps | Deploys to production | Architecture + Code | Deployment Pipeline |
| **9** | Analytics | Measures success | PRD + UX Flows | Analytics Plan |

## Typical First Project (4 weeks)

```
WEEK 1: Plan (6-8 hours)
├─ Mon-Tue:  Agent 0 → 1 → 2  (Problem + Competition)
├─ Wed-Thu:  Agent 3 → 4       (PRD + UX)
└─ Fri:      Agent 5           (Architecture)

WEEK 2-3: Build (40-60 hours)
├─ Daily:    Agent 6           (Code features)
└─ Daily:    Agent 7           (Test features)

WEEK 4: Deploy (8-12 hours)
├─ Mon-Tue:  Agent 8           (Set up deployment)
├─ Wed:      Agent 9           (Add analytics)
└─ Thu-Fri:  Agent 7 → 8       (Final QA → Deploy)
```

## How to Invoke an Agent

### Option 1: Simple (Copy-Paste)
```
1. Open agents/agent-[N]-[name].md
2. Copy the system prompt (between ``` markers)
3. Paste into Claude/ChatGPT
4. Provide your inputs
5. Save the output to artifacts/[filename].md
```

### Option 2: Claude Projects
```
1. Create project: "[Product Name]"
2. Upload existing artifacts as knowledge
3. Set agent prompt as custom instructions
4. Chat normally - context is automatic
5. Switch agents by changing custom instructions
```

### Option 3: Chain in One Conversation
```
1. Start with Agent 1's prompt
2. Get output
3. Say "Now act as Agent 2" + paste Agent 2's prompt
4. Agent has context from previous output
5. Continue chaining
```

## Agent Invocation Frequency

| Agent | How Often? |
|-------|-----------|
| Agent 0 (Orchestrator) | Weekly, when stuck, before major decisions |
| Agent 1 (Problem Framer) | Once per project, or when pivoting |
| Agent 2 (Competitive) | Once per major version (v0.1, v1.0) |
| Agent 3 (Product Manager) | Once per version (v0.1, v0.2, etc.) |
| Agent 4 (UX Designer) | Once per version, or per major feature |
| Agent 5 (System Architect) | Once per project, or for major tech changes |
| Agent 6 (Engineer) | **Daily** - your main coding partner |
| Agent 7 (QA & Test) | After each feature, before each release |
| Agent 8 (DevOps) | Once to set up, then when adding infrastructure |
| Agent 9 (Analytics) | Once before launch, weekly after launch |

## Common Prompt Patterns

### Starting Fresh
```
"I want to build [IDEA].

Target users: [WHO]
Main problem: [WHAT PROBLEM]
Constraints:
- Timeline: [X weeks]
- Budget: [$X/month]
- Tech: [preferences]

Ask me clarifying questions to create a [ARTIFACT NAME]."
```

### Iterating on Output
```
"This is good, but [SPECIFIC ISSUE].

Please revise:
- [Change 1]
- [Change 2]

Keep everything else the same."
```

### Challenging Scope
```
"This scope is too large for a solo builder.

Cut it by 50% and focus only on the most critical user need.

What would you remove?"
```

### Requesting Alternatives
```
"Provide 3 alternative approaches:
1. Narrow (minimal, fastest to build)
2. Balanced (good UX, feasible)
3. Broad (ideal, might be too much)

For each, list: features, effort, tradeoffs"
```

## Artifact Checklist

Before moving to next phase, ensure:

**Problem Brief:**
- [ ] Problem statement is specific
- [ ] 2-3 user personas with real context
- [ ] 3-5 jobs-to-be-done
- [ ] Success criteria are measurable
- [ ] Constraints are explicit

**Competitive Analysis:**
- [ ] 5+ real alternatives analyzed
- [ ] Gaps identified from user POV
- [ ] Wedge strategy is scoped (2-4 weeks)
- [ ] Positioning statement is clear

**PRD:**
- [ ] Every MUST feature ties to JTBD
- [ ] Acceptance criteria are testable
- [ ] Scope is realistic (5-8 MUST features max)
- [ ] "Out of scope" list exists

**UX Flows:**
- [ ] Every screen ties to use case
- [ ] All states designed (empty, loading, error)
- [ ] Accessibility considered
- [ ] Component inventory exists

**Architecture:**
- [ ] Tech stack appropriate for solo builder
- [ ] All PRD features are supported
- [ ] Deployment is simple (1-command)
- [ ] Security basics covered

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Output is too generic | Provide more specific context, constraints, and examples |
| Agent suggests too much | Add constraint: "Solo builder, 2 weeks, choose 3 features max" |
| Don't know which agent to use | Start with Agent 0 (Orchestrator) |
| Output doesn't match my vision | Challenge it: "I disagree because..." and ask for revision |
| Stuck in planning, want to code | Skip to Agent 6 with minimal PRD (risky but faster) |
| Code has bugs | Use Agent 7 in debug mode: paste error + context |
| Production is down | Use Agent 8 with runbook: "Production down, help diagnose" |
| Don't know what to build next | Agent 9 with usage data: "What should v0.2 focus on?" |

## Files You Should Have

```
your-project/
├── agents/                           # Agent prompts (copy from repo)
├── artifacts/                        # Save outputs here
│   ├── problem-brief-v0.1.md        ← Agent 1
│   ├── competitive-analysis-v0.1.md ← Agent 2
│   ├── prd-v0.1.md                  ← Agent 3
│   ├── ux-flows-v0.1.md             ← Agent 4
│   ├── architecture-v0.1.md         ← Agent 5
│   ├── test-plan-v0.1.md            ← Agent 7
│   ├── deployment-plan-v0.1.md      ← Agent 8
│   └── analytics-plan-v0.1.md       ← Agent 9
├── state/
│   └── project-state.json           # Track current state
├── src/                             # Code (from Agent 6)
└── README.md                        # Project overview
```

## Essential Commands

### Set Up Project
```bash
mkdir my-project && cd my-project
mkdir -p agents artifacts state src tests
cp -r /path/to/agents/* agents/
```

### Track State
```json
// state/project-state.json
{
  "project_name": "My Project",
  "version": "0.1",
  "stage": "discover",
  "current_focus": "Problem framing",
  "artifacts": {
    "problem_brief": {
      "status": "locked",
      "path": "artifacts/problem-brief-v0.1.md"
    }
  }
}
```

### Version Artifacts
```bash
# When updating for v0.2
cp artifacts/prd-v0.1.md artifacts/prd-v0.2.md
# Edit v0.2, keep v0.1 for reference
```

## Pro Tips

1. **Lock artifacts:** Mark as "locked" before moving to next phase
2. **Version everything:** Use `-v0.1`, `-v0.2` suffixes
3. **Challenge recommendations:** Agents are advisors, not bosses
4. **Start minimal:** 5 MUST features max for v0.1
5. **Use Agent 0 weekly:** Keeps you on track
6. **Save everything:** Future you will thank present you
7. **Iterate in batches:** Plan → Build → Ship → Learn → Repeat

## Good vs Bad Prompts

### ❌ Bad
```
"Build a social media app"
(Too vague, no constraints)
```

### ✅ Good
```
"Build a simple link-sharing tool for academic researchers.
- Target: 10 PhD students in my lab
- Timeline: 2 weeks
- Features: Post links, tag by topic, search
- Tech: Next.js (I know it)
Create a Problem Brief."
```

---

### ❌ Bad
```
"Make it better"
(What aspect? How?)
```

### ✅ Good
```
"This PRD has 15 features. That's too many.
Keep only the 5 that are absolutely essential for v0.1.
Focus on the core workflow: [describe workflow]."
```

---

### ❌ Bad
```
"What's the best tech stack?"
(No context about your skills/preferences)
```

### ✅ Good
```
"Given:
- I know TypeScript well
- Need to support 100 users initially
- Prefer managed services (limited DevOps time)
- Budget: $20/month max

Recommend a stack for this PRD: [paste PRD]"
```

## The Golden Rules

1. **Plan before you code** - Don't skip Agents 1-5
2. **Lock before you proceed** - Review and approve each artifact
3. **Scope ruthlessly** - 5 MUST features max for v0.1
4. **Test as you build** - Don't save all testing for the end
5. **Deploy early** - Ship v0.1 in 2-4 weeks, not 2-4 months
6. **Measure what matters** - Instrument analytics from day 1
7. **Iterate based on data** - Use Agent 9 to guide v0.2

## Next Steps

1. **Read:** [QUICK_START.md](QUICK_START.md)
2. **Do:** Open [agents/agent-0-orchestrator.md](agents/agent-0-orchestrator.md)
3. **Build:** Paste prompt into Claude/ChatGPT with your idea

---

**Bookmark this page for quick reference!**
