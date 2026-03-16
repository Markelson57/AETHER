#!/usr/bin/env node
/**
 * AETHER MCP Server v4.1
 * ─────────────────────────────────────────────────────────────────────────────
 * Tools available to Claude Desktop:
 *
 *  Identity & Memory
 *   - get_system_prompt   → AETHER identity + context
 *   - get_memory          → sessions, projects, preferences
 *   - update_memory       → persist new info
 *
 *  Autonomous Loop (Ralph logic)
 *   - loop_start          → initialize a task loop
 *   - loop_status         → current loop state
 *   - loop_tick           → register one iteration (progress + exit signal)
 *   - loop_complete_task  → mark a task done in fix_plan
 *   - loop_reset          → reset loop state
 *   - get_fix_plan        → read current task list
 *   - update_fix_plan     → write/replace task list
 *
 * Usage: node aether_mcp_server.js
 */

const readline = require('readline');
const fs       = require('fs');
const path     = require('path');

const AETHER_DIR       = path.dirname(__filename);
const MEMORY_FILE      = path.join(AETHER_DIR, 'memoria.json');
const PERSONALITY_FILE = path.join(AETHER_DIR, 'personalidad.json');
const LOOP_FILE        = path.join(AETHER_DIR, 'loop_state.json');
const FIX_PLAN_FILE    = path.join(AETHER_DIR, 'fix_plan.md');

// ─── Default personality (fallback if personalidad.json missing) ─────────────

const DEFAULT_PERSONALITY = {
  nombre: 'AETHER',
  descripcion: 'Advanced Enhanced Technical Helper with Extended Resources',
  personalidad: { rasgos: ['analítico', 'directo', 'ingenioso'] },
  estructura_respuesta: [
    '1. Conclusión — lo más importante primero',
    '2. Explicación — contexto y detalles',
    '3. Opciones o mejoras — alternativas cuando aplica',
    '4. Recomendación final — camino óptimo'
  ],
  especialidades: ['programación', 'arquitectura de software', 'automatización', 'resolución de problemas técnicos', 'bots de Discord', 'DevOps básico'],
  comportamiento_activacion: 'Saludo directo. Preguntar qué toca. Sin resúmenes de estado.'
};

const DEFAULT_MEMORY = {
  sistema: 'AETHER',
  version: '4.1',
  ultima_actualizacion: null,
  usuario: { nombre: null, preferencias: { idioma: null }, contexto_conocido: [] },
  sesiones: [],
  conocimiento_acumulado: { proyectos: [], preferencias_tecnicas: [], errores_conocidos: [] }
};

// ─── Safe file readers ───────────────────────────────────────────────────────

function readPersonality() {
  try {
    if (fs.existsSync(PERSONALITY_FILE))
      return JSON.parse(fs.readFileSync(PERSONALITY_FILE, 'utf8'));
  } catch (e) {
    process.stderr.write(`[AETHER] Warning: personalidad.json unreadable — using defaults. ${e.message}\n`);
  }
  return DEFAULT_PERSONALITY;
}

function readMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE))
      return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  } catch (e) {
    process.stderr.write(`[AETHER] Warning: memoria.json unreadable — using defaults. ${e.message}\n`);
  }
  // Create empty memory file so future writes work
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(DEFAULT_MEMORY, null, 2), 'utf8');
  return JSON.parse(JSON.stringify(DEFAULT_MEMORY));
}

// ─── MCP Protocol ────────────────────────────────────────────────────────────

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
    description: 'Returns the AETHER system prompt: personality, context, last sessions.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'get_memory',
    description: 'Returns the current AETHER memory: sessions, projects, preferences.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'update_memory',
    description: 'Persists a topic or update to AETHER memory across sessions.',
    inputSchema: {
      type: 'object',
      properties: { topic: { type: 'string', description: 'Information to store.' } },
      required: ['topic']
    }
  },
  {
    name: 'loop_start',
    description: 'Initialize an autonomous task loop. Resets state and creates a new loop session.',
    inputSchema: {
      type: 'object',
      properties: {
        goal:      { type: 'string', description: 'High-level goal for this loop.' },
        max_loops: { type: 'number', description: 'Max iterations before forcing stop. Default: 20.' }
      },
      required: ['goal']
    }
  },
  {
    name: 'loop_status',
    description: 'Returns the current loop state: iteration count, tasks, circuit breaker, exit signal.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'loop_tick',
    description: 'Register one loop iteration. Updates progress, detects stagnation, evaluates exit conditions.',
    inputSchema: {
      type: 'object',
      properties: {
        work_done:     { type: 'string',  description: 'What was accomplished this iteration.' },
        exit_signal:   { type: 'boolean', description: 'Set true when ALL tasks are complete.' },
        has_error:     { type: 'boolean', description: 'Whether this iteration produced an error.' },
        files_changed: { type: 'number',  description: 'Number of files modified this iteration.' }
      },
      required: ['work_done', 'exit_signal']
    }
  },
  {
    name: 'loop_complete_task',
    description: 'Mark a task as done in fix_plan.md by matching its description.',
    inputSchema: {
      type: 'object',
      properties: { task: { type: 'string', description: 'Exact or partial text of the task to mark complete.' } },
      required: ['task']
    }
  },
  {
    name: 'loop_reset',
    description: 'Reset the loop state (circuit breaker, counters, exit signals).',
    inputSchema: {
      type: 'object',
      properties: { reason: { type: 'string', description: 'Reason for reset.' } },
      required: []
    }
  },
  {
    name: 'get_fix_plan',
    description: 'Read the current fix_plan.md task list.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'update_fix_plan',
    description: 'Write or replace the fix_plan.md task list.',
    inputSchema: {
      type: 'object',
      properties: { content: { type: 'string', description: 'Full markdown content of the fix plan.' } },
      required: ['content']
    }
  }
];

// ─── Loop State ──────────────────────────────────────────────────────────────

function loadLoop() {
  if (!fs.existsSync(LOOP_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(LOOP_FILE, 'utf8')); }
  catch { return null; }
}

function saveLoop(state) {
  fs.writeFileSync(LOOP_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function freshLoop(goal, maxLoops) {
  return {
    goal, max_loops: maxLoops || 20, iteration: 0,
    started_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    status: 'running', exit_signal_count: 0, completion_indicators: 0,
    circuit_breaker: { state: 'CLOSED', no_progress_streak: 0, same_error_streak: 0, opened_at: null, reason: null },
    history: []
  };
}

// ─── Circuit Breaker ─────────────────────────────────────────────────────────

function evaluateCircuitBreaker(state, filesChanged, hasError) {
  const cb = state.circuit_breaker;
  if (cb.state === 'OPEN') return 'OPEN';
  cb.no_progress_streak = filesChanged === 0 ? cb.no_progress_streak + 1 : 0;
  cb.same_error_streak  = hasError ? cb.same_error_streak + 1 : 0;
  if (cb.no_progress_streak >= 3) {
    cb.state = 'OPEN'; cb.opened_at = new Date().toISOString();
    cb.reason = `No progress for ${cb.no_progress_streak} consecutive loops`;
    return 'OPEN';
  }
  if (cb.same_error_streak >= 5) {
    cb.state = 'OPEN'; cb.opened_at = new Date().toISOString();
    cb.reason = `Same error repeated ${cb.same_error_streak} times`;
    return 'OPEN';
  }
  return 'CLOSED';
}

// ─── Exit Detection ──────────────────────────────────────────────────────────

function evaluateExit(state, exitSignal) {
  if (exitSignal) { state.exit_signal_count++; state.completion_indicators++; }
  else { state.exit_signal_count = 0; }
  if (state.exit_signal_count >= 5)
    return { should_exit: true, reason: 'safety_circuit_breaker' };
  if (state.completion_indicators >= 2 && exitSignal)
    return { should_exit: true, reason: 'project_complete' };
  if (fs.existsSync(FIX_PLAN_FILE)) {
    const c = fs.readFileSync(FIX_PLAN_FILE, 'utf8');
    const pending   = (c.match(/^[ \t]*- \[ \]/gm) || []).length;
    const completed = (c.match(/^[ \t]*- \[[xX]\]/gm) || []).length;
    if (completed > 0 && pending === 0)
      return { should_exit: true, reason: 'plan_complete' };
  }
  if (state.iteration >= state.max_loops)
    return { should_exit: true, reason: 'max_loops_reached' };
  return { should_exit: false, reason: null };
}

// ─── Tool Handlers ───────────────────────────────────────────────────────────

function handleGetSystemPrompt() {
  const personality = readPersonality();
  const memory      = readMemory();
  const loop        = loadLoop();

  const lastSessions = (memory.sesiones || [])
    .slice(-3)
    .map(s => `- Sesión ${s.id} (${s.fecha}): ${(s.temas_tratados || []).slice(-2).join(' | ')}`)
    .join('\n') || 'Sin sesiones previas.';

  const loopContext = loop && loop.status === 'running'
    ? `\nLOOP AUTÓNOMO ACTIVO:\n- Goal: ${loop.goal}\n- Iteración: ${loop.iteration}/${loop.max_loops}\n- Circuit breaker: ${loop.circuit_breaker.state}\n- Completion indicators: ${loop.completion_indicators}`
    : '';

  const prefs = (memory.conocimiento_acumulado || {}).preferencias_tecnicas || [];

  return `Eres AETHER.
${personality.descripcion}.

PERSONALIDAD: ${personality.personalidad.rasgos.join(', ')}

ESTRUCTURA:
${personality.estructura_respuesta.join('\n')}

ESPECIALIDADES: ${personality.especialidades.join(', ')}

CONTEXTO USUARIO:
- Nombre: ${(memory.usuario || {}).nombre || 'no configurado'}
- Idioma: ${((memory.usuario || {}).preferencias || {}).idioma || 'no configurado'}
- Preferencias técnicas: ${prefs.join(', ') || 'ninguna aún'}

ÚLTIMAS SESIONES:
${lastSessions}
${loopContext}

LOOP AUTÓNOMO (Ralph):
Cuando operes en modo loop autónomo, al final de cada iteración reporta:

AETHER_STATUS:
  STATUS: [IN_PROGRESS | COMPLETE]
  EXIT_SIGNAL: [true | false]
  WORK_DONE: <qué implementaste>
  NEXT_STEPS: <qué queda pendiente, o NONE>

Reglas del loop:
- Lee fix_plan.md al inicio de cada iteración (get_fix_plan)
- Marca tareas con loop_complete_task cuando las termines
- NO hagas preguntas — elige la opción técnica más sensata y actúa
- EXIT_SIGNAL: true SOLO cuando todas las tareas estén completas
- Llama a loop_tick al final de cada iteración para registrar el progreso

COMPORTAMIENTO AL ACTIVAR: ${personality.comportamiento_activacion}

Actúa como copiloto técnico. Sé directo, analítico e ingenioso.`;
}

function handleGetMemory() {
  return readMemory();
}

function handleUpdateMemory(topic) {
  const memory = readMemory();
  const today  = new Date().toISOString().split('T')[0];
  let session  = (memory.sesiones || []).find(s => s.fecha === today);
  if (!session) {
    session = { id: `sesion_${String((memory.sesiones || []).length + 1).padStart(3, '0')}`, fecha: today, temas_tratados: [], decisiones_tomadas: [] };
    if (!memory.sesiones) memory.sesiones = [];
    memory.sesiones.push(session);
  }
  session.temas_tratados.push(topic);
  memory.ultima_actualizacion = today;
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
  return `Memory updated: "${topic}"`;
}

function handleLoopStart(goal, maxLoops) {
  const state = freshLoop(goal, maxLoops);
  saveLoop(state);
  if (!fs.existsSync(FIX_PLAN_FILE))
    fs.writeFileSync(FIX_PLAN_FILE, `# Fix Plan\n\n- [ ] Define tasks for: ${goal}\n`, 'utf8');
  return { message: `Loop started. Goal: "${goal}". Max iterations: ${state.max_loops}.`, state };
}

function handleLoopStatus() {
  const state = loadLoop();
  if (!state) return { status: 'no_loop', message: 'No active loop. Call loop_start first.' };
  let tasks = { pending: 0, done: 0, total: 0 };
  if (fs.existsSync(FIX_PLAN_FILE)) {
    const c = fs.readFileSync(FIX_PLAN_FILE, 'utf8');
    tasks.pending = (c.match(/^[ \t]*- \[ \]/gm) || []).length;
    tasks.done    = (c.match(/^[ \t]*- \[[xX]\]/gm) || []).length;
    tasks.total   = tasks.pending + tasks.done;
  }
  return { ...state, tasks };
}

function handleLoopTick(workDone, exitSignal, hasError, filesChanged) {
  const state = loadLoop();
  if (!state) return { error: 'No active loop. Call loop_start first.' };
  if (state.status !== 'running') return { error: `Loop is ${state.status}, not running.` };
  state.iteration++;
  state.updated_at = new Date().toISOString();
  state.history.push({ iteration: state.iteration, work_done: workDone, exit_signal: exitSignal, has_error: hasError || false, files_changed: filesChanged || 0, timestamp: state.updated_at });
  if (state.history.length > 10) state.history.shift();
  if (evaluateCircuitBreaker(state, filesChanged || 0, hasError || false) === 'OPEN') {
    state.status = 'halted'; saveLoop(state);
    return { action: 'HALT', reason: `Circuit breaker OPEN: ${state.circuit_breaker.reason}`, iteration: state.iteration, state };
  }
  const exit = evaluateExit(state, exitSignal);
  if (exit.should_exit) {
    state.status = 'complete'; saveLoop(state);
    return { action: 'EXIT', reason: exit.reason, iteration: state.iteration, message: `Loop complete after ${state.iteration} iterations.`, state };
  }
  saveLoop(state);
  return { action: 'CONTINUE', iteration: state.iteration, remaining: state.max_loops - state.iteration, completion_indicators: state.completion_indicators, circuit_breaker: state.circuit_breaker.state, message: `Iteration ${state.iteration} registered. Continue.` };
}

function handleLoopCompleteTask(task) {
  if (!fs.existsSync(FIX_PLAN_FILE)) return { error: 'fix_plan.md not found.' };
  let content = fs.readFileSync(FIX_PLAN_FILE, 'utf8');
  const regex = new RegExp(`(^[ \\t]*- )\\[ \\](.*${task.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$)`, 'im');
  if (regex.test(content)) {
    content = content.replace(regex, '$1[x]$2');
    fs.writeFileSync(FIX_PLAN_FILE, content, 'utf8');
    const pending   = (content.match(/^[ \t]*- \[ \]/gm) || []).length;
    const completed = (content.match(/^[ \t]*- \[[xX]\]/gm) || []).length;
    return { message: `Task marked complete: "${task}"`, tasks: { pending, completed, total: pending + completed } };
  }
  return { error: `Task not found in fix_plan: "${task}"` };
}

function handleLoopReset(reason) {
  const state = loadLoop() || freshLoop('reset', 20);
  state.circuit_breaker = { state: 'CLOSED', no_progress_streak: 0, same_error_streak: 0, opened_at: null, reason: null };
  state.exit_signal_count = 0; state.completion_indicators = 0;
  state.status = 'running'; state.updated_at = new Date().toISOString();
  state.reset_reason = reason || 'manual';
  saveLoop(state);
  return { message: `Loop reset. Reason: ${state.reset_reason}`, state };
}

function handleGetFixPlan() {
  if (!fs.existsSync(FIX_PLAN_FILE)) return '# Fix Plan\n\n(empty — no tasks yet)\n';
  return fs.readFileSync(FIX_PLAN_FILE, 'utf8');
}

function handleUpdateFixPlan(content) {
  fs.writeFileSync(FIX_PLAN_FILE, content, 'utf8');
  const pending   = (content.match(/^[ \t]*- \[ \]/gm) || []).length;
  const completed = (content.match(/^[ \t]*- \[[xX]\]/gm) || []).length;
  return { message: 'fix_plan.md updated.', tasks: { pending, completed, total: pending + completed } };
}

// ─── Request Router ──────────────────────────────────────────────────────────

function handleRequest(req) {
  const { id, method, params } = req;
  if (method === 'initialize') {
    return send({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'aether', version: '4.1' } } });
  }
  if (method === 'notifications/initialized') return;
  if (method === 'tools/list') {
    return send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  }
  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments || {};
    try {
      let result;
      switch (name) {
        case 'get_system_prompt':  result = handleGetSystemPrompt(); break;
        case 'get_memory':         result = handleGetMemory(); break;
        case 'update_memory':      result = handleUpdateMemory(args.topic); break;
        case 'loop_start':         result = handleLoopStart(args.goal, args.max_loops); break;
        case 'loop_status':        result = handleLoopStatus(); break;
        case 'loop_tick':          result = handleLoopTick(args.work_done, args.exit_signal, args.has_error, args.files_changed); break;
        case 'loop_complete_task': result = handleLoopCompleteTask(args.task); break;
        case 'loop_reset':         result = handleLoopReset(args.reason); break;
        case 'get_fix_plan':       result = handleGetFixPlan(); break;
        case 'update_fix_plan':    result = handleUpdateFixPlan(args.content); break;
        default: return sendError(id, -32601, `Unknown tool: ${name}`);
      }
      return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }] } });
    } catch (err) {
      return sendError(id, -32603, err.message);
    }
  }
  sendError(id, -32601, `Method not found: ${method}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on('line', line => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try { handleRequest(JSON.parse(trimmed)); }
  catch (e) { send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
});

process.stderr.write('[AETHER MCP v4.1] Server started\n');
