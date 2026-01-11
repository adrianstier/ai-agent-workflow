#!/bin/bash

# AI Agent Workflow - Project Initialization Script
# Creates a new project with Orchestrator-Driven Mode enabled

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_WORKFLOW_DIR="$(dirname "$SCRIPT_DIR")"

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}     ${GREEN}AI Agent Workflow - Project Initializer${NC}               ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}     ${YELLOW}Orchestrator-Driven Mode${NC}                              ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}►${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header

# Check if project name is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage:${NC} $0 <project-name> [project-directory]"
    echo ""
    echo "Examples:"
    echo "  $0 my-awesome-app"
    echo "  $0 my-awesome-app ~/projects/my-awesome-app"
    echo ""
    exit 1
fi

PROJECT_NAME="$1"
PROJECT_DIR="${2:-$(pwd)/$PROJECT_NAME}"

# Check if directory already exists
if [ -d "$PROJECT_DIR" ]; then
    print_error "Directory already exists: $PROJECT_DIR"
    echo "Please choose a different name or remove the existing directory."
    exit 1
fi

# Create project directory
print_step "Creating project directory: $PROJECT_DIR"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Create folder structure
print_step "Creating folder structure..."
mkdir -p artifacts state src tests docs

# Create symlink to agents (or copy if symlink fails)
print_step "Linking agent prompts..."
if ln -s "$AGENT_WORKFLOW_DIR/agents" ./agents 2>/dev/null; then
    print_success "Created symlink to agents directory"
else
    print_warning "Could not create symlink, copying agents instead"
    cp -r "$AGENT_WORKFLOW_DIR/agents" ./agents
fi

# Copy and customize CLAUDE.md template
print_step "Creating CLAUDE.md configuration..."
cat > CLAUDE.md << EOF
# Project: $PROJECT_NAME

## Orchestrator-Driven Mode

This project uses the AI Agent Workflow system in **Orchestrator-Driven Mode**. Agent 0 (Orchestrator) drives the entire development process, selecting the right agent for each task and only asking key questions when decisions are needed.

### How This Works

1. **Start each session** by telling Claude about your project and what you want to work on
2. **Agent 0 automatically** assesses project state, identifies the next task, and selects the right agent
3. **You only get asked** when there are key decisions, ambiguous requirements, or tradeoffs to consider
4. **Artifacts are saved** to \`artifacts/\` as each phase completes
5. **The orchestrator returns** after each task to plan the next step

### When to Interrupt Me (Human Input Needed)

- Key product decisions (scope, features, priorities)
- Technical choices with significant tradeoffs
- Ambiguous requirements needing clarification
- Before any destructive operations
- Go/No-Go decisions at validation gates

### When NOT to Interrupt Me

- Routine implementation details
- Standard best practices
- File organization decisions
- Formatting and style choices

## Project Context

### Overview
- **Name**: $PROJECT_NAME
- **One-liner**: [TODO: Brief description of your project]
- **Target Users**: [TODO: Who is this for?]

### Constraints
- **Timeline**: [TODO: X weeks to v0.1]
- **Budget**: [TODO: \$X/month max]
- **Tech Preferences**: [TODO: Languages, frameworks, etc.]
- **Hard Requirements**: [TODO: Non-negotiable constraints]

## Agent Reference

The orchestrator has access to 20+ specialized agents:

**Core Development (0-9)**: Orchestrator, Problem Framer, Competitive Mapper, Product Manager, UX Designer, System Architect, Engineer, QA Test Engineer, DevOps, Analytics

**Debug Suite (10-16)**: Debug Detective, Visual Debug, Performance Profiler, Network Inspector, State Debugger, Error Tracker, Memory Leak Hunter

**Review (17-20)**: Security Auditor, Code Reviewer, Database Engineer, Design Reviewer

Agent prompts are located in: \`./agents/\`

## Current State

### Phase
- [ ] Discovery (Agents 1-2)
- [ ] Definition (Agents 3-5)
- [ ] Implementation (Agents 6-7)
- [ ] Launch (Agents 8-9)
- [ ] Iteration

### Completed Artifacts
<!-- Update as artifacts are completed -->
- [ ] problem-brief-v0.1.md
- [ ] competitive-analysis-v0.1.md
- [ ] prd-v0.1.md
- [ ] ux-flows-v0.1.md
- [ ] architecture-v0.1.md
- [ ] test-plan-v0.1.md
- [ ] deployment-plan-v0.1.md
- [ ] analytics-plan-v0.1.md

### Current Focus
[TODO: What you're currently working on]

### Decisions Made
<!-- Record key decisions to maintain context -->
- [No decisions yet]

## Session Start

When I start a session, Claude should:

1. Read this file and understand the project context
2. Check artifact status in \`artifacts/\`
3. Assess which validation gate we're at
4. Recommend the next action using Agent 0's decision framework
5. Execute the appropriate agent's methodology
6. Save outputs to the correct artifact file
7. Return to orchestration for the next task

## Flow Control

I can adjust the workflow at any time:

- **"Speed up"** - Make assumptions, ask fewer questions, move faster
- **"Slow down"** - Be more thorough, validate assumptions, explain more
- **"Skip [agent]"** - Skip an agent (with risk acknowledgment)
- **"Go back to [phase]"** - Revisit an earlier phase
- **"Just do [X]"** - Execute a specific task without orchestration
- **"Pause"** - Stop and summarize current state

## Quality Standards

- PRD must have 5-8 MUST features maximum (no scope creep)
- Architecture must use "boring" proven technology
- All MUST features need testable acceptance criteria
- Validation gates must pass before phase transitions
EOF

# Initialize git repository
print_step "Initializing git repository..."
git init -q
cat > .gitignore << EOF
# Dependencies
node_modules/
venv/
__pycache__/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
*.egg-info/

# Logs
*.log
logs/

# State (optional - uncomment if you don't want to track)
# state/
EOF

print_success "Git repository initialized"

# Create a simple README
cat > README.md << EOF
# $PROJECT_NAME

> [TODO: One-liner description]

## Getting Started

This project uses the [AI Agent Workflow](https://github.com/yourusername/ai-agent-workflow) system with Orchestrator-Driven Mode.

### Prerequisites

- [Claude Code](https://claude.ai/claude-code) CLI installed

### Start Building

\`\`\`bash
cd $PROJECT_NAME
claude
\`\`\`

Then tell the orchestrator what you want to build!

## Project Status

- **Phase**: Discovery
- **Artifacts**: None yet

## Documentation

- \`CLAUDE.md\` - Project configuration and context
- \`artifacts/\` - Generated planning documents
- \`agents/\` - AI agent prompts (linked)
EOF

print_success "README.md created"

# Final output
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}     ${GREEN}Project initialized successfully!${NC}                     ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Project location:${NC} $PROJECT_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "  1. Edit CLAUDE.md with your project details:"
echo "     - One-liner description"
echo "     - Target users"
echo "     - Timeline, budget, tech preferences"
echo ""
echo "  2. Start Claude Code:"
echo -e "     ${GREEN}cd $PROJECT_DIR && claude${NC}"
echo ""
echo "  3. Tell the orchestrator what you want to build!"
echo ""
echo -e "${BLUE}Example first message:${NC}"
echo "  \"I want to build [your idea]. Let's start from the beginning.\""
echo ""
EOF
