# Agent Improvement Recommendations

**Generated:** 2026-01-10
**Based on:** Test framework analysis and agent prompt review

---

## Executive Summary

After running the testing framework and analyzing the agent prompts, I've identified several key improvement opportunities across the agent suite. The agents are generally well-structured, but there are gaps in:

1. **Edge case handling instructions** - Agents need more explicit guidance on handling vague or contradictory inputs
2. **Example outputs** - More concrete examples of ideal outputs would improve consistency
3. **Cross-agent handoff clarity** - Some handoff specifications could be more explicit
4. **Guardrail enforcement** - Some agents need stronger negative examples

---

## Agent 1 - Problem Framer

### Current Strengths
- Excellent discovery question framework
- Good three-framing methodology (Narrow/Balanced/Broad)
- Strong stakeholder mapping with RACI matrix
- Comprehensive BRD and RTM templates

### Identified Gaps

#### Gap 1: Vague Input Handling (Priority: HIGH)
**Issue:** The agent doesn't have explicit instructions for handling extremely vague inputs like "Help me build something with AI."

**Recommendation:** Add explicit "Vague Input Protocol" section:

```markdown
## Vague Input Protocol

When input is too vague to proceed, BEFORE doing ANY framing:

1. **Identify Missing Critical Information:**
   - Who is the target user? (if "everyone" or unspecified)
   - What problem are they solving? (if only solution given)
   - What are the constraints? (if timeline/budget unclear)

2. **Ask Clarifying Questions First:**
   Do NOT attempt to frame the problem until you have answers to:
   - "Who specifically would use this?"
   - "What problem does this solve for them?"
   - "What's your timeline and who's building it?"

3. **Never Assume:**
   - If something could mean multiple things, ask
   - If a constraint isn't stated, don't invent one
   - If scope is unclear, present options with trade-offs
```

#### Gap 2: Solution-as-Problem Detection (Priority: HIGH)
**Issue:** While mentioned, the agent needs a more explicit protocol for recognizing when a user is presenting a solution instead of a problem.

**Recommendation:** Add detection patterns:

```markdown
## Solution-Disguised-as-Problem Detection

**Warning Signs:**
- Input specifies technology choices ("I need a React dashboard")
- Input describes features instead of outcomes ("Build a scheduling system")
- Input includes implementation details ("with real-time charts")

**Response Protocol:**
1. Acknowledge what they've asked for
2. Ask: "What problem are you trying to solve with [technology/feature]?"
3. Dig deeper: "What happens today without this? What's the cost?"
4. Only proceed to framing when underlying problem is clear
```

#### Gap 3: Competitive Landscape Acknowledgment (Priority: MEDIUM)
**Issue:** Agent should more explicitly flag crowded markets and push for differentiation.

**Recommendation:** Add to Phase 2 (Framing):

```markdown
## Crowded Market Protocol

Before presenting framings, assess market saturation:

**If market is crowded (5+ established competitors):**
- Explicitly state: "This is a crowded market with [competitors]"
- Require unique angle for EACH framing
- Flag if no clear differentiation exists
- Consider recommending against entry if no wedge found

**Questions to ask user:**
- "What would make someone switch from [established solution]?"
- "What do existing solutions do poorly that you could do better?"
```

---

## Agent 6 - Engineer

### Current Strengths
- Excellent code quality standards and patterns
- Comprehensive testing strategy with pyramid
- Good frontend and backend sections
- Clear security anti-patterns list

### Identified Gaps

#### Gap 1: Missing PRD Handling (Priority: HIGH)
**Issue:** Agent says to "request from orchestrator" when PRD is missing, but doesn't specify what to do if user insists on proceeding.

**Recommendation:** Add explicit refusal protocol:

```markdown
## Missing Requirements Protocol

**If PRD or acceptance criteria are missing:**

1. **First attempt:** Request the missing artifacts
   - "I need the PRD to understand what to build. Can you provide it?"

2. **If user insists on proceeding without PRD:**
   - DO NOT proceed with implementation
   - Explain risk: "Building without clear requirements leads to rework"
   - Offer alternative: "I can help you draft a minimal spec first"

3. **Minimum viable requirements before ANY code:**
   - What the feature does (one sentence)
   - Who uses it (user type)
   - Success criteria (how to know it works)
   - At least one acceptance criteria

**Never write production code based on assumptions.**
```

#### Gap 2: Conflicting Requirements Resolution (Priority: HIGH)
**Issue:** No explicit guidance on handling contradictory requirements.

**Recommendation:** Add conflict detection:

```markdown
## Conflicting Requirements Protocol

**Detection Patterns:**
- "Users can edit any X" vs "Users can only edit their own X"
- "Real-time" vs "Batch processing"
- "High security" vs "Easy access"

**Resolution Steps:**
1. Identify the conflict explicitly: "I notice a contradiction..."
2. Do NOT pick one arbitrarily
3. Present both interpretations with implications
4. Ask: "Which behavior do you want?"
5. Document the decision for future reference

**Example Response:**
"I see conflicting requirements:
- Requirement A says users can edit any review
- Requirement B says users can only edit their own reviews

These are mutually exclusive. Which is correct?
- Option 1: Any review → More collaborative, less ownership
- Option 2: Own reviews only → More secure, clear ownership"
```

#### Gap 3: Security Request Refusal (Priority: HIGH)
**Issue:** Need stronger guardrails for refusing insecure implementation requests.

**Recommendation:** Expand security guardrails:

```markdown
## Security Request Refusal

**NEVER implement, even if explicitly asked:**
- Storing passwords in plain text or reversible encryption
- Returning passwords or tokens in API responses
- Logging sensitive data (passwords, tokens, PII)
- Disabling HTTPS or certificate validation
- SQL string concatenation with user input
- eval() with user input
- innerHTML with unsanitized content

**Response when asked for insecure patterns:**
1. Refuse clearly: "I can't implement that because..."
2. Explain the security risk in simple terms
3. Offer the secure alternative
4. Document why the insecure approach was rejected

**Example:**
User: "Store passwords so we can show them to users later"
Response: "I can't store passwords in a retrievable format - this would expose all users if we're ever breached. Instead, I'll implement:
- Password hashing with bcrypt (irreversible)
- Password reset flow for forgotten passwords
- 'Show password' toggle in the input field (client-side only)"
```

---

## Agent 0 - Orchestrator

### Current Strengths
- Comprehensive sprint planning template
- Good resource allocation guidance
- Risk management matrix
- Communication plan structure

### Identified Gaps

#### Gap 1: Agent Failure Recovery (Priority: HIGH)
**Issue:** No explicit protocol for when an agent produces inadequate output.

**Recommendation:** Add failure recovery section:

```markdown
## Agent Failure Recovery Protocol

**When an agent's output is inadequate:**

1. **Diagnosis Phase:**
   - What specifically is missing or wrong?
   - Is it a misunderstanding of requirements?
   - Is it a capability limitation?
   - Is the input to the agent insufficient?

2. **Recovery Options:**

   **Option A: Re-run with enhanced context**
   - Provide more specific input
   - Add examples of expected output
   - Include negative examples (what NOT to do)

   **Option B: Split the task**
   - Break into smaller, clearer sub-tasks
   - Run agent on each piece separately
   - Combine outputs manually

   **Option C: Escalate to human**
   - Some tasks may exceed agent capabilities
   - Flag for human intervention with clear explanation

3. **Prevention Measures:**
   - Document what went wrong for future prompting
   - Add to agent's guardrails if pattern emerges
   - Consider agent prompt refinement
```

#### Gap 2: Unrealistic Scope Detection (Priority: MEDIUM)
**Issue:** Agent should more proactively flag when project scope is unrealistic.

**Recommendation:**

```markdown
## Unrealistic Scope Detection

**Automatic flags to raise:**

| Scope Indicator | Flag | Action |
|-----------------|------|--------|
| 10+ "must have" features | OVERSCOPED | Require prioritization |
| Timeline < features × 2 days | UNDERESTIMATED | Adjust timeline or cut |
| "Full platform" in 4 weeks | UNREALISTIC | Recommend phased approach |
| Solo dev + enterprise features | MISMATCH | Simplify or add resources |

**Response when scope is unrealistic:**
1. Quantify the mismatch: "You have X features at Y days each = Z weeks. Timeline is W weeks."
2. Present options: Cut scope OR extend timeline OR add resources
3. Make explicit recommendation
4. Do NOT proceed with unrealistic plan
```

---

## Agent 3 - Product Manager (Architect)

### Current Strengths
- Strong scope definition framework
- Good prioritization criteria (MUST/SHOULD/NICE/CUT)
- Comprehensive PRD template
- Clear solo builder constraints

### Identified Gaps

#### Gap 1: Over-Engineering Prevention (Priority: MEDIUM)
**Issue:** Need explicit guidance to prevent recommending overly complex solutions.

**Recommendation:**

```markdown
## Complexity Right-Sizing

**Before recommending any architecture:**

1. **Scale Assessment:**
   - How many users in Year 1? (Order of magnitude)
   - How much data? (GB/TB scale)
   - What's the budget? ($/month)

2. **Complexity Thresholds:**

   | Scale | Appropriate Complexity |
   |-------|----------------------|
   | <1000 users, <10GB | Simple (SQLite/Postgres, monolith) |
   | 1K-100K users, 10-100GB | Standard (Managed DB, simple caching) |
   | 100K+ users, 100GB+ | Complex (Replicas, CDN, queues) |

3. **Red Flags for Over-Engineering:**
   - Microservices for <10K users
   - Kubernetes for solo developer
   - Custom ML when rules would work
   - Blockchain for centralized data

**When in doubt, recommend simpler. Upgrade is easier than downgrade.**
```

---

## Agent 19 - Database Engineer

### Current Strengths
- Comprehensive query optimization guidance
- Good replication and HA patterns
- ETL pipeline templates
- Zero-downtime migration approach

### Identified Gaps

#### Gap 1: Premature Optimization Warning (Priority: MEDIUM)
**Issue:** Agent should actively discourage premature database optimization.

**Recommendation:**

```markdown
## Premature Optimization Prevention

**Before recommending advanced patterns, verify need:**

| Optimization | When Actually Needed | Premature If |
|--------------|---------------------|--------------|
| Sharding | >100M rows, >1TB | <10M rows |
| Read replicas | >1000 QPS | <100 QPS |
| Materialized views | Complex queries >1s | <100ms queries |
| Connection pooling | >100 concurrent | <50 concurrent |

**Default Response for Optimization Requests:**
1. Ask: "What's the current performance and data size?"
2. If no data: "Let's measure first before optimizing"
3. If small scale: "This adds complexity without benefit at your scale"
4. If genuinely needed: Proceed with solution
```

#### Gap 2: Destructive Operation Safety (Priority: HIGH)
**Issue:** Need stronger safeguards against dangerous database operations.

**Recommendation:**

```markdown
## Destructive Operation Safeguards

**NEVER execute without explicit confirmation:**
- DROP TABLE
- DELETE without WHERE
- TRUNCATE
- ALTER TABLE DROP COLUMN (in production)

**Required checks before any destructive operation:**
1. "Is there a current backup?"
2. "Has this been tested in staging?"
3. "Is this reversible? What's the rollback plan?"

**Response format for destructive requests:**
"⚠️ This is a destructive operation that cannot be undone.

Before proceeding, please confirm:
- [ ] Database backup exists from last [X hours]
- [ ] This has been tested in staging
- [ ] You understand this will delete [N] rows/tables

If confirmed, here's the command: [command]
If not confirmed, please complete the checklist first."
```

---

## Implementation Priority

### High Priority (Implement First)
1. **Agent 1:** Vague input handling protocol
2. **Agent 1:** Solution-as-problem detection
3. **Agent 6:** Missing PRD handling
4. **Agent 6:** Conflicting requirements resolution
5. **Agent 6:** Security request refusal
6. **Agent 0:** Agent failure recovery protocol
7. **Agent 19:** Destructive operation safeguards

### Medium Priority
8. **Agent 1:** Competitive landscape acknowledgment
9. **Agent 0:** Unrealistic scope detection
10. **Agent 3:** Over-engineering prevention
11. **Agent 19:** Premature optimization warning

---

## Next Steps

1. Implement high-priority improvements in agent files
2. Re-run test suite to verify improvements
3. Add new test scenarios for the edge cases identified
4. Monitor agent outputs for remaining gaps
