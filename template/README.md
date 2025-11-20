# AI Agent Workflow Template

A portable AI agent system for building SaaS products. Copy this folder into any new project to get started with a structured development workflow.

## Quick Start

### 1. Copy to Your Project

```bash
# From this template location
cp -r /path/to/template/agents /path/to/your-new-project/agents

# Or if you're in your new project directory
cp -r ~/Desktop/sass-agent-workflow/template/agents ./agents
```

### 2. Create Your Project Brief

Create a `PROJECT_BRIEF.md` in your project root:

```markdown
# Project Brief: [Your Project Name]

## Problem Statement
[What problem are you solving?]

## Target Users
[Who will use this?]

## Key Features
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Technical Constraints
- [Language/framework preferences]
- [Deployment requirements]
- [Budget/time constraints]
```

### 3. Follow the Agent Workflow

Work through the agents in order:

| Order | Agent | What They Do | When to Use |
|-------|-------|--------------|-------------|
| 1 | **Orchestrator** | Coordinates workflow | Start here to understand the process |
| 2 | **Problem Framer** | Defines requirements | Clarify what you're building |
| 3 | **Competitive Mapper** | Research alternatives | Understand the market |
| 4 | **Product Manager** | Creates specs | Define features and user stories |
| 5 | **UX Designer** | Designs interface | Plan the user experience |
| 6 | **System Architect** | Technical design | Design data models and APIs |
| 7 | **Engineer** | Implements code | Build the application |
| 8 | **QA Test Engineer** | Tests everything | Validate functionality |
| 9 | **DevOps** | Deploys | Set up CI/CD and hosting |
| 10 | **Analytics** | Tracks growth | Add metrics and optimization |

## Agent Files

```
agents/
├── agent-0-orchestrator.md      # Start here - workflow coordinator
├── agent-1-problem-framer.md    # Requirements analysis
├── agent-2-competitive-mapper.md # Market research
├── agent-3-product-manager.md   # Feature specs
├── agent-4-ux-designer.md       # UI/UX design
├── agent-5-system-architect.md  # Technical architecture
├── agent-6-engineer.md          # Implementation
├── agent-7-qa-test-engineer.md  # Testing
├── agent-8-devops-deployment.md # Deployment
├── agent-9-analytics-growth.md  # Analytics
└── README.md                    # Agent system docs
```

## Recommended Project Structure

When starting a new project, create this structure:

```bash
your-project/
├── agents/           # Copy from template
├── src/              # Source code
├── tests/            # Test files
├── docs/             # Documentation
├── data/             # Data files, configs
├── PROJECT_BRIEF.md  # Your project requirements
├── README.md         # Project readme
└── .gitignore        # Git ignores
```

Create it with:

```bash
mkdir -p src tests docs data
touch PROJECT_BRIEF.md README.md .gitignore
```

## Example Use Cases

### SaaS Web App
1. Copy agents
2. Use Problem Framer for requirements
3. Use System Architect for API design
4. Use Engineer for Next.js/React implementation
5. Use DevOps for Vercel/AWS deployment

### Data Analysis Tool
1. Copy agents
2. Use Problem Framer for data requirements
3. Use System Architect for data models
4. Use Engineer for Python implementation
5. Use QA for validation testing

### CLI Tool
1. Copy agents
2. Use Product Manager for command specs
3. Use Engineer for implementation
4. Use DevOps for npm/pip packaging

## Tips for Best Results

### Be Specific in Your Brief
The more detail you provide in PROJECT_BRIEF.md, the better the agents can help:
- Specific user personas
- Concrete success metrics
- Technical constraints
- Timeline expectations

### Iterate Through Agents
Don't try to skip steps. Each agent builds on the previous:
- Problem Framer → defines WHAT
- Product Manager → defines HOW (features)
- System Architect → defines HOW (technical)
- Engineer → builds it

### Use Agents for Review
After implementing, use agents to review:
- QA agent for test coverage
- System Architect for code review
- Product Manager for feature completeness

### Document Decisions
Keep notes on decisions made at each stage:
- Why you chose a particular architecture
- Trade-offs considered
- Future improvements identified

## Customizing Agents

You can modify the agent markdown files to:
- Add domain-specific knowledge
- Include your tech stack preferences
- Add company-specific guidelines
- Include links to your design system

## Version Control

Include the agents folder in your git repo:

```bash
git add agents/
git commit -m "Add AI agent workflow system"
```

This keeps the agent instructions versioned with your project.

---

## Quick Copy Command

To set up a new project with this template:

```bash
# Create new project
mkdir my-new-saas && cd my-new-saas
git init

# Copy agents
cp -r ~/Desktop/sass-agent-workflow/template/agents ./agents

# Create structure
mkdir -p src tests docs data
touch PROJECT_BRIEF.md README.md .gitignore

# Initial commit
git add -A
git commit -m "Initial project setup with AI agent workflow"
```

You're ready to start building!
