# AETHER + Ralph — Autonomous Loop Integration

This directory integrates [Ralph](https://github.com/frankbria/ralph-claude-code) into AETHER, enabling **fully autonomous development loops** where AETHER acts as the AI agent identity inside each iteration.

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                  Autonomous Loop                        │
│                                                         │
│  Ralph (engine)                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 1. Read .ralph/PROMPT.md  (AETHER identity)      │   │
│  │ 2. Execute Claude Code CLI                       │   │
│  │ 3. Analyze response — detect EXIT_SIGNAL         │   │
│  │ 4. Update fix_plan.md — mark completed tasks     │   │
│  │ 5. Check circuit breaker — prevent stagnation    │   │
│  │ 6. Repeat until all tasks done                   │   │
│  └──────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│              AETHER (AI identity)                       │
│         Analytical · Direct · Resourceful               │
└─────────────────────────────────────────────────────────┘
```

Ralph handles the loop mechanics. AETHER handles the thinking.

---

## Setup

### 1. Install

```bash
cd ralph/
bash setup_ralph.sh
```

This will:
- Install Claude Code CLI (`npm install -g @anthropic-ai/claude-code`)
- Clone and install Ralph globally
- Copy templates to your project

### 2. Configure your project

Edit the generated files:

| File | Purpose |
|------|---------|
| `.ralph/PROMPT.md` | AETHER's identity + project goals |
| `.ralph/fix_plan.md` | Task list (AETHER checks these off) |
| `.ralph/AGENT.md` | Build/test/run commands |
| `.ralphrc` | Loop settings, tool permissions |

### 3. Start the loop

```bash
# With live monitoring (recommended)
ralph --monitor

# Or basic loop
ralph

# With live streaming output
ralph --monitor --live
```

---

## Key Concepts

### Dual-Condition Exit Gate

Ralph only stops when **both** conditions are true:
1. AETHER's response contains 2+ completion indicators
2. AETHER explicitly sets `EXIT_SIGNAL: true`

This prevents premature exits when AETHER is still mid-task.

### RALPH_STATUS Block

AETHER must include this at the end of each response:

```
RALPH_STATUS:
  STATUS: IN_PROGRESS
  EXIT_SIGNAL: false
  WORK_DONE: implemented feature X
  NEXT_STEPS: write tests for X
```

### Circuit Breaker

Ralph auto-halts if AETHER gets stuck:
- No file changes after 3 consecutive loops → OPEN
- Same error repeating 5 times → OPEN
- Auto-recovers after cooldown (default: 30 min)

```bash
# Check circuit status
ralph --circuit-status

# Reset manually after fixing the issue
ralph --reset-circuit
```

### Rate Limiting

- Default: 100 API calls/hour
- Auto-waits and resets each hour
- Handles Claude's 5-hour usage limit with countdown

---

## Commands

```bash
ralph --monitor              # Start loop with tmux dashboard
ralph --live                 # Real-time Claude output streaming
ralph --verbose              # Detailed progress logs
ralph --timeout 30           # 30-minute timeout per iteration
ralph --calls 50             # Limit to 50 calls/hour
ralph --status               # Show current loop status
ralph --reset-session        # Clear session state
ralph --reset-circuit        # Reset circuit breaker
ralph --circuit-status       # Show circuit breaker state
ralph --no-continue          # Disable session continuity
```

---

## File Structure

```
my-project/
├── .ralph/
│   ├── PROMPT.md          ← AETHER identity + project goals
│   ├── fix_plan.md        ← Task checklist
│   ├── AGENT.md           ← Build/test commands
│   ├── specs/             ← Detailed specs (optional)
│   └── logs/              ← Execution logs
├── .ralphrc               ← Loop configuration
└── src/                   ← Your code
```

---

## Credits

- **Ralph** — [frankbria/ralph-claude-code](https://github.com/frankbria/ralph-claude-code) (MIT)
- **Technique** — [Geoffrey Huntley's Ralph method](https://ghuntley.com/ralph/)
- **AETHER** — AI identity layer built on Claude
