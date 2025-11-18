# Recommended Project Structure

When using the AI agentic workflow, organize your files like this:

```
your-project/
├── agents/                          # Agent prompt library (from this repo)
│   ├── README.md
│   ├── agent-0-orchestrator.md
│   ├── agent-1-problem-framer.md
│   ├── agent-2-competitive-mapper.md
│   ├── agent-3-product-manager.md
│   ├── agent-4-ux-designer.md
│   ├── agent-5-system-architect.md
│   ├── agent-6-engineer.md
│   ├── agent-7-qa-test-engineer.md
│   ├── agent-8-devops-deployment.md
│   └── agent-9-analytics-growth.md
│
├── artifacts/                       # Outputs from each agent
│   ├── problem-brief-v0.1.md
│   ├── competitive-analysis-v0.1.md
│   ├── prd-v0.1.md
│   ├── ux-flows-v0.1.md
│   ├── architecture-v0.1.md
│   ├── test-plan-v0.1.md
│   ├── deployment-plan-v0.1.md
│   ├── analytics-plan-v0.1.md
│   └── decision-log.md              # Log of key decisions made
│
├── state/                           # Project state tracking
│   └── project-state.json           # Current state snapshot
│
├── src/                             # Actual application code (from Agent 6)
│   ├── app/                         # (example: Next.js structure)
│   ├── components/
│   ├── lib/
│   └── ...
│
├── tests/                           # Test files (from Agent 7)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .github/                         # CI/CD configs (from Agent 8)
│   └── workflows/
│       └── ci.yml
│
├── docs/                            # Optional: Additional documentation
│   ├── runbooks/                    # Operational playbooks
│   └── architecture-diagrams/
│
├── .gitignore
├── README.md                        # Project-specific README
└── package.json                     # (or requirements.txt, Cargo.toml, etc.)
```

## Setting Up

### Quick Setup Script

```bash
#!/bin/bash
# setup-project.sh

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./setup-project.sh <project-name>"
  exit 1
fi

# Create directory structure
mkdir -p $PROJECT_NAME/{artifacts,state,src,tests,docs/runbooks}

# Copy agent library
cp -r agents $PROJECT_NAME/

# Create initial state file
cat > $PROJECT_NAME/state/project-state.json <<EOF
{
  "project_name": "$PROJECT_NAME",
  "version": "0.1",
  "stage": "discover",
  "last_updated": "$(date +%Y-%m-%d)",
  "artifacts": {},
  "constraints": {
    "timeline": "",
    "budget": "",
    "tech_stack": {}
  },
  "risks": [],
  "open_questions": [],
  "current_focus": "Problem framing",
  "next_milestones": []
}
EOF

# Create decision log
cat > $PROJECT_NAME/artifacts/decision-log.md <<EOF
# Decision Log

## Template
For each major decision:

### [Date] - [Decision Title]
- **Context:** [Why we're making this decision]
- **Decision:** [What we decided]
- **Reasoning:** [Why this choice]
- **Alternatives considered:** [Other options]
- **Tradeoffs:** [What we're giving up]
- **Reversible?** [Yes/No and how hard to reverse]

---

EOF

# Create README
cat > $PROJECT_NAME/README.md <<EOF
# $PROJECT_NAME

[One-sentence description]

## Status

**Current version:** v0.1 (in development)
**Stage:** Discovery & Planning

## Quick Links

- [Problem Brief](artifacts/problem-brief-v0.1.md)
- [PRD](artifacts/prd-v0.1.md)
- [Architecture](artifacts/architecture-v0.1.md)
- [Decision Log](artifacts/decision-log.md)

## Getting Started

[Instructions for running the project locally]

## Development Workflow

[How to contribute, run tests, deploy, etc.]

## Project Context

**Target users:** [Who is this for?]
**Core problem:** [What problem does this solve?]
**Tech stack:** [Technologies used]

---

Built with AI-augmented workflow. See [agents/README.md](agents/README.md) for details.
EOF

# Create .gitignore
cat > $PROJECT_NAME/.gitignore <<EOF
# Dependencies
node_modules/
venv/
.venv/

# Environment variables
.env
.env.local
.env*.local

# Build outputs
dist/
build/
.next/
out/

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Test coverage
coverage/
.coverage

# Temporary files
*.tmp
.temp/
EOF

echo "✅ Project structure created: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. Open agents/agent-0-orchestrator.md"
echo "3. Copy the prompt and paste into Claude/ChatGPT"
echo "4. Start building!"
EOF

chmod +x setup-project.sh
```

### Manual Setup

```bash
# Create new project
mkdir your-project
cd your-project

# Copy agent library
cp -r /path/to/sass-agent-workflow/agents .

# Create directories
mkdir -p artifacts state src tests docs/runbooks

# Create initial state file (see example below)
touch state/project-state.json

# Create decision log
touch artifacts/decision-log.md
```

## File Templates

### state/project-state.json

```json
{
  "project_name": "Your Project Name",
  "version": "0.1",
  "stage": "discover",
  "last_updated": "2025-11-18",

  "artifacts": {
    "problem_brief": {
      "version": "0.1",
      "status": "draft",
      "path": "artifacts/problem-brief-v0.1.md",
      "last_updated": "2025-11-18"
    }
  },

  "constraints": {
    "timeline": "4 weeks to v0.1 launch",
    "budget": "$0/month initially",
    "tech_stack": {
      "frontend": "Next.js + TypeScript",
      "backend": "Next.js API routes",
      "database": "PostgreSQL",
      "hosting": "Vercel"
    }
  },

  "risks": [
    {
      "id": 1,
      "description": "Risk description",
      "severity": "medium",
      "mitigation": "How to address"
    }
  ],

  "open_questions": [
    {
      "id": 1,
      "question": "Question text",
      "status": "open",
      "decision_by": "2025-12-01"
    }
  ],

  "current_focus": "Problem framing and user research",

  "next_milestones": [
    {
      "name": "Problem Brief complete",
      "date": "2025-11-20",
      "status": "in_progress"
    },
    {
      "name": "PRD locked",
      "date": "2025-11-25",
      "status": "pending"
    }
  ]
}
```

### artifacts/decision-log.md

```markdown
# Decision Log

Track all major product, technical, and strategic decisions.

---

## 2025-11-18 - Use PostgreSQL over MongoDB

**Context:**
We need a database for storing user reviews and papers. Debating between document DB (MongoDB) and relational (PostgreSQL).

**Decision:**
Use PostgreSQL (via Neon managed service)

**Reasoning:**
1. Data is highly structured (users, reviews, papers with clear relationships)
2. Need strong consistency for user data
3. Team has more experience with SQL
4. Many existing ORMs (Prisma, Drizzle) work great with Postgres
5. Managed services (Neon, Supabase) make it easy

**Alternatives considered:**
- MongoDB: More flexible for unstructured data, but we don't need that flexibility
- SQLite: Simple for development, but harder to scale in production
- MySQL: Similar to Postgres, but Postgres has better JSON support

**Tradeoffs:**
- Giving up: Flexibility to store arbitrary nested data
- Gaining: Strong typing, referential integrity, powerful queries

**Reversible?**
Medium difficulty. Would require database migration and schema redesign. Best to decide now and commit.

---

## Template for Future Decisions

### [Date] - [Decision Title]

**Context:**
[Why we're making this decision]

**Decision:**
[What we decided]

**Reasoning:**
[Why this choice]

**Alternatives considered:**
[Other options we evaluated]

**Tradeoffs:**
[What we're giving up vs gaining]

**Reversible?**
[Yes/No and how hard to reverse]
```

## Version Control

### Recommended .gitignore

```gitignore
# Dependencies
node_modules/
venv/
.venv/
vendor/

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/
target/

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db
.directory

# IDE
.vscode/
.idea/
*.swp
*.swo
*.sublime-*

# Test coverage
coverage/
.coverage
.pytest_cache/

# Temporary files
*.tmp
.temp/
.cache/
```

### What to Commit

**DO commit:**
- `agents/` - Agent prompt library
- `artifacts/` - All planning documents (PRDs, architecture, etc.)
- `state/project-state.json` - Project state
- `src/` - Application code
- `tests/` - Test code
- `.github/workflows/` - CI/CD configs
- `docs/` - Documentation

**DON'T commit:**
- `.env` files (secrets)
- `node_modules/`, `venv/` (dependencies)
- Build outputs (`dist/`, `.next/`)
- Large binary files
- Temporary files

## Artifact Lifecycle

### Status Values

Each artifact in `project-state.json` has a status:

- **`draft`** - Work in progress, actively editing
- **`review`** - Ready for human review
- **`locked`** - Approved and frozen for this version
- **`archived`** - Superseded by newer version

### Example Artifact Entry

```json
{
  "artifacts": {
    "prd": {
      "version": "0.1",
      "status": "locked",
      "path": "artifacts/prd-v0.1.md",
      "created": "2025-11-15",
      "last_updated": "2025-11-18",
      "locked_date": "2025-11-18",
      "locked_by": "human",
      "changelog": "Reduced scope from 12 to 8 MUST-have features"
    }
  }
}
```

### Versioning Strategy

**For planning artifacts:**
- `problem-brief-v0.1.md` - Initial version for v0.1 product
- `problem-brief-v0.2.md` - Updated for v0.2 product
- Keep old versions for reference

**For code:**
- Use git tags: `v0.1.0`, `v0.2.0`, etc.
- Follow semantic versioning

**For state:**
- Single `project-state.json` (current state)
- Optional: Snapshot on milestones (`project-state-2025-11-18.json`)

## Cleanup & Maintenance

### Weekly Maintenance

```bash
# Update project state
# Edit state/project-state.json:
# - Update last_updated date
# - Update current_focus
# - Archive completed milestones
# - Add new risks/questions

# Commit artifacts
git add artifacts/
git commit -m "docs: update artifacts for week of [date]"

# Update decision log if major decisions were made
```

### Monthly Maintenance

```bash
# Review and archive old artifacts
mkdir -p artifacts/archive/v0.1/
mv artifacts/*-v0.1.md artifacts/archive/v0.1/

# Update README with current status
# Snapshot project state
cp state/project-state.json state/snapshots/project-state-2025-11.json
```

## Integration with Development

### Example: Next.js Project

```
your-project/
├── agents/                    # Agent library (planning)
├── artifacts/                 # Planning outputs
├── state/                     # Project state
│
├── app/                       # Next.js app directory
│   ├── (auth)/
│   ├── api/
│   └── ...
├── components/
├── lib/
├── public/
│
├── prisma/                    # Database
│   └── schema.prisma
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── package.json
├── tsconfig.json
└── README.md
```

### Example: Python Project

```
your-project/
├── agents/                    # Agent library (planning)
├── artifacts/                 # Planning outputs
├── state/                     # Project state
│
├── src/
│   ├── app/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── requirements.txt
├── setup.py
└── README.md
```

## Summary

**Minimum viable structure:**
```
your-project/
├── agents/           # Copy from this repo
├── artifacts/        # Save agent outputs here
├── src/             # Your code
└── README.md
```

**Recommended structure:**
```
your-project/
├── agents/           # Agent prompts
├── artifacts/        # Planning docs
├── state/           # Project state
├── src/             # Application code
├── tests/           # Test code
├── .github/         # CI/CD
└── docs/            # Additional docs
```

**Full structure:**
All of the above plus:
- `docs/runbooks/` - Operational guides
- `docs/architecture-diagrams/` - Visual diagrams
- `scripts/` - Automation scripts
- `.vscode/` - Shared editor settings

Use what makes sense for your project!
