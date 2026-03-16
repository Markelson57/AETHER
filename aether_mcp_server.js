#!/usr/bin/env node
/**
 * AETHER MCP Server v5.0 — Ouroboros Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Integra el algoritmo Ouroboros: autocreación, reflexión, evolución autónoma.
 *
 * Tools:
 *  Identity & Memory
 *   - get_system_prompt   → personalidad + contexto + loop activo
 *   - get_memory          → sesiones, proyectos, preferencias
 *   - update_memory       → persistir nueva info
 *
 *  Autonomous Loop (Ralph logic)
 *   - loop_start          → inicializar loop de tareas
 *   - loop_status         → estado actual del loop
 *   - loop_tick           → registrar iteración
 *   - loop_complete_task  → marcar tarea completada
 *   - loop_reset          → resetear loop
 *   - get_fix_plan        → leer lista de tareas
 *   - update_fix_plan     → escribir lista de tareas
 *
 *  Ouroboros — Autocreación y Aprendizaje
 *   - read_bible          → leer la Constitución de AETHER (BIBLE.md)
 *   - self_reflect        → reflexionar sobre sesiones recientes, extraer lecciones
 *   - self_evolve         → proponer y aplicar mejoras a personalidad.json
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
const BIBLE_FILE       = path.join(AETHER_DIR, 'BIBLE.md');
const REFLECTIONS_FILE = path.join(AETHER_DIR, 'reflections.json');

const DEFAULT_PERSONALITY = {
  nombre: 'AETHER', descripcion: 'Advanced Enhanced Technical Helper with Extended Resources',
  personalidad: { rasgos: ['analítico', 'directo', 'ingenioso'] },
  estructura_respuesta: ['1. Conclusión — lo más importante primero','2. Explicación — contexto y detalles','3. Opciones o mejoras — alternativas cuando aplica','4. Recomendación final — camino óptimo'],
  especialidades: ['programación','arquitectura de software','automatización','resolución de problemas técnicos','bots de Discord','DevOps básico'],
  comportamiento_activacion: 'Saludo directo. Preguntar qué toca. Sin resúmenes de estado.',
  version: '1.0', ouroboros: { activo: true, ultimo_reflect: null, ciclos_evolucion: 0 }
};
const DEFAULT_MEMORY = { sistema: 'AETHER', version: '5.0', ultima_actualizacion: null, usuario: { nombre: null, preferencias: { idioma: null }, contexto_conocido: [] }, sesiones: [], conocimiento_acumulado: { proyectos: [], preferencias_tecnicas: [], errores_conocidos: [] } };

function readJSON(filePath, defaultValue) {
  try { if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { process.stderr.write(`[AETHER] Warning: ${path.basename(filePath)} unreadable. ${e.message}\n`); }
  if (defaultValue !== undefined) fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
  return defaultValue !== undefined ? JSON.parse(JSON.stringify(defaultValue)) : null;
}
const readPersonality = () => readJSON(PERSONALITY_FILE, DEFAULT_PERSONALITY);
const readMemory      = () => readJSON(MEMORY_FILE, DEFAULT_MEMORY);

function send(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }
function sendError(id, code, message) { send({ jsonrpc: '2.0', id, error: { code, message } }); }

const TOOLS = [
  { name: 'get_system_prompt', description: 'AETHER system prompt with personality, context, Ouroboros state.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_memory', description: 'Current AETHER memory.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'update_memory', description: 'Persist topic to memory.', inputSchema: { type: 'object', properties: { topic: { type: 'string' } }, required: ['topic'] } },
  { name: 'loop_start', description: 'Initialize autonomous task loop.', inputSchema: { type: 'object', properties: { goal: { type: 'string' }, max_loops: { type: 'number' } }, required: ['goal'] } },
  { name: 'loop_status', description: 'Current loop state.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'loop_tick', description: 'Register loop iteration.', inputSchema: { type: 'object', properties: { work_done: { type: 'string' }, exit_signal: { type: 'boolean' }, has_error: { type: 'boolean' }, files_changed: { type: 'number' } }, required: ['work_done', 'exit_signal'] } },
  { name: 'loop_complete_task', description: 'Mark task done in fix_plan.md.', inputSchema: { type: 'object', properties: { task: { type: 'string' } }, required: ['task'] } },
  { name: 'loop_reset', description: 'Reset loop state.', inputSchema: { type: 'object', properties: { reason: { type: 'string' } }, required: [] } },
  { name: 'get_fix_plan', description: 'Read fix_plan.md.', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'update_fix_plan', description: 'Write fix_plan.md.', inputSchema: { type: 'object', properties: { content: { type: 'string' } }, required: ['content'] } },
  { name: 'read_bible', description: "Read AETHER's Constitution (BIBLE.md).", inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'self_reflect', description: 'Store a lesson/insight from recent interactions. Ouroboros learning cycle.', inputSchema: { type: 'object', properties: { insight: { type: 'string' }, area: { type: 'string' }, proposed_change: { type: 'string' } }, required: ['insight', 'area'] } },
  { name: 'self_evolve', description: 'Apply evolution to personalidad.json. Updates traits, specialties, or behavior.', inputSchema: { type: 'object', properties: { change_type: { type: 'string' }, change_description: { type: 'string' }, new_value: { type: 'string' }, action: { type: 'string' } }, required: ['change_type', 'change_description', 'new_value', 'action'] } }
];

function loadLoop() { if (!fs.existsSync(LOOP_FILE)) return null; try { return JSON.parse(fs.readFileSync(LOOP_FILE, 'utf8')); } catch { return null; } }
function saveLoop(s) { fs.writeFileSync(LOOP_FILE, JSON.stringify(s, null, 2), 'utf8'); }
function freshLoop(goal, max) { return { goal, max_loops: max||20, iteration: 0, started_at: new Date().toISOString(), updated_at: new Date().toISOString(), status: 'running', exit_signal_count: 0, completion_indicators: 0, circuit_breaker: { state: 'CLOSED', no_progress_streak: 0, same_error_streak: 0, opened_at: null, reason: null }, history: [] }; }

function evalCB(state, fc, err) {
  const cb = state.circuit_breaker;
  if (cb.state==='OPEN') return 'OPEN';
  cb.no_progress_streak = fc===0 ? cb.no_progress_streak+1 : 0;
  cb.same_error_streak  = err  ? cb.same_error_streak+1  : 0;
  if (cb.no_progress_streak>=3) { cb.state='OPEN'; cb.opened_at=new Date().toISOString(); cb.reason=`No progress x${cb.no_progress_streak}`; return 'OPEN'; }
  if (cb.same_error_streak>=5)  { cb.state='OPEN'; cb.opened_at=new Date().toISOString(); cb.reason=`Same error x${cb.same_error_streak}`;   return 'OPEN'; }
  return 'CLOSED';
}

function evalExit(state, sig) {
  if (sig) { state.exit_signal_count++; state.completion_indicators++; } else { state.exit_signal_count=0; }
  if (state.exit_signal_count>=5) return { should_exit:true, reason:'safety_circuit_breaker' };
  if (state.completion_indicators>=2 && sig) return { should_exit:true, reason:'project_complete' };
  if (fs.existsSync(FIX_PLAN_FILE)) { const c=fs.readFileSync(FIX_PLAN_FILE,'utf8'); if ((c.match(/^[ \t]*- \[[xX]\]/gm)||[]).length>0 && (c.match(/^[ \t]*- \[ \]/gm)||[]).length===0) return { should_exit:true, reason:'plan_complete' }; }
  if (state.iteration>=state.max_loops) return { should_exit:true, reason:'max_loops_reached' };
  return { should_exit:false, reason:null };
}

function handleGetSystemPrompt() {
  const p=readPersonality(), m=readMemory(), loop=loadLoop(), ref=readJSON(REFLECTIONS_FILE,null);
  const sessions=(m.sesiones||[]).slice(-3).map(s=>`- Sesión ${s.id} (${s.fecha}): ${(s.temas_tratados||[]).slice(-2).join(' | ')}`).join('\n')||'Sin sesiones previas.';
  const loopCtx=loop&&loop.status==='running'?`\nLOOP ACTIVO: ${loop.goal} | Iter: ${loop.iteration}/${loop.max_loops}`:'';
  const ouroCtx=p.ouroboros?`\nOUROBOROS: ciclos=${p.ouroboros.ciclos_evolucion||0} | reflect=${p.ouroboros.ultimo_reflect||'nunca'}`:''
  const lastRef=ref&&ref.length>0?`\nÚLT. REFLEXIÓN: ${ref[ref.length-1].insight}`:'';
  return `Eres AETHER.\n${p.descripcion}.\n\nPERSONALIDAD: ${(p.personalidad.rasgos||[]).join(', ')}\n\nESTRUCTURA:\n${(p.estructura_respuesta||[]).join('\n')}\n\nESPECIALIDADES: ${(p.especialidades||[]).join(', ')}\n\nCONTEXTO: Nombre=${((m.usuario||{}).nombre)||'?'} | Idioma=${(((m.usuario||{}).preferencias)||{}).idioma||'?'}\n\nSESIONES:\n${sessions}${loopCtx}${ouroCtx}${lastRef}\n\nOUROBOROS: Eres un agente que aprende y evoluciona. Usa read_bible, self_reflect, self_evolve.\n\nCOMPORTAMIENTO: ${p.comportamiento_activacion}\n\nActúa como copiloto técnico. Directo, analítico, ingenioso.`;
}

function handleGetMemory() { return readMemory(); }
function handleUpdateMemory(topic) {
  const m=readMemory(), today=new Date().toISOString().split('T')[0];
  if (!m.sesiones) m.sesiones=[];
  let s=m.sesiones.find(s=>s.fecha===today);
  if (!s) { s={id:`sesion_${String(m.sesiones.length+1).padStart(3,'0')}`,fecha:today,temas_tratados:[],decisiones_tomadas:[]}; m.sesiones.push(s); }
  s.temas_tratados.push(topic); m.ultima_actualizacion=today;
  fs.writeFileSync(MEMORY_FILE,JSON.stringify(m,null,2),'utf8');
  return `Memory updated: "${topic}"`;
}
function handleLoopStart(goal,max) { const s=freshLoop(goal,max); saveLoop(s); if (!fs.existsSync(FIX_PLAN_FILE)) fs.writeFileSync(FIX_PLAN_FILE,`# Fix Plan\n\n- [ ] ${goal}\n`,'utf8'); return {message:`Loop started: "${goal}"`,state:s}; }
function handleLoopStatus() { const s=loadLoop(); if (!s) return {status:'no_loop'}; return s; }
function handleLoopTick(wd,sig,err,fc) {
  const s=loadLoop(); if (!s) return {error:'No loop'}; if (s.status!=='running') return {error:`Loop ${s.status}`};
  s.iteration++; s.updated_at=new Date().toISOString();
  s.history.push({iteration:s.iteration,work_done:wd,exit_signal:sig,has_error:err||false,files_changed:fc||0,timestamp:s.updated_at});
  if (s.history.length>10) s.history.shift();
  if (evalCB(s,fc||0,err||false)==='OPEN') { s.status='halted'; saveLoop(s); return {action:'HALT',reason:s.circuit_breaker.reason,iteration:s.iteration}; }
  const ex=evalExit(s,sig);
  if (ex.should_exit) { s.status='complete'; saveLoop(s); return {action:'EXIT',reason:ex.reason,iteration:s.iteration}; }
  saveLoop(s); return {action:'CONTINUE',iteration:s.iteration,remaining:s.max_loops-s.iteration};
}
function handleLoopCompleteTask(task) {
  if (!fs.existsSync(FIX_PLAN_FILE)) return {error:'fix_plan.md not found'};
  let c=fs.readFileSync(FIX_PLAN_FILE,'utf8');
  const rx=new RegExp(`(^[ \\t]*- )\\[ \\](.*${task.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}.*$)`,'im');
  if (!rx.test(c)) return {error:`Task not found: "${task}"` };
  c=c.replace(rx,'$1[x]$2'); fs.writeFileSync(FIX_PLAN_FILE,c,'utf8');
  return {message:`Done: "${task}"`,pending:(c.match(/^[ \t]*- \[ \]/gm)||[]).length};
}
function handleLoopReset(reason) {
  const s=loadLoop()||freshLoop('reset',20);
  s.circuit_breaker={state:'CLOSED',no_progress_streak:0,same_error_streak:0,opened_at:null,reason:null};
  s.exit_signal_count=0; s.completion_indicators=0; s.status='running'; s.reset_reason=reason||'manual';
  saveLoop(s); return {message:`Reset: ${s.reset_reason}`};
}
function handleGetFixPlan() { return fs.existsSync(FIX_PLAN_FILE)?fs.readFileSync(FIX_PLAN_FILE,'utf8'):'(empty)'; }
function handleUpdateFixPlan(content) { fs.writeFileSync(FIX_PLAN_FILE,content,'utf8'); return {message:'updated'}; }

function handleReadBible() { return fs.existsSync(BIBLE_FILE)?fs.readFileSync(BIBLE_FILE,'utf8'):'BIBLE.md not found.'; }

function handleSelfReflect(insight,area,proposed) {
  const refs=readJSON(REFLECTIONS_FILE,[])||[];
  const p=readPersonality();
  const r={timestamp:new Date().toISOString(),area,insight,proposed_change:proposed||null,cycle:(p.ouroboros||{}).ciclos_evolucion||0};
  refs.push(r); if (refs.length>50) refs.shift();
  fs.writeFileSync(REFLECTIONS_FILE,JSON.stringify(refs,null,2),'utf8');
  if (!p.ouroboros) p.ouroboros={activo:true,ultimo_reflect:null,ciclos_evolucion:0};
  p.ouroboros.ultimo_reflect=r.timestamp;
  fs.writeFileSync(PERSONALITY_FILE,JSON.stringify(p,null,2),'utf8');
  return {message:`Reflected. Area: ${area}. Total: ${refs.length}.`,reflection:r};
}

function handleSelfEvolve(changeType,desc,newVal,action) {
  const p=readPersonality();
  let changed=false,before,after;
  if (changeType==='rasgos') {
    before=[...(p.personalidad.rasgos||[])];
    if (action==='add') { const add=newVal.split(',').map(s=>s.trim()).filter(s=>s&&!p.personalidad.rasgos.includes(s)); p.personalidad.rasgos.push(...add); changed=add.length>0; }
    else if (action==='remove') { p.personalidad.rasgos=p.personalidad.rasgos.filter(r=>!newVal.split(',').map(s=>s.trim()).includes(r)); changed=true; }
    else if (action==='replace') { p.personalidad.rasgos=newVal.split(',').map(s=>s.trim()); changed=true; }
    after=p.personalidad.rasgos;
  } else if (changeType==='especialidades') {
    before=[...(p.especialidades||[])];
    if (action==='add') { const add=newVal.split(',').map(s=>s.trim()).filter(s=>s&&!p.especialidades.includes(s)); p.especialidades.push(...add); changed=add.length>0; }
    else if (action==='remove') { p.especialidades=p.especialidades.filter(e=>!newVal.split(',').map(s=>s.trim()).includes(e)); changed=true; }
    after=p.especialidades;
  } else if (changeType==='comportamiento') { before=p.comportamiento_activacion; p.comportamiento_activacion=newVal; after=newVal; changed=true; }
  else if (changeType==='evitar') { before=p.personalidad.evitar||''; p.personalidad.evitar=action==='add'?(before?before+' | '+newVal:newVal):newVal; after=p.personalidad.evitar; changed=true; }
  else if (changeType==='estructura_respuesta' && action==='add') { before=[...(p.estructura_respuesta||[])]; p.estructura_respuesta.push(newVal); after=p.estructura_respuesta; changed=true; }
  if (!changed) return {message:'No changes.'};
  if (!p.ouroboros) p.ouroboros={activo:true,ultimo_reflect:null,ciclos_evolucion:0};
  p.ouroboros.ciclos_evolucion=(p.ouroboros.ciclos_evolucion||0)+1;
  p.version=p.version?p.version.replace(/(\d+)$/,n=>String(parseInt(n)+1)):'1.1';
  fs.writeFileSync(PERSONALITY_FILE,JSON.stringify(p,null,2),'utf8');
  const refs=readJSON(REFLECTIONS_FILE,[])||[];
  refs.push({timestamp:new Date().toISOString(),area:'evolution',insight:desc,change:{type:changeType,action,before:JSON.stringify(before),after:JSON.stringify(after)},cycle:p.ouroboros.ciclos_evolucion});
  if (refs.length>50) refs.shift();
  fs.writeFileSync(REFLECTIONS_FILE,JSON.stringify(refs,null,2),'utf8');
  return {message:`Evolution #${p.ouroboros.ciclos_evolucion}. Version: ${p.version}.`,change_type:changeType,action,before,after};
}

function handleRequest(req) {
  const {id,method,params}=req;
  if (method==='initialize') return send({jsonrpc:'2.0',id,result:{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'aether',version:'5.0'}}});
  if (method==='notifications/initialized') return;
  if (method==='tools/list') return send({jsonrpc:'2.0',id,result:{tools:TOOLS}});
  if (method==='tools/call') {
    const name=params?.name, args=params?.arguments||{};
    try {
      let result;
      switch(name) {
        case 'get_system_prompt': result=handleGetSystemPrompt(); break;
        case 'get_memory':        result=handleGetMemory(); break;
        case 'update_memory':     result=handleUpdateMemory(args.topic); break;
        case 'loop_start':        result=handleLoopStart(args.goal,args.max_loops); break;
        case 'loop_status':       result=handleLoopStatus(); break;
        case 'loop_tick':         result=handleLoopTick(args.work_done,args.exit_signal,args.has_error,args.files_changed); break;
        case 'loop_complete_task':result=handleLoopCompleteTask(args.task); break;
        case 'loop_reset':        result=handleLoopReset(args.reason); break;
        case 'get_fix_plan':      result=handleGetFixPlan(); break;
        case 'update_fix_plan':   result=handleUpdateFixPlan(args.content); break;
        case 'read_bible':        result=handleReadBible(); break;
        case 'self_reflect':      result=handleSelfReflect(args.insight,args.area,args.proposed_change); break;
        case 'self_evolve':       result=handleSelfEvolve(args.change_type,args.change_description,args.new_value,args.action); break;
        default: return sendError(id,-32601,`Unknown: ${name}`);
      }
      return send({jsonrpc:'2.0',id,result:{content:[{type:'text',text:typeof result==='string'?result:JSON.stringify(result,null,2)}]}});
    } catch(err) { return sendError(id,-32603,err.message); }
  }
  sendError(id,-32601,`Method not found: ${method}`);
}

const rl=readline.createInterface({input:process.stdin,terminal:false});
rl.on('line',line=>{ const t=line.trim(); if (!t) return; try { handleRequest(JSON.parse(t)); } catch(e) { send({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}}); } });
process.stderr.write('[AETHER MCP v5.0 — Ouroboros Edition] Server started\n');
