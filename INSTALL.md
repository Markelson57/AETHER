# AETHER — Installation Guide

## 1. Clone the repo

```bash
git clone https://github.com/Markelson57/AETHER.git
cd AETHER
```

## 2. Place files

Copy the folder to wherever you want AETHER to live, for example:

```
C:\Users\<your_user>\aether\
```

Required files:
```
aether/
├── aether_mcp_server.js   ← MCP server
├── personalidad.json      ← Identity & personality
└── memoria.json           ← Memory (starts empty)
```

## 3. Configure Claude Desktop

Edit `claude_desktop_config.json`:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the AETHER MCP server entry:

```json
{
  "mcpServers": {
    "aether": {
      "command": "node",
      "args": ["C:\\Users\\<your_user>\\aether\\aether_mcp_server.js"]
    },
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
      "args": ["mcp-server-sqlite", "--db-path", "C:\\Users\\<your_user>\\aether\\aether.db"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<your_github_token>" }
    }
  }
}
```

> Replace `<your_user>` and `<your_github_token>` with your own values.

## 4. Restart Claude Desktop

Close and reopen Claude Desktop. The AETHER MCP server will load automatically.

## 5. Activate AETHER

In any Claude conversation, type:

```
activa Aether
```

AETHER will read its personality and memory, then greet you directly.

## 6. Personalize (optional)

Edit `personalidad.json` to change name, traits, specialties, or response structure.

Memory builds automatically as you use AETHER — no manual setup needed.

---

## Requirements

| Tool | Purpose |
|------|------|
| [Node.js](https://nodejs.org) | Run the MCP server |
| [Claude Desktop](https://claude.ai/download) | Host interface |
| Python 3.x | Optional — for bot integrations |
| npx / uvx | MCP server runners (auto-installed with Node) |
