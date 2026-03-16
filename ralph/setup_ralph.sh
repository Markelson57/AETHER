#!/bin/bash
# =============================================================================
# AETHER + Ralph Setup Script
# Installs Ralph globally and configures it for use with AETHER
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "  ⬡  A E T H E R  +  R A L P H  ⬡"
echo "  ────────────────────────────────"
echo "  Autonomous Development Loop Setup"
echo -e "${NC}"

# ─── Requirements Check ──────────────────────────────────────────────────────

check_requirement() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}✗ Missing: $1${NC} — $2"
    return 1
  fi
  echo -e "${GREEN}✓ Found: $1${NC}"
  return 0
}

echo -e "${BLUE}[1/4] Checking requirements...${NC}"
check_requirement git    "Install from https://git-scm.com"
check_requirement node   "Install from https://nodejs.org"
check_requirement npm    "Comes with Node.js"
check_requirement jq     "sudo apt install jq  |  brew install jq"
echo ""

# ─── Install Claude Code CLI ─────────────────────────────────────────────────

echo -e "${BLUE}[2/4] Installing Claude Code CLI...${NC}"
if ! command -v claude &>/dev/null; then
  echo "Installing @anthropic-ai/claude-code globally..."
  npm install -g @anthropic-ai/claude-code
  echo -e "${GREEN}✓ Claude Code CLI installed${NC}"
else
  echo -e "${GREEN}✓ Claude Code CLI already installed: $(claude --version 2>/dev/null || echo 'unknown version')${NC}"
fi
echo ""

# ─── Clone and Install Ralph ─────────────────────────────────────────────────

echo -e "${BLUE}[3/4] Installing Ralph...${NC}"
RALPH_DIR="$HOME/.ralph_src"

if [ -d "$RALPH_DIR" ]; then
  echo "Updating existing Ralph installation..."
  cd "$RALPH_DIR" && git pull
else
  echo "Cloning Ralph..."
  git clone https://github.com/frankbria/ralph-claude-code.git "$RALPH_DIR"
fi

cd "$RALPH_DIR"
bash install.sh
echo -e "${GREEN}✓ Ralph installed globally${NC}"
echo ""

# ─── Configure AETHER Project ────────────────────────────────────────────────

echo -e "${BLUE}[4/4] Configuring AETHER project...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create .ralph directory structure
mkdir -p .ralph/specs .ralph/logs .ralph/docs/generated

# Copy AETHER templates if .ralph/PROMPT.md doesn't exist yet
if [ ! -f ".ralph/PROMPT.md" ]; then
  if [ -f "$SCRIPT_DIR/templates/PROMPT.md" ]; then
    cp "$SCRIPT_DIR/templates/PROMPT.md" ".ralph/PROMPT.md"
    echo -e "${GREEN}✓ Copied PROMPT.md template${NC}"
  fi
else
  echo -e "${YELLOW}⚠ .ralph/PROMPT.md already exists — skipping${NC}"
fi

if [ ! -f ".ralph/fix_plan.md" ]; then
  if [ -f "$SCRIPT_DIR/templates/fix_plan.md" ]; then
    cp "$SCRIPT_DIR/templates/fix_plan.md" ".ralph/fix_plan.md"
    echo -e "${GREEN}✓ Copied fix_plan.md template${NC}"
  fi
fi

if [ ! -f ".ralph/AGENT.md" ]; then
  if [ -f "$SCRIPT_DIR/templates/AGENT.md" ]; then
    cp "$SCRIPT_DIR/templates/AGENT.md" ".ralph/AGENT.md"
    echo -e "${GREEN}✓ Copied AGENT.md template${NC}"
  fi
fi

if [ ! -f ".ralphrc" ]; then
  if [ -f "$SCRIPT_DIR/templates/.ralphrc" ]; then
    cp "$SCRIPT_DIR/templates/.ralphrc" ".ralphrc"
    echo -e "${GREEN}✓ Copied .ralphrc config${NC}"
  fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  AETHER + Ralph setup complete! ⬡     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Edit .ralph/PROMPT.md   → define your project goals"
echo "  2. Edit .ralph/fix_plan.md → add your task list"
echo "  3. Run: ralph --monitor    → start the autonomous loop"
echo ""
echo -e "${BLUE}AETHER will operate as the AI identity inside the loop.${NC}"
echo ""
