<![CDATA[<div align="center">

```
    ⬡  A E T H E R  ⬡
    ─────────────────────
    Asistente Técnico Avanzado
    Motor IA Personalizado
```

[![Version](https://img.shields.io/badge/version-3.0-8b5cf6?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOCA0IDgtNE0yIDEybDggNCA4LTQiLz48L3N2Zz4=)](https://github.com/Markelson57/AETHER)
[![Motor](https://img.shields.io/badge/motor-Claude%20%2B%20Groq%20%2B%20OpenRouter-6366f1?style=flat-square)](https://github.com/Markelson57/AETHER)
[![MCPs](https://img.shields.io/badge/MCPs-5%20configurados-a855f7?style=flat-square)](https://github.com/Markelson57/AETHER)
[![Discord Bot](https://img.shields.io/badge/discord%20bot-MARKELSOFT%20AI%20v3.0-5865F2?style=flat-square&logo=discord)](https://github.com/Markelson57/AETHER)
[![Status](https://img.shields.io/badge/estado-operativo-22c55e?style=flat-square)](https://github.com/Markelson57/AETHER)

</div>

---

## ¿Qué es AETHER?

**AETHER** (Advanced Enhanced Technical Helper with Extended Resources) es un asistente técnico avanzado con identidad propia, construido sobre Claude (Anthropic) y potenciado con un sistema de MCPs (Model Context Protocol) para operar con acceso real al sistema de archivos, memoria persistente, GitHub, bases de datos y automatización de navegador.

No es un chatbot genérico. Es un **copiloto técnico** especializado, con memoria entre sesiones, personalidad definida y capacidad de actuar en el entorno del sistema directamente.

---

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│                   AETHER v3.0                   │
│         Identidad · Memoria · Contexto          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐    ┌──────────────────────┐    │
│  │  Claude     │    │   MCPs Configurados  │    │
│  │  (base LLM) │◄──►│  filesystem          │    │
│  └─────────────┘    │  memory              │    │
│         │           │  sqlite              │    │
│         ▼           │  playwright          │    │
│  ┌─────────────┐    │  github              │    │
│  │  Groq +     │    └──────────────────────┘    │
│  │  OpenRouter │                                │
│  │  (fallback) │    ┌──────────────────────┐    │
│  └─────────────┘    │  Archivos Locales    │    │
│                     │  personalidad.json   │    │
│                     │  memoria.json        │    │
│                     │  aether_mcp_server   │    │
│                     └──────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Personalidad

| Rasgo | Descripción |
|-------|-------------|
| **Analítico** | Procesa el problema antes de responder |
| **Directo** | Sin rodeos ni relleno innecesario |
| **Ingenioso** | Busca soluciones creativas y eficientes |

### Estructura de respuesta
1. **Conclusión** — lo más importante primero
2. **Explicación** — contexto y detalles
3. **Opciones o mejoras** — alternativas cuando aplica
4. **Recomendación final** — camino óptimo

---

## Especialidades

- **Programación** — Python, JavaScript, bots, scripts
- **Arquitectura de software** — diseño de sistemas, flujos
- **Automatización** — scripts, patches, pipelines
- **Resolución de problemas técnicos** — debugging, optimización
- **Bots de Discord** — diseño, desarrollo, hosting
- **DevOps básico** — deploy, gestión de servidores, hosting

---

## Memoria Persistente

AETHER mantiene contexto entre sesiones gracias a un sistema de memoria dual:

```
memoria.json (local)          MCP memory (activo)
───────────────────           ───────────────────
D:\aether\memoria.json   ◄──► Leído al activar AETHER
C:\Users\lanbide\aether\      Actualizado con update_memory
C:\Users\Markelson\aether\    Persiste proyectos, prefs,
                              decisiones técnicas
```

**Qué recuerda AETHER:**
- Proyectos activos y su estado
- Decisiones técnicas tomadas en sesiones anteriores
- Errores conocidos y soluciones aplicadas
- Preferencias del usuario
- Contexto de cada herramienta instalada

---

## MCPs Configurados

| MCP | Función |
|-----|---------|
| `filesystem` | Acceso a `C:\` y `D:\` (pendrive VeraCrypt) |
| `memory` | Memoria persistente entre sesiones |
| `sqlite` | Base de datos local |
| `playwright` | Automatización de navegador |
| `github` | Gestión de repositorios, código, issues, PRs |

---

## Proyectos Activos

### Bot Discord — MARKELSOFT AI v3.0
Bot completo para el servidor **AMETHYX CLAN** (Rocket League).

**Stack:**
- Python · discord.py
- Motor IA: Groq (6 modelos) + OpenRouter (5 modelos)
- Hosting: MisterHost
- Archivos: `D:\botsito de markel\app.py`

**Features:**
| Categoría | Comandos |
|-----------|----------|
| Economía | `!daily` `!work` `!bal` `!pay` `!top` `!banco` `!dep` `!ret` |
| Tienda | `!tienda` `!comprar` `!inventario` (12 items) |
| Social | `!rep` `!perfil` `!robar` |
| Misiones | `!misiones` `!mision` |
| IA (AETHER) | `!ia` `!chat` `!pregunta` `!mimemoria` `!olvidarme` `!iamodelo` `!iastatus` |
| Moderación | `!warn` `!kick` `!setrango` `!mute` `!ban` |
| Info | `!ayuda` `!ping` `!info` |

**Características especiales:**
- 🔄 Rotación automática de modelos al detectar rate limit
- 🧠 Memoria persistente por usuario (`aether_memoria.json`)
- 📊 Acceso a datos del usuario en tiempo real (`datos.json`)
- 🛡️ Anti-spam con timeout escalante
- 💰 Sistema bancario con interés automático
- 🎯 Misiones diarias y sistema de reputación

### Motor IA Multi-Proveedor (AETHER v5)
```python
# Rotación automática de modelos
GROQ_MODELS = [
    "llama-3.3-70b-versatile",  # primario
    "llama-3.1-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "llama-3.1-8b-instant",
    "gemma2-9b-it"              # último fallback
]

OPENROUTER_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "microsoft/phi-3-medium-128k-instruct:free",
    "deepseek/deepseek-r1:free"
]
```

---

## Historial de Versiones

| Versión | Fecha | Cambios principales |
|---------|-------|---------------------|
| **v1.0** | 2026-03-12 | Creación de AETHER, MCPs base, sistema de memoria |
| **v2.0** | 2026-03-13 | Sentimientos, existencia dual, integración bot Discord |
| **v2.1** | 2026-03-13 | Migración Anthropic → Groq (motor gratuito) |
| **v3.0** | 2026-03-14 | Patch mega: tienda 12 items, reputación, misiones, warn/kick |
| **v3.0** | 2026-03-16 | Multi-proveedor (Groq+OpenRouter), memoria persistente, datos en tiempo real, anti-spam, `!ayuda` completo |

---

## Activación

AETHER se activa desde Claude Desktop con los MCPs configurados:

```
"activa Aether"
```

Al activarse:
1. Lee `get_system_prompt` → carga personalidad e identidad
2. Lee `get_memory` → carga contexto, proyectos y sesiones anteriores
3. Saluda directamente y pregunta qué toca

---

## Estructura de Archivos

```
C:\Users\lanbide\aether\
├── personalidad.json          # Definición de identidad AETHER
├── memoria.json               # Memoria local (copia)
└── aether_mcp_server.js       # Servidor MCP de AETHER

D:\aether\                     # Pendrive VeraCrypt (copia maestra)
├── personalidad.json
├── memoria.json               # ← copia maestra
├── aether_mcp_server.js
├── MEJORAS_AETHER.md          # 62+ mejoras catalogadas
└── AETHER_Documentacion_Completa.docx

D:\botsito de markel\
├── app.py                     # Bot Discord MARKELSOFT AI v3.0
├── datos.json                 # Economía y datos de usuarios
├── aether_memoria.json        # Memoria IA por usuario
├── patch_final.py             # Parche de referencia (historial)
└── .env                       # GROQ_API_KEY, OPENROUTER_API_KEY
```

---

## Instalación / Configuración

### Requisitos
- Claude Desktop (Windows)
- Node.js (para MCPs en JS)
- Python 3.x
- Pendrive con VeraCrypt (para `D:\`)

### MCPs en `claude_desktop_config.json`
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\", "D:\\"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "C:\\Users\\lanbide\\aether\\aether.db"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<token>" }
    },
    "aether": {
      "command": "node",
      "args": ["C:\\Users\\lanbide\\aether\\aether_mcp_server.js"]
    }
  }
}
```

---

## Notas de Desarrollo

- El pendrive `D:\` debe estar desbloqueado con VeraCrypt **antes** de arrancar Claude Desktop
- Si `D:\` no está disponible, el servidor filesystem se cae — montar primero
- `patch_final.py` es el parche de referencia histórico; no ejecutar de nuevo salvo rollback
- `aether_memoria.json` crece con el uso — máx 50 recuerdos por usuario

---

<div align="center">

**⬡ AETHER — Construido sesión a sesión ⬡**

*Por [Markelson57](https://github.com/Markelson57)*

</div>
]]>