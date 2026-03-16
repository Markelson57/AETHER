<div align="center">

```
⬡  A E T H E R  ⬡
─────────────────────────────
Asistente Técnico Avanzado
    Motor IA Personalizado
```

[![Versión](https://img.shields.io/badge/versión-3.0-8b5cf6?style=flat-square)](https://github.com/Markelson57/AETHER)
[![Motor](https://img.shields.io/badge/LLM-Claude%20%2B%20Groq%20%2B%20OpenRouter-6366f1?style=flat-square)](https://github.com/Markelson57/AETHER)
[![MCPs](https://img.shields.io/badge/MCPs-5-a855f7?style=flat-square)](https://github.com/Markelson57/AETHER)
[![Estado](https://img.shields.io/badge/estado-operativo-22c55e?style=flat-square)](https://github.com/Markelson57/AETHER)

🌐 **Language / Idioma / Langue:** [English](README.md) · [Español](README.es.md) · [Français](README.fr.md)

</div>

---

## ¿Qué es AETHER?

**AETHER** es un asistente técnico con identidad propia, construido sobre Claude (Anthropic) y potenciado con servidores MCP (Model Context Protocol) para acceso real al sistema: filesystem, memoria persistente, GitHub, bases de datos y automatización de navegador.

No es un chatbot genérico. Es un **copiloto técnico** — con memoria entre sesiones, personalidad definida y capacidad de actuar directamente en el entorno del sistema.

---

## Arquitectura

```
┌──────────────────────────────────────────────┐
│                 AETHER v3.0                  │
│        Identidad · Memoria · Contexto        │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐   ┌──────────────────────┐   │
│  │   Claude   │   │   Servidores MCP     │   │
│  │  (LLM base)│◄─►│   filesystem         │   │
│  └────────────┘   │   memory             │   │
│        │          │   sqlite             │   │
│        ▼          │   playwright         │   │
│  ┌────────────┐   │   github             │   │
│  │  Groq +    │   └──────────────────────┘   │
│  │ OpenRouter │                              │
│  │ (fallback) │   ┌──────────────────────┐   │
│  └────────────┘   │   Archivos Locales   │   │
│                   │   personalidad.json  │   │
│                   │   memoria.json       │   │
│                   │   aether_mcp_server  │   │
│                   └──────────────────────┘   │
└──────────────────────────────────────────────┘
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
3. **Opciones / mejoras** — alternativas cuando aplica
4. **Recomendación final** — camino óptimo

---

## Especialidades

- **Programación** — Python, JavaScript, bots, scripts
- **Arquitectura de software** — diseño de sistemas, flujos de datos
- **Automatización** — scripts, patches, pipelines
- **Resolución de problemas técnicos** — debugging, optimización
- **Bots de Discord** — diseño, desarrollo, despliegue
- **DevOps básico** — gestión de servidores, hosting, deploy

---

## Memoria Persistente

AETHER mantiene contexto entre sesiones gracias a un sistema de memoria dual:

```
Archivos locales (backup)   MCP memory (activo)
─────────────────────────   ───────────────────
memoria.json            ◄──► Leído al activar
                             Actualizado con update_memory
                             Guarda proyectos, prefs,
                             decisiones técnicas
```

**Qué recuerda AETHER:**
- Proyectos activos y su estado actual
- Decisiones técnicas de sesiones anteriores
- Errores conocidos y soluciones aplicadas
- Preferencias del usuario
- Contexto de herramientas y entorno

---

## Servidores MCP

| MCP | Función |
|-----|---------|
| `filesystem` | Acceso al sistema de archivos local |
| `memory` | Memoria persistente entre sesiones |
| `sqlite` | Base de datos local |
| `playwright` | Automatización de navegador |
| `github` | Gestión de repositorios, código, issues, PRs |

---

## Integración con Bot de Discord

AETHER impulsa un bot de Discord completo con economía, chat IA, moderación y más.

**Stack:**
- Python · discord.py
- Motor IA: Groq (6 modelos) + OpenRouter (5 modelos)

**Categorías de comandos:**

| Categoría | Comandos |
|-----------|----------|
| Economía | `!daily` `!work` `!bal` `!pay` `!top` `!banco` `!dep` `!ret` |
| Tienda | `!tienda` `!comprar` `!inventario` |
| Social | `!rep` `!perfil` `!robar` |
| Misiones | `!misiones` `!mision` |
| IA (AETHER) | `!ia` `!chat` `!pregunta` `!mimemoria` `!olvidarme` `!iamodelo` `!iastatus` |
| Moderación | `!warn` `!kick` `!setrango` `!mute` `!ban` |
| Info | `!ayuda` `!ping` `!info` |

**Características clave:**
- 🔄 Rotación automática de modelos al detectar rate limit
- 🧠 Memoria persistente por usuario
- 📊 Acceso a datos del usuario en tiempo real
- 🛡️ Sistema anti-spam con timeout escalante
- 💰 Sistema bancario con interés automático
- 🎯 Misiones diarias y sistema de reputación

---

## Motor IA Multi-Proveedor

```python
GROQ_MODELS = [
    "llama-3.3-70b-versatile",   # primario
    "llama-3.1-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "llama-3.1-8b-instant",
    "gemma2-9b-it"               # último fallback
]

OPENROUTER_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "microsoft/phi-3-medium-128k-instruct:free",
    "deepseek/deepseek-r1:free"
]
```

Failover automático entre proveedores con semáforo (máx 3 peticiones simultáneas) y backoff exponencial.

---

## Activación

AETHER se activa desde Claude Desktop con los MCPs configurados:

```
"activa Aether"
```

Al activarse:
1. Lee `get_system_prompt` → carga identidad y personalidad
2. Lee `get_memory` → carga contexto de sesiones anteriores
3. Saluda directamente y pregunta qué toca

---

## Instalación

### Requisitos
- Claude Desktop (Windows)
- Node.js
- Python 3.x

### Config MCP (`claude_desktop_config.json`)
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
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<tu_token>" }
    },
    "aether": {
      "command": "node",
      "args": ["ruta/a/aether_mcp_server.js"]
    }
  }
}
```

---

## Historial de Versiones

| Versión | Cambios |
|---------|---------|
| **v1.0** | Configuración inicial, MCPs base, sistema de memoria |
| **v2.0** | Personalidad mejorada, integración bot Discord |
| **v2.1** | Migración del motor IA a Groq |
| **v3.0** | Multi-proveedor (Groq+OpenRouter), memoria persistente por usuario, datos en tiempo real, anti-spam, suite de comandos completa |

---

<div align="center">

**⬡ AETHER — Construido sesión a sesión ⬡**

</div>
