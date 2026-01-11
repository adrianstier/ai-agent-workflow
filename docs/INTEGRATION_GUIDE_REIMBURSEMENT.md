# Integrating AI Agent Workflow with ClearConcur (reimbursement-ucsb)

This guide shows how to use the AI Agent Workflow system to accelerate development of ClearConcur.

## Project Overview

**ClearConcur** is an AI-assisted receipt organization tool for academics that:
- Extracts data from receipt images/PDFs
- Provides human-in-the-loop review UI
- Exports Concur-ready packages (CSV + renamed receipts)

**Current State:**
- React + TypeScript + Vite frontend (partially built)
- Python + FastAPI backend (scaffold with routes)
- PostgreSQL + SQLAlchemy models defined
- OCR/extraction prompts drafted

---

## How to Use the Agent Workflow

### Step 1: Start with the Orchestrator (Agent 0)

Copy this prompt to start any work session:

```
Project: ClearConcur
One-liner: AI-assisted receipt organization and reimbursement prep for academics

Status:
  current_stage: "Building"
  last_orchestrator_check: "[Today's date]"

Artifacts:
  completed:
    - README.md - Product vision and tech stack
    - docs/CLAUDE.md - Implementation contract
    - docs/UCSB_PILOT_ROLLOUT_PLAN.md - Pilot strategy
    - backend/app/models.py - SQLAlchemy models
    - backend/app/routes.py - API endpoints (scaffold)
    - frontend/src/App.tsx - Main React app (~1000 lines)
  in_progress:
    - Receipt extraction accuracy improvements
    - Review UI polish
    - Export functionality

Constraints:
  timeline: "2 weeks to pilot-ready"
  budget: "$50/month max infrastructure"
  tech: "React/TypeScript, Python/FastAPI, PostgreSQL, OpenAI Vision"
  hard_requirements:
    - Human-in-the-loop review mandatory
    - Store raw OCR + model outputs
    - No Concur API integration (Phase 1)

Recent activity:
  - [Describe what you worked on last]

Concerns:
  - [List any blockers or questions]

Please assess project state and recommend next actions.
```

---

## Agent Mapping for ClearConcur

| ClearConcur Need | Agent to Use | When to Invoke |
|------------------|--------------|----------------|
| Define feature scope | Agent 3 - Product Manager | Before starting any new feature |
| Design API endpoints | Agent 5 - System Architect | When adding new backend services |
| Implement features | Agent 6 - Engineer | When writing actual code |
| Write tests | Agent 7 - QA Engineer | After implementing features |
| Debug issues | Agent 10-16 - Debug Suite | When encountering bugs |
| Optimize queries | Agent 19 - Database Engineer | When improving performance |
| Security review | Agent 17 - Security Auditor | Before pilot launch |
| Code review | Agent 18 - Code Reviewer | Before merging PRs |

---

## Example Prompts for ClearConcur

### 1. Adding a New Feature (Receipt Splitting)

**Start with Agent 3 (Product Manager):**

```
I need to add a feature to ClearConcur for splitting multi-item receipts.

## Context
- Users upload receipts that may contain multiple expense categories
- Example: hotel receipt with room + restaurant charge + parking
- Currently we extract as a single receipt
- Users need to split for different expense codes in Concur

## Existing Artifacts
- PRD exists: human-in-the-loop review is mandatory
- Tech stack: React frontend, FastAPI backend, PostgreSQL
- Models: Receipt has fields: vendor, date, amount, currency, category, confidence

## Constraints
- Timeline: 3 days for MVP
- Must work within existing review UI
- Must maintain audit trail of original vs split receipts

Please write a PRD section for this feature with:
1. User stories
2. Acceptance criteria
3. Scope (what's in/out for MVP)
```

---

### 2. Implementing API Endpoint

**Use Agent 6 (Engineer) after PRD is ready:**

```
## Context
I'm building ClearConcur, a receipt organization tool.

## PRD Reference
Feature: Receipt Splitting
- User can split a single receipt into multiple line items
- Original receipt is preserved, new "child" receipts created
- Each child has its own category, amount, notes
- Sum of children must equal or be less than parent amount

## Existing Code
```python
# backend/app/models.py
class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(UUID, primary_key=True)
    trip_id = Column(UUID, ForeignKey("trips.id"))
    vendor = Column(String)
    date = Column(Date)
    amount = Column(Numeric(10, 2))
    currency = Column(String(3))
    category = Column(String)
    status = Column(String)  # pending_review, reviewed, exported
    # ... more fields
```

## Request
Implement the API endpoint for splitting a receipt:
- POST /api/receipts/{receipt_id}/split
- Request body: list of {amount, category, notes}
- Validate amounts sum correctly
- Create child receipts linked to parent
- Return updated receipt tree

Follow FastAPI patterns from existing routes.py
```

---

### 3. Debugging Extraction Issues

**Use Agent 10 (Debug Detective) for triage:**

```
## Problem
Receipt extraction is returning low confidence scores (< 50%) for French Polynesian receipts.

## Symptoms
- XPF currency amounts often misread
- French vendor names partially extracted
- Date format (DD/MM/YYYY) sometimes reversed

## Sample Receipts
- 2025-06-16_Aremiti_FerryTicket_2030XPF
- 2025-06-24_Station_Paopao_Fuel_20000XPF

## Current Extraction Prompt
See: ai-prompts/extract_receipt.md

## Request
1. Diagnose why French Polynesian receipts have low accuracy
2. Suggest specific prompt improvements
3. Recommend whether we need locale-specific extraction logic
```

---

### 4. Database Migration

**Use Agent 19 (Database Engineer):**

```
## Context
ClearConcur uses PostgreSQL with SQLAlchemy/Alembic.

## Required Change
Add support for receipt splitting (parent-child relationships):

1. Add parent_receipt_id foreign key to receipts table
2. Add constraint: child amounts <= parent amount
3. Migrate existing data (all current receipts are parents)

## Constraints
- Zero downtime (pilot users may be active)
- Must be reversible
- PostgreSQL 15

## Request
Generate the Alembic migration with:
1. Migration SQL
2. Rollback procedure
3. Validation queries to run after
```

---

### 5. Frontend Component

**Use Agent 6 (Engineer) with UI context:**

```
## Context
Building the receipt splitting UI for ClearConcur.

## Design Requirements
- Appears in ReceiptDetailPanel when user clicks "Split Receipt"
- Shows original receipt at top (read-only)
- Dynamic form to add 2+ split items
- Each item: amount (numeric input), category (dropdown), notes (text)
- Running total with validation (must equal original)
- "Split" button disabled until valid

## Existing Patterns
- Using Tailwind CSS (see App.tsx for style patterns)
- Form state with React useState
- API calls via src/api.ts

## Request
Create SplitReceiptModal component with:
1. TypeScript types
2. Form validation
3. API integration
4. Error handling
5. Loading states

Match the existing design patterns in App.tsx.
```

---

### 6. Pre-Pilot Security Review

**Use Agent 17 (Security Auditor):**

```
## Context
ClearConcur is preparing for UCSB faculty pilot.

## What to Review
1. backend/app/routes.py - All API endpoints
2. backend/app/extraction.py - OpenAI API integration
3. frontend/src/api.ts - Client-side API calls
4. Authentication: magic link email flow

## Security Requirements
- Receipts are sensitive financial documents
- Multi-tenant: users should only see their own data
- No credential storage (Concur integration deferred)
- HIPAA not required, but PII awareness needed

## Request
Conduct security audit focusing on:
1. Authorization bypasses
2. Data exposure risks
3. Input validation gaps
4. Secrets handling

Provide findings with severity and remediation steps.
```

---

## Workflow for a Full Feature

### Example: Adding Multi-Currency Support

**Day 1: Define**
```
[Use Agent 3 - Product Manager]
"Write a PRD section for multi-currency receipt handling..."
```

**Day 1-2: Design**
```
[Use Agent 5 - Architect]
"Design the data model changes for multi-currency..."
```

**Day 2: Database**
```
[Use Agent 19 - Database Engineer]
"Generate migration for currency conversion fields..."
```

**Day 2-3: Backend**
```
[Use Agent 6 - Engineer]
"Implement the currency conversion API..."
```

**Day 3: Frontend**
```
[Use Agent 6 - Engineer]
"Build the currency display and conversion UI..."
```

**Day 3: Test**
```
[Use Agent 7 - QA Engineer]
"Write test cases for multi-currency..."
```

**Day 4: Review**
```
[Use Agent 18 - Code Reviewer]
"Review the multi-currency implementation PR..."
```

---

## Quick Reference: Agent Prompting Tips

### Do:
- Include existing code snippets when asking for implementations
- Reference the CLAUDE.md constraints
- Specify "match existing patterns in [file]"
- Ask for incremental changes, not rewrites

### Don't:
- Ask agents to build Concur integration (out of scope)
- Skip the PRD step for non-trivial features
- Ignore confidence scores in extractions
- Build without human-in-the-loop review

---

## Recommended Next Steps for ClearConcur

Based on the current state:

1. **Complete Export Functionality** (Agent 6)
   - CSV generation with stable headers
   - ZIP of renamed receipts
   - Readiness checklist JSON

2. **Improve Extraction Accuracy** (Agent 10 + Agent 6)
   - Debug French Polynesian receipt issues
   - Add locale-aware date parsing
   - Improve currency detection

3. **Add Batch Upload** (Agent 3 → Agent 6)
   - Define user flow for multiple receipts
   - Implement drag-drop or folder upload
   - Add progress indicator

4. **Security Hardening** (Agent 17)
   - Pre-pilot security review
   - Add rate limiting
   - Audit logging for sensitive operations

5. **Pilot Instrumentation** (Agent 9)
   - Add analytics for key metrics
   - Time-to-export tracking
   - Error rate monitoring
