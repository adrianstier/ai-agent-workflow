#!/bin/bash

# AI Agent Workflow - Add to Existing Project
# Adds orchestrator-driven mode to an existing project without creating new directories

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Find the agent workflow installation
AGENT_WORKFLOW_DIR="${AI_AGENTS_HOME:-}"
if [ -z "$AGENT_WORKFLOW_DIR" ]; then
    # Try common locations
    if [ -d "$HOME/.ai-agents" ]; then
        AGENT_WORKFLOW_DIR="$HOME/.ai-agents"
    elif [ -d "$(dirname "$0")/.." ]; then
        AGENT_WORKFLOW_DIR="$(cd "$(dirname "$0")/.." && pwd)"
    else
        echo -e "${RED}Error: Cannot find AI Agent Workflow installation${NC}"
        echo "Set AI_AGENTS_HOME or run the installer first"
        exit 1
    fi
fi

PROJECT_DIR="${1:-.}"
PROJECT_NAME="${2:-$(basename "$(cd "$PROJECT_DIR" && pwd)")}"

cd "$PROJECT_DIR"

echo -e "${BLUE}Adding AI Agent Workflow to: $(pwd)${NC}"
echo ""

# Create artifacts directory if it doesn't exist
if [ ! -d "artifacts" ]; then
    echo -e "${GREEN}►${NC} Creating artifacts directory"
    mkdir -p artifacts
fi

# Link agents
if [ ! -e "agents" ]; then
    echo -e "${GREEN}►${NC} Linking agents directory"
    ln -s "$AGENT_WORKFLOW_DIR/agents" ./agents
elif [ -L "agents" ]; then
    echo -e "${YELLOW}!${NC} agents symlink already exists"
else
    echo -e "${YELLOW}!${NC} agents directory exists (not overwriting)"
fi

# Create CLAUDE.md if it doesn't exist
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${GREEN}►${NC} Creating CLAUDE.md"
    cat > CLAUDE.md << EOF
# Project: $PROJECT_NAME

## Orchestrator-Driven Mode

This project uses the AI Agent Workflow system. Agent 0 (Orchestrator) drives development, selecting agents and only asking key questions.

### How This Works
1. Start sessions by describing what you want to work on
2. Agent 0 assesses state, selects the right agent, executes tasks
3. You only get asked for key decisions
4. Artifacts saved to \`artifacts/\`

### Flow Control
- **"Speed up"** - Make assumptions, fewer questions
- **"Slow down"** - Be thorough, explain more
- **"Skip [agent]"** - Skip with risk acknowledgment
- **"Go back"** - Return to earlier phase
- **"Pause"** - Summarize current state

## Project Context

### Overview
- **Name**: $PROJECT_NAME
- **One-liner**: [TODO: Description]
- **Target Users**: [TODO: Who is this for?]

### Constraints
- **Timeline**: [TODO: X weeks]
- **Budget**: [TODO: \$X/month]
- **Tech**: [TODO: Stack preferences]

## Current State

### Completed Artifacts
- [ ] problem-brief-v0.1.md
- [ ] competitive-analysis-v0.1.md
- [ ] prd-v0.1.md
- [ ] ux-flows-v0.1.md
- [ ] architecture-v0.1.md

### Decisions Made
- [None yet]

## Agent Reference
Agents in \`./agents/\`: Orchestrator (0), Problem Framer (1), Competitive Mapper (2), Product Manager (3), UX Designer (4), System Architect (5), Engineer (6), QA (7), DevOps (8), Analytics (9), Debug Suite (10-16), Reviews (17-20)
EOF
else
    echo -e "${YELLOW}!${NC} CLAUDE.md already exists (not overwriting)"
fi

# Add to .gitignore if it exists
if [ -f ".gitignore" ]; then
    if ! grep -q "^agents$" .gitignore 2>/dev/null; then
        echo -e "${GREEN}►${NC} Adding agents symlink to .gitignore"
        echo "" >> .gitignore
        echo "# AI Agent Workflow (symlinked)" >> .gitignore
        echo "agents" >> .gitignore
    fi
fi

echo ""
echo -e "${GREEN}Done!${NC} AI Agent Workflow added to project."
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Edit CLAUDE.md with your project details"
echo "  2. Start Claude Code: ${GREEN}claude${NC}"
echo ""
