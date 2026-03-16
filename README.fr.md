<div align="center">

```
⬡  A E T H E R  ⬡
─────────────────────────────
Assistant Technique Avancé
    Moteur IA Personnalisé
```

[![Version](https://img.shields.io/badge/version-3.0-8b5cf6?style=flat-square)](https://github.com/Markelson57/AETHER)
[![Moteur](https://img.shields.io/badge/LLM-Claude%20%2B%20Groq%20%2B%20OpenRouter-6366f1?style=flat-square)](https://github.com/Markelson57/AETHER)
[![MCPs](https://img.shields.io/badge/MCPs-5-a855f7?style=flat-square)](https://github.com/Markelson57/AETHER)
[![Statut](https://img.shields.io/badge/statut-opérationnel-22c55e?style=flat-square)](https://github.com/Markelson57/AETHER)

🌐 **Language / Idioma / Langue:** [English](README.md) · [Español](README.es.md) · [Français](README.fr.md)

</div>

---

## Qu'est-ce qu'AETHER?

**AETHER** est un assistant technique IA personnalisé avec sa propre identité, construit sur Claude (Anthropic) et amélioré avec des serveurs MCP (Model Context Protocol) pour un accès réel au système : filesystem, mémoire persistante, GitHub, bases de données et automatisation de navigateur.

Pas un chatbot générique. Un **copilote technique** — avec une mémoire inter-sessions, une personnalité définie et la capacité d'agir directement dans l'environnement système.

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                 AETHER v3.0                  │
│        Identité · Mémoire · Contexte         │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────┐   ┌──────────────────────┐   │
│  │   Claude   │   │   Serveurs MCP       │   │
│  │  (LLM base)│◄─►│   filesystem         │   │
│  └────────────┘   │   memory             │   │
│        │          │   sqlite             │   │
│        ▼          │   playwright         │   │
│  ┌────────────┐   │   github             │   │
│  │  Groq +    │   └──────────────────────┘   │
│  │ OpenRouter │                              │
│  │ (fallback) │   ┌──────────────────────┐   │
│  └────────────┘   │   Fichiers Locaux    │   │
│                   │   personalidad.json  │   │
│                   │   memoria.json       │   │
│                   │   aether_mcp_server  │   │
│                   └──────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## Personnalité

| Trait | Description |
|-------|-------------|
| **Analytique** | Traite le problème avant de répondre |
| **Direct** | Sans remplissage ni fioritures |
| **Ingénieux** | Trouve des solutions créatives et efficaces |

### Structure de réponse
1. **Conclusion** — l'essentiel en premier
2. **Explication** — contexte et détails
3. **Options / améliorations** — alternatives si pertinent
4. **Recommandation finale** — chemin optimal

---

## Spécialités

- **Programmation** — Python, JavaScript, bots, scripts
- **Architecture logicielle** — conception de systèmes, flux de données
- **Automatisation** — scripts, patches, pipelines
- **Résolution de problèmes techniques** — debugging, optimisation
- **Bots Discord** — conception, développement, déploiement
- **DevOps basique** — gestion de serveurs, hébergement, déploiement

---

## Mémoire Persistante

AETHER maintient le contexte entre les sessions grâce à un système de mémoire dual :

```
Fichiers locaux (backup)    MCP memory (actif)
────────────────────────    ──────────────────
memoria.json            ◄──► Lu à l'activation
                             Mis à jour via update_memory
                             Stocke projets, prefs,
                             décisions techniques
```

**Ce qu'AETHER mémorise :**
- Projets actifs et leur état actuel
- Décisions techniques des sessions précédentes
- Erreurs connues et solutions appliquées
- Préférences de l'utilisateur
- Contexte des outils et de l'environnement

---

## Serveurs MCP

| MCP | Fonction |
|-----|----------|
| `filesystem` | Accès au système de fichiers local |
| `memory` | Mémoire persistante inter-sessions |
| `sqlite` | Base de données locale |
| `playwright` | Automatisation de navigateur |
| `github` | Gestion de dépôts, code, issues, PRs |

---

## Intégration Bot Discord

AETHER propulse un bot Discord complet avec économie, chat IA, modération et plus.

**Stack :**
- Python · discord.py
- Moteur IA : Groq (6 modèles) + OpenRouter (5 modèles)

**Catégories de commandes :**

| Catégorie | Commandes |
|-----------|-----------|
| Économie | `!daily` `!work` `!bal` `!pay` `!top` `!banco` `!dep` `!ret` |
| Boutique | `!tienda` `!comprar` `!inventario` |
| Social | `!rep` `!perfil` `!robar` |
| Missions | `!misiones` `!mision` |
| IA (AETHER) | `!ia` `!chat` `!pregunta` `!mimemoria` `!olvidarme` `!iamodelo` `!iastatus` |
| Modération | `!warn` `!kick` `!setrango` `!mute` `!ban` |
| Info | `!ayuda` `!ping` `!info` |

**Fonctionnalités clés :**
- 🔄 Rotation automatique de modèles en cas de rate limit
- 🧠 Mémoire persistante par utilisateur
- 📊 Accès aux données utilisateur en temps réel
- 🛡️ Système anti-spam avec timeout progressif
- 💰 Système bancaire avec intérêts automatiques
- 🎯 Missions quotidiennes et système de réputation

---

## Moteur IA Multi-Fournisseur

```python
GROQ_MODELS = [
    "llama-3.3-70b-versatile",   # primaire
    "llama-3.1-70b-versatile",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "llama-3.1-8b-instant",
    "gemma2-9b-it"               # dernier fallback
]

OPENROUTER_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "microsoft/phi-3-medium-128k-instruct:free",
    "deepseek/deepseek-r1:free"
]
```

Basculement automatique entre fournisseurs avec sémaphore (max 3 requêtes simultanées) et backoff exponentiel.

---

## Activation

AETHER s'active depuis Claude Desktop avec les MCPs configurés :

```
"activa Aether"
```

À l'activation :
1. Lit `get_system_prompt` → charge identité et personnalité
2. Lit `get_memory` → charge le contexte des sessions précédentes
3. Salue directement et demande ce qui vient ensuite

---

## Installation

### Prérequis
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
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<votre_token>" }
    },
    "aether": {
      "command": "node",
      "args": ["chemin/vers/aether_mcp_server.js"]
    }
  }
}
```

---

## Journal des Versions

| Version | Changements |
|---------|-------------|
| **v1.0** | Configuration initiale, MCPs de base, système de mémoire |
| **v2.0** | Personnalité améliorée, intégration bot Discord |
| **v2.1** | Migration du moteur IA vers Groq |
| **v3.0** | Multi-fournisseur (Groq+OpenRouter), mémoire persistante par utilisateur, données temps réel, anti-spam, suite complète de commandes |

---

<div align="center">

**⬡ AETHER — Construit session par session ⬡**

</div>
