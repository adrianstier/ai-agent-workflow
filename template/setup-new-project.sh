#!/bin/bash

# AI Agent Workflow - New Project Setup Script
# Usage: ./setup-new-project.sh <project-name> [destination-path]

set -e

PROJECT_NAME=${1:-"my-new-project"}
DEST_PATH=${2:-"$HOME/Desktop"}
TEMPLATE_DIR="$(cd "$(dirname "$0")" && pwd)"

PROJECT_PATH="$DEST_PATH/$PROJECT_NAME"

echo "🚀 Setting up new project: $PROJECT_NAME"
echo "   Location: $PROJECT_PATH"
echo ""

# Check if directory already exists
if [ -d "$PROJECT_PATH" ]; then
    echo "❌ Error: Directory already exists: $PROJECT_PATH"
    exit 1
fi

# Create project directory
mkdir -p "$PROJECT_PATH"
cd "$PROJECT_PATH"

# Initialize git
git init

# Copy agents
echo "📋 Copying AI agents..."
cp -r "$TEMPLATE_DIR/agents" ./agents

# Create directory structure
echo "📁 Creating project structure..."
mkdir -p src tests docs data

# Create .gitignore
cat > .gitignore << 'GITIGNORE'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
dist/
*.egg-info/
venv/
env/
.venv/

# Node
node_modules/
.next/
out/
.nuxt/
dist/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Testing
.pytest_cache/
.coverage
htmlcov/
coverage/

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env*.local

# Project specific
data/personal/
output/
*.log
GITIGNORE

# Create PROJECT_BRIEF.md template
cat > PROJECT_BRIEF.md << 'BRIEF'
# Project Brief: [PROJECT_NAME]

## Problem Statement

[Describe the problem you're solving. Who has this problem? Why does it matter?]

## Target Users

- **Primary**: [Who is the main user?]
- **Secondary**: [Any other user types?]

## Key Features

### Must Have (MVP)
1. [ ] [Core feature 1]
2. [ ] [Core feature 2]
3. [ ] [Core feature 3]

### Should Have
1. [ ] [Important feature]
2. [ ] [Important feature]

### Nice to Have
1. [ ] [Future feature]

## Success Criteria

- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

## Technical Requirements

### Stack Preferences
- **Frontend**: [e.g., Next.js, React, Vue]
- **Backend**: [e.g., Node.js, Python, Go]
- **Database**: [e.g., PostgreSQL, MongoDB, SQLite]
- **Deployment**: [e.g., Vercel, AWS, Railway]

### Constraints
- [Budget constraints]
- [Timeline constraints]
- [Technical constraints]

## User Stories

### As a [user type], I want to [action] so that [benefit]

1. As a user, I want to ... so that ...
2. As a user, I want to ... so that ...
3. As an admin, I want to ... so that ...

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [High/Med/Low] | [How to mitigate] |
| [Risk 2] | [High/Med/Low] | [How to mitigate] |

## Timeline

- **Week 1**: [Milestone]
- **Week 2**: [Milestone]
- **Week 3**: [Milestone]
- **Week 4**: [Milestone]

## Notes

[Any additional context, links to research, inspiration, etc.]
BRIEF

# Replace placeholder in PROJECT_BRIEF
sed -i '' "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" PROJECT_BRIEF.md 2>/dev/null || \
sed -i "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" PROJECT_BRIEF.md

# Create README.md
cat > README.md << README
# $PROJECT_NAME

[Brief description of your project]

## Getting Started

### Prerequisites

- [Requirement 1]
- [Requirement 2]

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/$PROJECT_NAME.git
cd $PROJECT_NAME

# Install dependencies
[installation commands]
\`\`\`

### Usage

\`\`\`bash
[usage commands]
\`\`\`

## Development

This project uses an AI agent workflow for development. See the \`agents/\` folder for guidance.

### Agent Workflow

1. Start with \`agents/agent-0-orchestrator.md\` to understand the process
2. Review \`PROJECT_BRIEF.md\` for requirements
3. Follow agents in order for structured development

## Project Structure

\`\`\`
$PROJECT_NAME/
├── agents/           # AI development workflow
├── src/              # Source code
├── tests/            # Test files
├── docs/             # Documentation
├── data/             # Data and configs
├── PROJECT_BRIEF.md  # Requirements
└── README.md         # This file
\`\`\`

## Contributing

[Contribution guidelines]

## License

[License information]
README

# Initial commit
git add -A
git commit -m "Initial project setup with AI agent workflow

- Added AI agent system (10 agents)
- Created project structure
- Added PROJECT_BRIEF template

🤖 Generated with AI Agent Workflow Template"

echo ""
echo "✅ Project created successfully!"
echo ""
echo "Next steps:"
echo "  1. cd $PROJECT_PATH"
echo "  2. Edit PROJECT_BRIEF.md with your requirements"
echo "  3. Read agents/agent-0-orchestrator.md to start"
echo ""
echo "Happy building! 🎉"
