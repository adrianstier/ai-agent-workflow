# Installation Guide

Multiple ways to use AI Agent Workflow in your projects.

## Quick Reference

| Method | Best For | Command |
|--------|----------|---------|
| **One-liner install** | Personal use, multiple projects | `curl ... \| bash` |
| **Git submodule** | Team projects, version control | `git submodule add ...` |
| **Direct clone** | Contributing, customizing | `git clone ...` |
| **Copy agents only** | Minimal footprint | `cp -r agents/ ...` |

---

## Method 1: One-Liner Install (Recommended for Personal Use)

Install globally and use across all your projects:

```bash
curl -fsSL https://raw.githubusercontent.com/yourusername/ai-agent-workflow/main/scripts/install.sh | bash
```

This:
- Clones to `~/.ai-agents/`
- Adds `agent-init` command to your PATH
- Sets up `AI_AGENTS_HOME` environment variable

**After installation:**
```bash
# Restart terminal, then:
agent-init my-new-project
cd my-new-project && claude
```

**Add to existing project:**
```bash
cd my-existing-project
add-to-project.sh
```

---

## Method 2: Git Submodule (Recommended for Teams)

Best for team projects where you want version-controlled agent prompts:

```bash
cd your-project

# Add as submodule
git submodule add https://github.com/yourusername/ai-agent-workflow.git .ai-agents

# Create symlink to agents
ln -s .ai-agents/agents ./agents

# Copy and customize CLAUDE.md
cp .ai-agents/templates/CLAUDE.md.template ./CLAUDE.md

# Create artifacts directory
mkdir -p artifacts

# Commit
git add .gitmodules .ai-agents agents CLAUDE.md artifacts
git commit -m "Add AI Agent Workflow"
```

**For teammates cloning the repo:**
```bash
git clone --recursive your-repo-url
# Or if already cloned:
git submodule update --init
```

**Update to latest version:**
```bash
cd .ai-agents && git pull origin main && cd ..
git add .ai-agents && git commit -m "Update AI Agent Workflow"
```

---

## Method 3: Direct Clone

Best for contributing or heavy customization:

```bash
# Clone anywhere you like
git clone https://github.com/yourusername/ai-agent-workflow.git ~/ai-agent-workflow

# Use the init script
~/ai-agent-workflow/scripts/init-project.sh my-project

# Or add to existing project
~/ai-agent-workflow/scripts/add-to-project.sh /path/to/project
```

---

## Method 4: Copy Agents Only

Minimal approach - just copy what you need:

```bash
cd your-project

# Download just the agents folder
curl -L https://github.com/yourusername/ai-agent-workflow/archive/main.tar.gz | \
  tar -xz --strip-components=1 ai-agent-workflow-main/agents

# Create minimal CLAUDE.md
cat > CLAUDE.md << 'EOF'
# Project: My Project

## Orchestrator-Driven Mode
Agent 0 drives development. See agents/agent-0-orchestrator.md for details.

## Project Context
- **Name**: My Project
- **One-liner**: [Description]

## Current State
Phase: Discovery
EOF

mkdir -p artifacts
```

---

## Method 5: GitHub Codespaces / Dev Containers

Add to your `.devcontainer/devcontainer.json`:

```json
{
  "postCreateCommand": "curl -fsSL https://raw.githubusercontent.com/yourusername/ai-agent-workflow/main/scripts/install.sh | bash"
}
```

---

## Project Structure After Setup

However you install, your project should look like:

```
your-project/
├── CLAUDE.md          # Project config (required)
├── agents/            # Symlink or copy (required)
├── artifacts/         # Generated docs (created as needed)
│   ├── problem-brief-v0.1.md
│   ├── prd-v0.1.md
│   └── ...
└── src/               # Your code
```

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `AI_AGENTS_HOME` | Global installation path | `~/.ai-agents` |

---

## Shell Aliases (Optional)

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# Quick project initialization
alias agent-init='$AI_AGENTS_HOME/scripts/init-project.sh'
alias agent-add='$AI_AGENTS_HOME/scripts/add-to-project.sh'

# Quick access to agent docs
alias agents='ls $AI_AGENTS_HOME/agents/*.md'
alias agent='cat $AI_AGENTS_HOME/agents/agent-$1.md'
```

---

## Updating

**Global install:**
```bash
cd $AI_AGENTS_HOME && git pull
```

**Submodule:**
```bash
git submodule update --remote .ai-agents
```

**Direct copy:** Re-download the agents folder

---

## Uninstalling

**Global install:**
```bash
rm -rf ~/.ai-agents
# Remove lines from ~/.zshrc or ~/.bashrc
```

**Submodule:**
```bash
git submodule deinit .ai-agents
git rm .ai-agents
rm -rf .git/modules/.ai-agents
```

---

## Troubleshooting

### "agents symlink broken"
The target moved. Recreate it:
```bash
rm agents
ln -s /path/to/ai-agent-workflow/agents ./agents
```

### "CLAUDE.md not being read"
Make sure you're running `claude` from the directory containing CLAUDE.md.

### "Permission denied on scripts"
```bash
chmod +x $AI_AGENTS_HOME/scripts/*.sh
```

---

## Next Steps

After installation:
1. Edit `CLAUDE.md` with your project details
2. Run `claude` in your project directory
3. Tell the orchestrator what you want to build!

See [docs/CLAUDE_CODE_GUIDE.md](docs/CLAUDE_CODE_GUIDE.md) for the full usage guide.
