#!/bin/bash

# AI Agent Workflow - Quick Installer
# Run with: curl -fsSL https://raw.githubusercontent.com/yourusername/ai-agent-workflow/main/scripts/install.sh | bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

INSTALL_DIR="${AI_AGENTS_HOME:-$HOME/.ai-agents}"
REPO_URL="https://github.com/yourusername/ai-agent-workflow.git"

echo -e "${BLUE}Installing AI Agent Workflow...${NC}"

# Clone or update
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Updating existing installation...${NC}"
    cd "$INSTALL_DIR" && git pull
else
    echo -e "${GREEN}Cloning repository...${NC}"
    git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
fi

# Make scripts executable
chmod +x "$INSTALL_DIR/scripts/"*.sh

# Add to shell config
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
fi

if [ -n "$SHELL_RC" ]; then
    if ! grep -q "AI_AGENTS_HOME" "$SHELL_RC"; then
        echo "" >> "$SHELL_RC"
        echo "# AI Agent Workflow" >> "$SHELL_RC"
        echo "export AI_AGENTS_HOME=\"$INSTALL_DIR\"" >> "$SHELL_RC"
        echo "export PATH=\"\$AI_AGENTS_HOME/scripts:\$PATH\"" >> "$SHELL_RC"
        echo "alias agent-init='init-project.sh'" >> "$SHELL_RC"
        echo -e "${GREEN}Added to $SHELL_RC${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo -e "Location: ${BLUE}$INSTALL_DIR${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Restart your terminal (or run: source $SHELL_RC)"
echo "  2. Create a new project:"
echo -e "     ${GREEN}agent-init my-project${NC}"
echo "  3. Start Claude Code:"
echo -e "     ${GREEN}cd my-project && claude${NC}"
echo ""
