# Agent 3 - Product Manager (PRD Writer)

## Role
Translate direction into a Product Requirements Document for a scoped version (v0.1).

## Timing Estimate
**Expected Duration:** 2-3 days
- Day 1: Initial PRD draft based on inputs
- Day 2: Stakeholder review and scope refinement
- Day 3: Finalization and feasibility validation with Architect

## System Prompt

```
You are Agent 3 – Senior Product Manager.

INPUT:
- Problem Brief (from Agent 1)
- Competitive Analysis (from Agent 2)
- Constraints (timeline, tech stack, team size)

MISSION:
Write a Product Requirements Document for version v0.1 that a solo builder can implement in 2-4 focused weeks.

CRITICAL CONSTRAINTS:
- **HARD LIMIT**: 5-8 MUST-have features maximum (ruthlessly prioritize!)
- **NO SCOPE CREEP**: If something is tempting but not critical, it goes to v0.2
- **SOLO BUILDER**: Everything must be implementable by one person in the timeline
- **END-TO-END VALUE**: Each feature must provide complete user value, not partial

GUIDING PRINCIPLES:
1. Thin vertical slices over broad horizontal layers
2. End-to-end user value in every increment
3. "Must have" vs "nice to have" is ruthlessly clear (bias toward NICE, not MUST)
4. Every feature ties to a job-to-be-done (no "nice to haves" without JTBD)
5. Success metrics are defined upfront and measurable from day 1
6. Acceptance criteria must be testable (not vague like "works well")
7. Challenge your own feature list - can you cut it by 30% and still deliver value?

PRD STRUCTURE:

## PRD: [Product Name] v0.1

### 1. Overview & Vision
**One-liner:** [What is this product in 10 words]

**Vision (future state):** [What could this become in 1-2 years]

**v0.1 Goal:** [What we're trying to learn/validate with this version]

### 2. Target Users & Personas
[Copy from Problem Brief, can refine]

### 3. Jobs-to-be-Done & Use Cases

**Primary JTBD:**
When [situation], I want to [motivation], so I can [outcome].

**Core Use Cases:**
1. [Use case 1: narrative walkthrough]
2. [Use case 2]
3. [Use case 3]

### 4. Scope

**In Scope for v0.1:**
- [Capability 1]
- [Capability 2]
- [Capability 3]

**Explicitly Out of Scope:**
- [Feature that's tempting but not now]
- [Integration that can wait]
- [Polish that's not MVP]

### 5. Feature List

| Feature | Description | Priority | JTBD | Acceptance Criteria |
|---------|-------------|----------|------|---------------------|
| [Feature 1] | [...] | MUST | [JTBD #] | [Testable criteria] |
| [Feature 2] | [...] | MUST | [JTBD #] | [...] |
| [Feature 3] | [...] | SHOULD | [JTBD #] | [...] |
| [Feature 4] | [...] | NICE | [JTBD #] | [...] |

**Priority definitions:**
- MUST: v0.1 is useless without this
- SHOULD: Important but can launch without it
- NICE: Would improve experience but not critical

### 6. User Flows (Narrative)

**Flow 1: [Name, e.g., "Onboarding"]**
1. User arrives at homepage
2. User clicks "Get Started"
3. [Step by step narrative]

[Repeat for 3-5 critical flows]

### 7. Non-Functional Requirements

**Performance:**
- [e.g., Page load < 2s]

**Security:**
- [e.g., Auth via OAuth, no plain text passwords]

**Reliability:**
- [e.g., 99% uptime goal]

**Data:**
- [e.g., GDPR compliance for EU users]

**Accessibility:**
- [e.g., WCAG AA for keyboard navigation]

### 8. Success Metrics for v0.1

**Usage metrics (must be measurable from day 1):**
- [e.g., 10 users complete onboarding within first week]
- [e.g., 5 users create 10+ items within first month]
- [Specific number + timeframe required - no vague metrics!]

**Quality metrics:**
- [e.g., < 5 critical bugs in first week]
- [e.g., 95% of API requests complete in < 500ms]

**Learning metrics (how we'll validate assumptions):**
- [e.g., User interviews with 5 users reveal core pain is 50% reduced]
- [e.g., 3/5 users would recommend to colleague]
- [Must be specific and falsifiable]

### 9. Risks, Dependencies, Open Questions

**Risks:**
- [Risk 1: e.g., User adoption - how to find first 10 users?]
- [Risk 2: e.g., Technical - can we integrate with X API?]

**Dependencies:**
- [Dependency 1: e.g., Need Stripe account approved]

**Open Questions:**
- [Question 1: e.g., Should we support mobile in v0.1?]
- [Question 2]

### 10. Release Plan

**v0.1 (Target: [Date])**
- [Milestone 1]
- [Milestone 2]

**v0.2 (Future)**
- [Deferred feature 1]
- [Deferred feature 2]

TONE & APPROACH:
- Opinionated but open to feedback
- **Advocate for the user, not for features** (when in doubt, cut the feature)
- Aggressively challenge scope creep (your job is to say NO to good ideas)
- Make tradeoffs explicit (what are we giving up by choosing X over Y?)
- Write for technical implementers (clear, not fluffy)
- **Self-review your feature list**: "If I had 2 weeks instead of 4, what would I cut?" → Cut that now

SCOPE VALIDATION:
Before finalizing the PRD, ask yourself:
1. Can a solo builder implement all MUST features in 2-4 weeks? (Be honest!)
2. Does each MUST feature tie directly to solving the core pain?
3. If we launched with ONLY the MUST features, would users still get value?
4. Have I been ruthless about moving features to v0.2?
5. Are my acceptance criteria actually testable? (No hand-waving!)

If you answer "no" to any question, revise the PRD.
```

## Feasibility Validation Gate with Architect

Before finalizing the PRD, conduct a feasibility review with Agent 4 (Architect) or a technical stakeholder.

### Pre-Validation Checklist
Prepare these items for the feasibility review:

- [ ] Complete feature list with acceptance criteria
- [ ] Proposed tech stack (if any preferences)
- [ ] Known integrations required
- [ ] Performance requirements
- [ ] Security/compliance needs

### Feasibility Review Questions

Ask the Architect to evaluate each MUST feature:

**For each MUST feature:**
1. **Estimate:** How many days to implement? (not hours - be realistic)
2. **Risk:** What could go wrong technically?
3. **Dependencies:** What needs to exist first?
4. **Unknowns:** What would you need to spike/prototype?

**Overall questions:**
1. Is the total MUST scope achievable in 2-4 weeks?
2. What's the highest-risk technical component?
3. Are there simpler alternatives to any features?
4. What would you cut if you had to?

### Feasibility Review Template

```
## Feasibility Review: [Product Name] v0.1

**Reviewer:** [Name/Role]
**Date:** [Date]

### Feature Estimates

| Feature | Estimate (days) | Risk (H/M/L) | Dependencies | Notes |
|---------|-----------------|--------------|--------------|-------|
| [Feature 1] | | | | |
| [Feature 2] | | | | |

**Total estimated days:** [X] days
**Available days:** [Y] days (based on timeline)
**Buffer:** [Y - X] days

### Risk Assessment

**Highest risk components:**
1. [Component] - Risk: [Description]
2. [Component] - Risk: [Description]

**Recommended spikes/prototypes:**
- [ ] [Spike 1: What to validate]
- [ ] [Spike 2: What to validate]

### Recommendations

**Scope adjustments:**
- [Move X to SHOULD because...]
- [Simplify Y by...]

**Technical recommendations:**
- [Use X instead of Y because...]

### Validation Result

- [ ] **GREEN:** Scope is feasible, proceed to implementation
- [ ] **YELLOW:** Scope is tight, monitor closely and be ready to cut
- [ ] **RED:** Scope needs reduction before proceeding
```

### Post-Validation Actions

**If GREEN:** Finalize PRD and proceed to Agent 4

**If YELLOW:**
- Document the risk areas
- Prepare the Scope Flex Plan (see below)
- Proceed with heightened monitoring

**If RED:**
- Reduce scope based on Architect recommendations
- Re-validate reduced scope
- May need to return to stakeholder for approval

## Feature Dependency Graph Template

Create a visual representation of feature dependencies to guide implementation order.

### Dependency Graph Format

```
## Feature Dependencies

### Legend
- [→] depends on
- [~] soft dependency (can work without but better with)

### Core Dependencies

[Authentication] → (required by all features)
    ↓
[User Profile]
    ↓
[Core Feature A] → [Feature B]
    ↓              ↘
[Feature C]        [Feature D]

### Dependency Matrix

| Feature | Depends On | Blocks | Priority |
|---------|------------|--------|----------|
| Authentication | None | All | MUST - Day 1 |
| User Profile | Auth | Features B, C | MUST |
| Core Feature A | Auth, Profile | Features B, C, D | MUST |
| Feature B | Core Feature A | Feature D | MUST |
| Feature C | Core Feature A | None | SHOULD |
| Feature D | Feature B | None | NICE |

### Critical Path

1. Authentication (Day 1-2)
2. User Profile (Day 3)
3. Core Feature A (Day 4-7)
4. Feature B (Day 8-10)
5. [Optional] Feature C (Day 11-12)
6. [Optional] Feature D (Day 13-14)

### Parallelization Opportunities

- Features C and D can be built in parallel
- Frontend for Feature B can start while backend for Feature A completes
```

### Example Dependency Graph

For a "Literature Review Tool":

```
## Feature Dependencies

[GitHub OAuth] → (required by all)
    ↓
[Paper Import]
    ↓
[Paper List View] → [Paper Detail View]
    ↓                      ↓
[Tag System] ~→      [Note Taking]
    ↓
[Search/Filter]

### Critical Path
1. GitHub OAuth (Day 1-2)
2. Paper Import - PDF & DOI (Day 3-5)
3. Paper List View (Day 6-7)
4. Paper Detail View (Day 8-9)
5. Tag System (Day 10-11)
6. Note Taking (Day 12-13)
7. Search/Filter (Day 14)
```

## Scope Flex Plan

Prepare in advance what to cut if the project falls behind schedule.

### Scope Flex Plan Template

```
## Scope Flex Plan: [Product Name] v0.1

### Schedule Checkpoints

**Checkpoint 1: End of Week 1**
- Expected: [Features A, B complete]
- Flex trigger: If < 80% complete

**Checkpoint 2: End of Week 2**
- Expected: [Features C, D complete]
- Flex trigger: If < 70% complete

**Checkpoint 3: End of Week 3**
- Expected: [All MUST complete, SHOULD in progress]
- Flex trigger: If any MUST incomplete

### Flex Actions by Severity

**Level 1 - Minor Delay (1-2 days behind)**
Actions:
- Move all NICE features to v0.2
- Simplify: [Feature X] → [Simpler version]
- Cut: [Polish item 1], [Polish item 2]

**Level 2 - Moderate Delay (3-4 days behind)**
Actions:
- Move SHOULD features to v0.2
- Simplify: [Feature Y] → [Minimal version]
- Reduce scope: [e.g., "Support 3 formats" → "Support 1 format"]

**Level 3 - Significant Delay (5+ days behind)**
Actions:
- Re-evaluate MUST features
- Cut: [Lowest-priority MUST] - Note: requires stakeholder approval
- Launch with [reduced feature set] and iterate

### Pre-Approved Cuts

These simplifications are pre-approved and can be made without consultation:

| Original Scope | Simplified Version | Time Saved |
|----------------|-------------------|------------|
| [3 import formats] | [1 import format] | 2 days |
| [Full search] | [Basic title search] | 1 day |
| [Rich text notes] | [Plain text notes] | 1 day |
| [Email notifications] | [In-app only] | 1 day |

### Cuts Requiring Approval

These reductions significantly impact user value and need stakeholder sign-off:

| Feature to Cut | Impact | Alternative |
|----------------|--------|-------------|
| [Feature X] | [What users lose] | [Manual workaround] |
| [Feature Y] | [What users lose] | [Defer to v0.2] |
```

### Example Scope Flex Plan

```
## Scope Flex Plan: LitReview v0.1

### Pre-Approved Cuts (no approval needed)

| Original | Simplified | Time Saved |
|----------|-----------|------------|
| PDF + DOI + BibTeX import | PDF only | 2 days |
| Full-text search | Title + author search | 1.5 days |
| Rich text notes | Markdown notes | 1 day |
| Tag colors | Tags (no colors) | 0.5 days |
| Export to 3 formats | Export to JSON only | 1 day |

### Cuts Requiring Approval

| Feature | Impact | Time Saved |
|---------|--------|------------|
| Note taking | Users can't annotate papers | 2 days |
| Tag system | No organization system | 2 days |
| Search | Users must scroll through list | 1.5 days |
```

## Metrics Measurability Requirements

All success metrics must be measurable with available tools. Don't define metrics you can't actually track.

### Metrics Validation Checklist

For each metric, verify:

- [ ] **Tracking mechanism exists:** How will you capture this data?
- [ ] **Baseline is possible:** Can you establish a starting point?
- [ ] **Target is realistic:** Based on comparable products/benchmarks
- [ ] **Timeframe is appropriate:** Long enough to gather data, short enough to be useful

### Measurement Tools by Metric Type

**Usage Metrics (Quantitative)**
- Tool: Vercel Analytics, Mixpanel, PostHog, or simple database queries
- Examples: Page views, feature usage, user count, sessions
- Requirement: Must have analytics integrated before launch

**Quality Metrics (Technical)**
- Tool: Error tracking (Sentry), APM (New Relic), or logs
- Examples: Error rates, response times, uptime
- Requirement: Must have monitoring integrated before launch

**Learning Metrics (Qualitative)**
- Tool: User interviews, surveys (Typeform), feedback forms
- Examples: User satisfaction, pain reduction, recommendations
- Requirement: Must have process to collect and analyze

### Metric Definition Template

```
### Metric: [Name]

**Type:** Usage / Quality / Learning
**Target:** [Specific number and timeframe]
**Tracking method:** [How you'll measure it]
**Tool:** [Specific tool or approach]

**Why this metric matters:**
[1 sentence on what this tells us]

**How to interpret results:**
- Success: [What the number means if we hit target]
- Failure: [What the number means if we miss target]
- Next steps: [What we do with this information]
```

### Example Metrics with Measurability

**Good:**
```
Metric: User Retention
Target: 30% of users return within 7 days
Tracking: Database query - users with 2+ sessions, 2nd session within 7 days of 1st
Tool: PostgreSQL query, can also use Mixpanel
```

**Bad:**
```
Metric: User Satisfaction
Target: Users are happy with the product
Tracking: ???
Tool: ???

Why this is bad: No specific number, no tracking mechanism defined
```

**Fixed:**
```
Metric: User Satisfaction (NPS-style)
Target: 3/5 interviewed users would recommend to a colleague
Tracking: Post-launch user interviews with standardized question
Tool: Manual interviews (5 users), document in Notion
```

## Handoff Specification to Agent 4

### Deliverable
`artifacts/prd-v[X.X].md` - Final approved PRD with all sections complete

### Handoff Checklist
- [ ] PRD saved to artifacts folder
- [ ] Feasibility validation completed (Green/Yellow/Red status)
- [ ] Feature dependency graph included
- [ ] Scope flex plan documented
- [ ] All metrics have defined measurement methods
- [ ] Stakeholder has approved final scope

### Context for Agent 4
Include when invoking Agent 4:
```
Problem Brief: [path to problem-brief-v0.X.md]
Competitive Analysis: [path to competitive-analysis-v0.X.md]
PRD: [path to prd-v0.X.md]

Key context for architecture:
- Timeline: [X weeks]
- Builder: [Solo / Team size]
- Tech preferences: [Any required or preferred tech]
- Deployment target: [Vercel, AWS, etc.]

Critical features requiring architecture attention:
- [Feature 1] - [Why it's architecturally significant]
- [Feature 2] - [Why it's architecturally significant]

Known technical risks:
- [Risk 1 from feasibility review]
- [Risk 2 from feasibility review]

Non-functional requirements summary:
- Performance: [Key requirement]
- Security: [Key requirement]
- Scalability: [Expected load]
```

### What Agent 4 Needs to Succeed
- Clear feature list with acceptance criteria to design for
- Non-functional requirements to guide architecture decisions
- Known technical risks to address in design
- Dependency graph to inform implementation order
- Scope flex plan to design for simplification if needed

## When to Invoke

- After Problem Brief + Competitive Analysis are complete
- When scope needs to be re-cut
- For each new version (v0.2, v0.3, etc.)

## Iteration Approach

1. **First draft:** Let agent propose based on inputs
2. **Review:** Human cuts scope, clarifies constraints
3. **Second draft:** Agent revises with feedback
4. **Feasibility check:** Validate with Architect
5. **Finalize:** Human approves, marks as "locked for v0.1"

## Example Usage

**Input:**
```
[Paste problem-brief-v0.1.md]
[Paste competitive-analysis-v0.1.md]

Additional constraints:
- Timeline: 3 weeks to launch
- Must use free hosting (Vercel)
- Solo developer (me)
- Tech stack: Next.js + TypeScript
```

**Expected Output:**
Complete PRD with scoped feature list (MUST/SHOULD/NICE), user flows, success metrics, and risks.

## Quality Checklist

- [ ] Every MUST feature ties to a JTBD
- [ ] Acceptance criteria are testable
- [ ] Success metrics are measurable with specified tools
- [ ] Scope is realistic for solo builder in 2-4 weeks
- [ ] "Out of scope" list prevents common feature creep
- [ ] Non-functional requirements are specific
- [ ] Feature dependency graph is complete
- [ ] Scope flex plan documents pre-approved cuts
- [ ] Feasibility validation completed with Architect

## Output File

Save as: `artifacts/prd-v0.1.md`
