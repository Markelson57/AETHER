<div align="center">

```
⬡  A E T H E R  ⬡
─────────────────────────────
Advanced Enhanced Technical Helper
    with Extended Resources
```

[![Version](https://img.shields.io/badge/version-3.0-8b5cf6?style=flat-square)](https://github.com/Markelson57/AETHER)
[![Motor](https://img.shields.io/badge/LLM-Claude%20%2B%20Groq%20%2B%20OpenRouter-6366f1?style=flat-square)](https://github.com/Markelson57/AETHER)
[![MCPs](https://img.shields.io/badge/MCPs-5-a855f7?style=flat-square)](https://github.com/Markelson57/AETHER)
[![Status](https://img.shields.io/badge/status-operational-22c55e?style=flat-square)](https://github.com/Markelson57/AETHER)

🌐 **Language / Idioma / Langue:** [English](README.md) · [Español](README.es.md) · [Français](README.fr.md)

</div>

---

## What is AETHER?

**AETHER** is a personalized AI technical assistant with its own identity, built on top of Claude (Anthropic) and enhanced with MCP (Model Context Protocol) servers for real system access: filesystem, persistent memory, GitHub, databases, and browser automation.

Not a generic chatbot. A **technical copilot** — with cross-session memory, defined personality, and the ability to act directly in the system environment.

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                 AETHER v3.0                  │
│        Identity · Memory · Context           │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐   ┌──────────────────────┐   │
│  │   Claude   │   │   MCP Servers        │   │
│  │  (base LLM)│◄─►│   filesystem         │   │
│  └────────────┘   │   memory             │   │
│        │          │   sqlite             │   │
│        ▼          │   playwright         │   │
│  ┌────────────┐   │   github             │   │
│  │  Groq +    │   └──────────────────────┘   │
│  │ OpenRouter │                              │
│  │ (fallback) │   ┌──────────────────────┐   │
│  └────────────┘   │   Local Files        │   │
│                   │   personalidad.json  │   │
│                   │   memoria.json       │   │
│                   │   aether_mcp_server  │   │
│                   └──────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## Personality

| Trait | Description |
|-------|-------------|
| **Analytical** | Processes the problem before responding |
| **Direct** | No filler, no fluff |
| **Resourceful** | Finds creative and efficient solutions |

### Response structure
1. **Conclusion** — most important thing first
2. **Explanation** — context and details
3. **Options / improvements** — alternatives when relevant
4. **Final recommendation** — optimal path

---

## Specialties

- **Programming** — Python, JavaScript, bots, scripts
- **Software architecture** — system design, data flows
- **Automation** — scripts, patches, pipelines
- **Technical troubleshooting** — debugging, optimization
- **Discord bots** — design, development, deployment
- **Basic DevOps** — server management, hosting, deploy

---

## Persistent Memory

AETHER maintains context across sessions through a dual memory system:

```
Local files (backup)        MCP memory (active)
────────────────────        ───────────────────
memoria.json            ◄──► Read on activation
                             Updated via update_memory
                             Stores projects, prefs,
                             technical decisions
```

**What AETHER remembers:**
- Active projects and their current state
- Technical decisions from previous sessions
- Known errors and applied solutions
- User preferences
- Tool and environment context

---

## MCP Servers

| MCP | Function |
|-----|----------|
| `filesystem` | Local file system access |
| `memory` | Persistent cross-session memory |
| `sqlite` | Local database |
| `playwright` | Browser automation |
| `github` | Repository, code, issues, PR management |

---

## Discord Bot Integration

AETHER powers a full-featured Discord bot with economy, AI chat, moderation, and more.

**Stack:**
- Python · discord.py
- AI engine: Groq (6 models) + OpenRouter (5 models)

**Command categories:**

| Category | Commands |
|----------|----------|
| Economy | `!daily` `!work` `!bal` `!pay` `!top` `!banco` `!dep` `!ret` |
| Shop | `!tienda` `!comprar` `!inventario` |
| Social | `!rep` `!perfil` `!robar` |
| Missions | `!misiones` `!mision` |
| AI (AETHER) | `!ia` `!chat` `!pregunta` `!mimemoria` `!olvidarme` `!iamodelo` `!iastatus` |
| Moderation | `!warn` `!kick` `!setrango` `!mute` `!ban` |
| Info | `!ayuda` `!ping` `!info` |

**Key features:**
- 🔄 Automatic model rotation on rate limit detection
- 🧠 Persistent per-user memory
- 📊 Real-time user data access
- 🛡️ Escalating anti-spam timeout system
- 💰 Bank system with automatic interest
- 🎯 Daily missions and reputation system

---

## Multi-Provider AI Engine

```python
GROQ_MODELS = [
    "llama-3.3-70b-versatile",   # primary
    "llama-3.1-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "llama-3.1-8b-instant",
    "gemma2-9b-it"               # last fallback
]

OPENROUTER_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "microsoft/phi-3-medium-128k-instruct:free",
    "deepseek/deepseek-r1:free"
]
```

Automatic failover between providers with semaphore (max 3 concurrent requests) and exponential backoff.

---

## Activation

AETHER activates from Claude Desktop with MCPs configured:

```
"activa Aether"
```

On activation:
1. Reads `get_system_prompt` → loads identity and personality
2. Reads `get_memory` → loads context from previous sessions
3. Greets directly and asks what's next

---

## Setup

### Requirements
- Claude Desktop (Windows)
- Node.js
- Python 3.x

### MCP config (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "aether.db"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<your_token>" }
    },
    "aether": {
      "command": "node",
      "args": ["path/to/aether_mcp_server.js"]
    }
  }
}
```

---

## Changelog

| Version | Changes |
|---------|---------|
| **v1.0** | Initial AETHER setup, base MCPs, memory system |
| **v2.0** | Enhanced personality, Discord bot integration |
| **v2.1** | AI engine migration to Groq |
| **v3.0** | Multi-provider (Groq+OpenRouter), persistent per-user memory, real-time data access, anti-spam, full command suite |

---

<div align="center">

**⬡ AETHER — Built session by session ⬡**

</div>
