#!/usr/bin/env node
/**
 * AETHER MCP Server v3.0
 * Provides get_system_prompt, get_memory, and update_memory tools
 * for use with Claude Desktop.
 *
 * Usage: node aether_mcp_server.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const AETHER_DIR = path.dirname(__filename);
const MEMORY_FILE = path.join(AETHER_DIR, 'memoria.json');
const PERSONALITY_FILE = path.join(AETHER_DIR, 'personalidad.json');

// ─── MCP Protocol Helpers ───────────────────────────────────────────────────

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function sendError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'get_system_prompt',
    description: 'Returns the AETHER system prompt including personality, context and last session info.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_memory',
    description: 'Returns the current AETHER memory: sessions, projects, preferences.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'update_memory',
    description: 'Adds a topic or update to AETHER memory for persistence across sessions.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'The information or update to store in memory.' }
      },
      required: ['topic']
    }
  }
];

// ─── Tool Handlers ───────────────────────────────────────────────────────────

function handleGetSystemPrompt() {
  const personality = JSON.parse(fs.readFileSync(PERSONALITY_FILE, 'utf8'));
  const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));

  const lastSessions = memory.sesiones
    .slice(-3)
    .map(s => `- Sesión ${s.id} (${s.fecha}): ${s.temas_tratados.slice(-2).join(' | ')}`)
    .join('\n') || 'Sin sesiones previas.';

  const prompt = `Eres AETHER.
${personality.descripcion}.

PERSONALIDAD: ${personality.personalidad.rasgos.join(', ')}

ESTRUCTURA:
${personality.estructura_respuesta.join('\n')}

ESPECIALIDADES: ${personality.especialidades.join(', ')}

CONTEXTO USUARIO:
- Nombre: ${memory.usuario.nombre || 'no configurado'}
- Idioma: ${memory.usuario.preferencias.idioma || 'no configurado'}
- Preferencias técnicas: ${memory.conocimiento_acumulado.preferencias_tecnicas.join(', ') || 'ninguna aún'}

ÚLTIMAS SESIONES:
${lastSessions}

COMPORTAMIENTO AL ACTIVAR: ${personality.comportamiento_activacion}

Actúa como copiloto técnico. Sé directo, analítico e ingenioso.`;

  return prompt;
}

function handleGetMemory() {
  return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
}

function handleUpdateMemory(topic) {
  const memory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  const today = new Date().toISOString().split('T')[0];

  // Find or create today's session
  let session = memory.sesiones.find(s => s.fecha === today);
  if (!session) {
    session = {
      id: `sesion_${String(memory.sesiones.length + 1).padStart(3, '0')}`,
      fecha: today,
      temas_tratados: [],
      decisiones_tomadas: []
    };
    memory.sesiones.push(session);
  }

  session.temas_tratados.push(topic);
  memory.ultima_actualizacion = today;

  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
  return `Memory updated: "${topic}"`;
}

// ─── Request Handler ─────────────────────────────────────────────────────────

function handleRequest(req) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    return send({
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'aether', version: '3.0' }
      }
    });
  }

  if (method === 'notifications/initialized') return;

  if (method === 'tools/list') {
    return send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    try {
      let result;
      if (toolName === 'get_system_prompt') result = handleGetSystemPrompt();
      else if (toolName === 'get_memory') result = handleGetMemory();
      else if (toolName === 'update_memory') result = handleUpdateMemory(args.topic);
      else return sendError(id, -32601, `Unknown tool: ${toolName}`);

      return send({
        jsonrpc: '2.0', id,
        result: {
          content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
        }
      });
    } catch (err) {
      return sendError(id, -32603, err.message);
    }
  }

  sendError(id, -32601, `Method not found: ${method}`);
}

// ─── Main Loop ───────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', line => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    handleRequest(JSON.parse(trimmed));
  } catch (e) {
    send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
  }
});

process.stderr.write('[AETHER MCP] Server started\n');
