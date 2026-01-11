# ClearConcur + Agent Workflow: Quick Start

Copy-paste these prompts to use the agent system with ClearConcur.

---

## 1. Session Start Prompt

Use this every time you start working:

```
I'm working on ClearConcur - an AI-assisted receipt organization tool for UCSB academics.

## Project State
- Frontend: React + TypeScript (frontend/src/)
- Backend: Python FastAPI (backend/app/)
- Database: PostgreSQL with SQLAlchemy
- AI: OpenAI Vision for receipt extraction

## Current Files
- Main app: frontend/src/App.tsx
- API routes: backend/app/routes.py
- Models: backend/app/models.py
- Extraction: backend/app/extraction.py

## Constraints (IMPORTANT)
1. Human-in-the-loop review is MANDATORY - never skip the review step
2. Store raw OCR + model outputs - we need auditability
3. NO Concur API integration - that's Phase 2
4. NO browser automation or credential storage
5. Match existing code patterns

## Today's Focus
[Describe what you want to work on]

What should I tackle first?
```

---

## 2. Feature Implementation Prompts

### Adding Receipt Splitting

```
## Feature: Receipt Splitting

ClearConcur needs to let users split multi-item receipts (e.g., hotel bill with room + restaurant).

## Requirements
- User clicks "Split" on a receipt in review UI
- Modal shows original receipt at top
- User adds 2+ line items with: amount, category, notes
- Amounts must sum to original (or less)
- Creates child receipts linked to parent
- Original receipt marked as "split"

## Existing Code
backend/app/models.py has Receipt model
backend/app/routes.py has CRUD endpoints
frontend/src/App.tsx has ReceiptCard component

## Request
1. First, show me the database model changes needed
2. Then the API endpoint
3. Then the React component

Start with step 1.
```

### Improving Extraction Accuracy

```
## Problem: Low Extraction Accuracy for French Polynesian Receipts

Receipts from French Polynesia (XPF currency) are getting 40-60% confidence scores.

## Symptoms
- XPF amounts misread (e.g., "2030 XPF" → "2030" with USD assumed)
- French vendor names partially extracted
- Dates in DD/MM/YYYY format sometimes reversed

## Current Extraction
See ai-prompts/extract_receipt.md for the prompt

## Request
1. Analyze why these receipts have low accuracy
2. Suggest specific prompt improvements
3. Show me the updated extraction prompt
```

### Adding Batch Upload

```
## Feature: Batch Receipt Upload

Users should be able to upload multiple receipts at once.

## Current State
- Single file upload exists in frontend/src/App.tsx
- Upload endpoint: POST /api/trips/{trip_id}/receipts
- Files go to S3, then extraction queue

## Requirements
- Drag-and-drop zone for multiple files
- Progress bar showing upload + extraction status
- Handle mixed file types (JPEG, PNG, PDF)
- Max 20 files at once
- Error handling for failed uploads

## Request
Design the user flow, then implement:
1. Frontend component with drag-drop
2. Any backend changes needed
3. Progress/status tracking
```

---

## 3. Bug Fixing Prompts

### General Bug Template

```
## Bug: [Short description]

## What's happening
[Describe the incorrect behavior]

## Expected behavior
[What should happen]

## Steps to reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Relevant code
- File: [path]
- Function: [name]

## Error messages (if any)
```
[paste error]
```

## Request
Diagnose the root cause, then provide a fix.
```

### Example: Export Not Working

```
## Bug: Export CSV download fails silently

## What's happening
Click "Export" button on trip, nothing downloads, no error shown.

## Expected
Should download a ZIP containing:
- receipts.csv
- /receipts/ folder with renamed files

## Steps to reproduce
1. Open trip with 3+ reviewed receipts
2. Click "Export" button
3. Button spins briefly, then stops
4. No download prompt

## Relevant code
- Frontend: src/App.tsx (handleExport function around line 400)
- Backend: backend/app/routes.py (export endpoint)

## Console output
[paste any console errors]

## Request
1. Diagnose why export fails
2. Suggest fix with code changes
```

---

## 4. Database/Migration Prompts

### Adding a New Field

```
## Database Change: Add [field] to [table]

## Context
ClearConcur uses PostgreSQL + SQLAlchemy + Alembic

## Change Needed
Add [field_name] to [table_name] table
- Type: [type]
- Nullable: [yes/no]
- Default: [value or none]

## Purpose
[Why we need this field]

## Request
1. Show the Alembic migration file
2. Update the SQLAlchemy model
3. Update the Pydantic schema
4. Show any API changes needed
```

### Example: Adding Split Receipt Support

```
## Database Change: Parent-Child Receipt Relationships

## Current Schema
```python
class Receipt(Base):
    id = Column(UUID, primary_key=True)
    trip_id = Column(UUID, ForeignKey("trips.id"))
    vendor = Column(String)
    amount = Column(Numeric(10, 2))
    # ... etc
```

## Change Needed
Add parent_receipt_id to allow splitting:
- Foreign key to receipts.id (self-referential)
- Nullable (root receipts have no parent)
- CASCADE delete when parent deleted

## Request
1. Alembic migration with rollback
2. Updated SQLAlchemy model with relationship
3. Validation: child amounts can't exceed parent
```

---

## 5. Code Review Prompts

### Before Submitting PR

```
## Code Review Request

I'm about to submit a PR for [feature]. Please review:

## Files Changed
- [file1.py] - [what changed]
- [file2.tsx] - [what changed]

## What it does
[Brief description]

## Testing done
[How you tested it]

## Request
Review for:
1. Security issues (this handles financial data)
2. Error handling completeness
3. Code patterns matching existing codebase
4. Edge cases I might have missed
```

---

## 6. Pre-Pilot Checklist

```
## Pre-Pilot Security & Quality Review

ClearConcur is preparing for UCSB faculty pilot.

## Review Scope
1. All API endpoints (backend/app/routes.py)
2. Authentication flow (magic link)
3. Data access controls (users see only their trips)
4. File upload handling
5. Export functionality

## Security Requirements
- Receipts are sensitive financial documents
- Multi-tenant isolation required
- No credential storage
- Audit trail for all changes

## Request
1. Security audit with severity ratings
2. List of must-fix items before pilot
3. Nice-to-have improvements
4. Recommended monitoring/alerting
```

---

## Tips for Best Results

1. **Always include relevant code snippets** - Agents work better with context

2. **Reference existing files** - Say "match patterns in App.tsx" or "follow routes.py conventions"

3. **One thing at a time** - Ask for database changes first, then API, then frontend

4. **Include constraints** - Always mention:
   - Human-in-the-loop is mandatory
   - Store raw outputs
   - No Concur integration

5. **Ask for incremental changes** - Don't ask for a complete rewrite; ask for specific additions

6. **Provide error messages** - When debugging, include the full error output
