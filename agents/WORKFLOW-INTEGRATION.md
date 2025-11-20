# Agent Workflow Integration & Handoff Specification

## Overview

This document defines how agents communicate, what they produce, and what they consume. It ensures smooth handoffs and clear validation gates throughout the product development workflow.

---

## Workflow Timeline

**Total v0.1 Timeline: ~4 weeks**

| Phase | Agents | Duration | Output |
|-------|--------|----------|--------|
| Discovery | 0 → 1 → 2 | 3-4 days | Problem Brief, Competitive Analysis |
| Definition | 3 → 4 → 5 | 3-4 days | PRD, UX Flows, Architecture |
| Implementation | 6 → 7 | 10-14 days | Working Code, Tests |
| Launch | 8 → 9 | 2-3 days | Deployed App, Analytics |

---

## Agent Choreography

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT 0: ORCHESTRATOR                     │
│         (Invoked at start, after milestones, when stuck)     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 1: DISCOVERY (3-4 days)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐      ┌─────────────┐                       │
│  │  AGENT 1    │      │  AGENT 2    │                       │
│  │  Problem    │─────▶│  Competitive│                       │
│  │  Framer     │      │  Mapper     │                       │
│  └─────────────┘      └──────┬──────┘                       │
│                              │                               │
│  ◆ GATE 1: Problem & Market Validated                       │
│    □ Problem is specific and testable                       │
│    □ Target user is clearly defined                         │
│    □ Market opportunity exists                              │
│    □ Wedge strategy is feasible for solo builder            │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 2: DEFINITION (3-4 days)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐  │
│  │  AGENT 3    │      │  AGENT 4    │      │  AGENT 5    │  │
│  │  Product    │─────▶│  UX         │─────▶│  Architect  │  │
│  │  Manager    │      │  Designer   │      │             │  │
│  └─────────────┘      └─────────────┘      └──────┬──────┘  │
│                                                    │         │
│  ◆ GATE 2: Design & Architecture Validated         │         │
│    □ PRD has 5-8 MUST features (no more)          │         │
│    □ All features map to UX flows                 │         │
│    □ Architecture can be built in 2-4 weeks       │         │
│    □ Tech stack is "boring" and proven            │         │
│                                                    │         │
│  ⟳ FEEDBACK LOOP: If Architect says "infeasible"  │         │
│    → Return to Agent 3 to cut scope               │         │
└────────────────────────────────────────────────────┼────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────┐
│            PHASE 3: IMPLEMENTATION (10-14 days)              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐      ┌─────────────┐                       │
│  │  AGENT 6    │◀────▶│  AGENT 7    │                       │
│  │  Engineer   │      │  QA Engineer│                       │
│  └─────────────┘      └──────┬──────┘                       │
│                              │                               │
│  ◆ GATE 3: Code Complete                                    │
│    □ All MUST features implemented                          │
│    □ Tests pass (70%+ coverage for MUST features)           │
│    □ No critical/high severity bugs                         │
│    □ Code reviewed                                          │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               PHASE 4: LAUNCH (2-3 days)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐      ┌─────────────┐                       │
│  │  AGENT 8    │─────▶│  AGENT 9    │                       │
│  │  DevOps     │      │  Analytics  │                       │
│  └─────────────┘      └──────┬──────┘                       │
│                              │                               │
│  ◆ GATE 4: Launch Ready                                     │
│    □ Deployed to production                                 │
│    □ Monitoring & alerts configured                         │
│    □ Analytics instrumented                                 │
│    □ 5 users can complete core workflow                     │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │   v0.1 LIVE!    │
                    │  Return to      │
                    │  Agent 0 for    │
                    │  v0.2 planning  │
                    └─────────────────┘
```

---

## Handoff Specifications

### Agent 0 (Orchestrator) → Agent 1 (Problem Framer)

**Orchestrator Outputs:**
- Recommended next action with ready-to-use prompt
- Current project context summary

**Problem Framer Expects:**
- Initial idea description (1-3 sentences)
- Known constraints (timeline, budget, tech preferences)
- Any existing research or user feedback

**File Format:** None (conversational handoff)

---

### Agent 1 (Problem Framer) → Agent 2 (Competitive Mapper)

**Problem Framer Outputs:**
```
artifacts/problem-brief-v0.1.md
├── Problem Statement (specific, testable)
├── Target User Persona (1-2 personas)
├── Jobs-to-be-Done (3-5 JTBDs with priorities)
├── Success Metrics (measurable)
└── Out of Scope (explicit exclusions)
```

**Competitive Mapper Expects:**
- Problem Brief with clear target user
- Understanding of what "success" looks like
- Constraints that affect positioning

**Validation:** Problem Brief must have specific user persona before proceeding

---

### Agent 2 (Competitive Mapper) → Agent 3 (Product Manager)

**Competitive Mapper Outputs:**
```
artifacts/competitive-analysis-v0.1.md
├── Competitor Landscape (5-10 competitors)
├── Gap Analysis (underserved needs)
├── Differentiation Angles (5 possibilities)
├── Recommended Wedge Strategy
└── Positioning Statement
```

**Product Manager Expects:**
- Clear wedge strategy for v0.1
- Understanding of competitive landscape
- Feasibility assessment for solo builder

**Validation:** Wedge must be buildable in 2-4 weeks by solo developer

---

### Agent 3 (Product Manager) → Agent 4 (UX Designer)

**Product Manager Outputs:**
```
artifacts/prd-v0.1.md
├── Vision & Goals
├── Target User (from Problem Brief)
├── Features (5-8 MUST, 3-5 SHOULD, 2-3 NICE)
├── User Stories with Acceptance Criteria
├── Use Cases (narrative flows)
├── Success Metrics
└── Scope Flex Plan (what to cut if behind)
```

**UX Designer Expects:**
- Feature list with clear priorities
- User stories with acceptance criteria
- Use cases to turn into flows

**Validation:** No more than 8 MUST features; all have testable acceptance criteria

---

### Agent 4 (UX Designer) → Agent 5 (Architect)

**UX Designer Outputs:**
```
artifacts/ux-design-v0.1.md
├── User Journey Maps (per use case)
├── Screen Flows (ASCII wireframes)
├── Component Inventory
├── Information Architecture
├── Interaction Patterns
├── Accessibility Requirements
└── UX Risks
```

**Architect Expects:**
- Screen inventory (how many screens?)
- Component complexity (custom vs. library)
- Data requirements per screen
- User flow complexity

**Validation:** Every PRD feature must map to a UX flow

---

### Agent 5 (Architect) → Agent 6 (Engineer)

**Architect Outputs:**
```
artifacts/architecture-v0.1.md
├── System Overview (monolith, managed services)
├── Tech Stack (specific choices, not options)
├── Data Model (entities, relationships)
├── API Design (endpoints, auth)
├── Security Basics
├── Implementation Sequence (4 phases)
├── Risks & Mitigations
└── Anti-Patterns to Avoid
```

**Engineer Expects:**
- Specific tech stack (not "Postgres or MySQL")
- Clear implementation sequence
- Data model ready to implement
- API contracts defined

**Validation:** Architect confirms "This can be built in 2-4 weeks by solo developer"

---

### Agent 6 (Engineer) ↔ Agent 7 (QA Engineer)

**Bidirectional Relationship:**

Engineer → QA:
- Implemented features for testing
- Code for review
- Questions about testability

QA → Engineer:
- Test strategy per feature
- Bug reports with reproduction steps
- Acceptance criteria clarification

**File Formats:**
- Code in repository
- Tests in `tests/` directory
- Bug reports as GitHub Issues

---

### Agent 7 (QA) → Agent 8 (DevOps)

**QA Outputs:**
- All tests passing
- No critical/high bugs
- Performance baseline established

**DevOps Expects:**
- Deployable code
- Environment variables documented
- Database migrations tested

**Validation:** Test suite runs in < 5 minutes; all critical paths covered

---

### Agent 8 (DevOps) → Agent 9 (Analytics)

**DevOps Outputs:**
- Production deployment
- Staging environment
- Monitoring configured
- CI/CD pipeline

**Analytics Expects:**
- Running application to instrument
- Access to deploy analytics code
- Understanding of user flows to track

**Validation:** App is live and accessible

---

### Agent 9 (Analytics) → Agent 0 (Orchestrator)

**Analytics Outputs:**
- Instrumented events
- Dashboard/reports
- Initial data (after users)
- Experiment recommendations

**Orchestrator Expects:**
- What we learned from v0.1
- Recommendations for v0.2
- Prioritized improvements

**This completes the cycle and starts v0.2 planning.**

---

## Validation Gates

### Gate 1: Problem & Market Validated
**When:** After Agent 1 & 2 complete
**Criteria:**
- [ ] Problem statement is specific (not vague)
- [ ] Target user is a real persona (not "everyone")
- [ ] At least one underserved need identified
- [ ] Wedge strategy is feasible for solo builder in 2-4 weeks
- [ ] No fundamental market risks identified

**If fails:** Return to Agent 1 to reframe problem or narrow scope

---

### Gate 2: Design & Architecture Validated
**When:** After Agent 3, 4, 5 complete
**Criteria:**
- [ ] PRD has ≤8 MUST features
- [ ] Every PRD feature maps to a UX flow
- [ ] Every UX flow maps to architecture components
- [ ] Architect confirms feasibility (2-4 weeks)
- [ ] Tech stack is "boring" (proven, well-documented)
- [ ] No custom auth, no microservices, no premature optimization

**If fails:** Return to Agent 3 to cut scope or simplify

---

### Gate 3: Code Complete
**When:** After Agent 6 & 7 complete
**Criteria:**
- [ ] All MUST features implemented
- [ ] Test coverage: 100% for MUST, 70% for SHOULD, 30% for NICE
- [ ] All tests passing
- [ ] No critical or high severity bugs
- [ ] Code reviewed (even self-review)
- [ ] Documentation for complex/public APIs

**If fails:** Continue implementation or cut SHOULD/NICE features

---

### Gate 4: Launch Ready
**When:** After Agent 8 & 9 complete
**Criteria:**
- [ ] Production deployment successful
- [ ] Error tracking configured (Sentry or similar)
- [ ] Basic monitoring in place
- [ ] Analytics events firing correctly
- [ ] 5 test users can complete core workflow
- [ ] Rollback procedure documented

**If fails:** Fix deployment issues before launch

---

## Error Recovery Procedures

### Scenario: Engineer discovers architecture is infeasible
1. Engineer documents specific blocker
2. Escalate to Architect (Agent 5)
3. Architect proposes alternative OR escalates to PM (Agent 3)
4. PM cuts scope if needed
5. Update PRD, Architecture, resume implementation

### Scenario: QA finds critical bug that blocks launch
1. QA documents bug with severity assessment
2. Engineer fixes (priority over new features)
3. If fix requires architecture change, escalate to Architect
4. Retest and proceed

### Scenario: Competitive analysis invalidates problem framing
1. Competitive Mapper documents conflict
2. Return to Problem Framer (Agent 1)
3. Reframe problem or identify different wedge
4. Continue from Agent 2

### Scenario: User feedback post-launch contradicts assumptions
1. Analytics (Agent 9) documents findings
2. Return to Orchestrator (Agent 0)
3. Plan v0.2 with corrected assumptions
4. May need to revisit Problem Framing

---

## Tool Recommendations

| Agent | Recommended Tools |
|-------|-------------------|
| Agent 0 (Orchestrator) | This dashboard, Claude |
| Agent 1 (Problem Framer) | Claude, Notion/Markdown |
| Agent 2 (Competitive Mapper) | Claude, spreadsheet for comparison |
| Agent 3 (Product Manager) | Claude, Markdown for PRD |
| Agent 4 (UX Designer) | ASCII art, Excalidraw, Figma (optional) |
| Agent 5 (Architect) | Claude, Mermaid diagrams |
| Agent 6 (Engineer) | Claude Code, Cursor, VS Code |
| Agent 7 (QA Engineer) | Playwright, Vitest/Jest |
| Agent 8 (DevOps) | GitHub Actions, Vercel, Railway |
| Agent 9 (Analytics) | PostHog (recommended), Mixpanel |

---

## Anti-Patterns Catalog

### Discovery Phase (Agents 1-2)
- ❌ Skipping user research ("I know what users want")
- ❌ Targeting "everyone" instead of specific persona
- ❌ Ignoring competitors ("My idea is unique")
- ❌ Choosing crowded market without clear wedge

### Definition Phase (Agents 3-5)
- ❌ More than 8 MUST features for v0.1
- ❌ Vague acceptance criteria ("user can easily...")
- ❌ UX flows that don't match PRD features
- ❌ Architecture decisions before UX is clear
- ❌ Microservices, custom auth, Redis for v0.1
- ❌ "We'll figure out deployment later"

### Implementation Phase (Agents 6-7)
- ❌ Coding without reading PRD/Architecture
- ❌ Skipping tests for "simple" features
- ❌ Not reviewing own code
- ❌ Ignoring error handling
- ❌ Premature optimization

### Launch Phase (Agents 8-9)
- ❌ No error tracking before launch
- ❌ No rollback procedure
- ❌ Tracking vanity metrics
- ❌ No way to contact early users
- ❌ Launching without any analytics

---

## Quick Reference: Agent Decision Matrix

**"Which agent should I invoke next?"**

| Current State | Next Agent | Reason |
|---------------|------------|--------|
| Just have idea | Agent 1 | Need to define problem clearly |
| Have problem brief | Agent 2 | Need to validate market opportunity |
| Have competitive analysis | Agent 3 | Need to scope v0.1 features |
| Have PRD | Agent 4 | Need to design user experience |
| Have UX flows | Agent 5 | Need to design architecture |
| Have architecture | Agent 6 | Ready to implement |
| Have code, need tests | Agent 7 | Need test strategy |
| Code complete, tests pass | Agent 8 | Ready to deploy |
| Deployed to production | Agent 9 | Need to instrument analytics |
| Have user data | Agent 0 | Plan v0.2 based on learnings |
| Stuck or confused | Agent 0 | Get guidance on next steps |
| After major milestone | Agent 0 | Reassess and plan next phase |

---

## Artifact File Structure

```
project/
├── artifacts/
│   ├── problem-brief-v0.1.md      (Agent 1)
│   ├── competitive-analysis-v0.1.md (Agent 2)
│   ├── prd-v0.1.md                (Agent 3)
│   ├── ux-design-v0.1.md          (Agent 4)
│   ├── architecture-v0.1.md       (Agent 5)
│   └── analytics-plan-v0.1.md     (Agent 9)
├── src/                           (Agent 6)
├── tests/                         (Agent 7)
├── .github/workflows/             (Agent 8)
└── docs/
    └── runbooks/                  (Agent 8)
```

---

## Version History

- v1.0 (2024-01): Initial workflow integration specification
