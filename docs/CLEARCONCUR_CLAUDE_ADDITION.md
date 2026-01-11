# Addition to ClearConcur CLAUDE.md

Add this section to `/Users/adrianstier/reimbursement-ucsb/docs/CLAUDE.md` to enable the agent workflow:

---

## Agent Workflow Integration

This project uses the AI Agent Workflow system from `../ai-agent-workflow/` for structured development.

### Available Agents

| Agent | Use For |
|-------|---------|
| Agent 0 - Orchestrator | Project coordination, deciding next steps |
| Agent 1 - Problem Framer | Clarifying new features/problems |
| Agent 3 - Product Manager | Writing PRDs, feature specs |
| Agent 5 - System Architect | API design, data modeling |
| Agent 6 - Engineer | Implementation |
| Agent 7 - QA Engineer | Test strategy and writing |
| Agent 10 - Debug Detective | Triaging bugs |
| Agent 17 - Security Auditor | Security review |
| Agent 18 - Code Reviewer | PR review |
| Agent 19 - Database Engineer | Migrations, query optimization |

### How to Use

1. **Start any session** with the Orchestrator prompt (see integration guide)
2. **For new features**, go: Agent 1 → Agent 3 → Agent 5 → Agent 6 → Agent 7
3. **For bugs**, go: Agent 10 → [appropriate debug agent] → Agent 6
4. **For PRs**, use: Agent 17 (security) + Agent 18 (code review)

### Project-Specific Constraints

When invoking any agent, remind it of:

```yaml
project: ClearConcur
constraints:
  - Human-in-the-loop review is MANDATORY
  - Store raw OCR + model outputs (auditability)
  - NO Concur API integration in Phase 1
  - NO browser automation or credential storage
  - Keep logic inspectable
tech_stack:
  frontend: React + TypeScript + Vite + Tailwind
  backend: Python + FastAPI + SQLAlchemy
  database: PostgreSQL
  ai: OpenAI Vision API
  storage: S3-compatible
existing_patterns:
  api_routes: backend/app/routes.py
  models: backend/app/models.py
  frontend_components: frontend/src/App.tsx
  extraction_prompts: ai-prompts/
```

### Quick Prompts

**Start a work session:**
```
I'm working on ClearConcur. Current focus: [describe task]

Existing code is in:
- backend/app/ (FastAPI)
- frontend/src/ (React)
- ai-prompts/ (LLM prompts)

Constraints: Human-in-the-loop mandatory, no Concur integration, store raw outputs.

[Your specific request]
```

**For implementation:**
```
Implement [feature] for ClearConcur.

Match existing patterns in [relevant file].
Follow FastAPI/React conventions already in the codebase.
Include error handling and loading states.
```

**For debugging:**
```
Debug: [describe issue]

Relevant files: [list]
Error message: [if any]
Steps to reproduce: [if known]

Start with diagnosis before suggesting fixes.
```
