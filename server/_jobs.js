const {createHash,randomUUID} = require('crypto');
const {failure,signedUrl} = require('./_store');
const core = require('../public/studio-core');
const editorial = require('./_editorial');
const BASE = 'legado-studio/jobs/';
function validateConfig(c) {
  if (!c || !['script','audio','english','review'].includes(c.type)) throw failure('Tipo de trabajo inválido.',400);
  if (c.type === 'script') {
    if (typeof c.prompt !== 'string' || c.prompt.length > 160000 || c.prompt.length < 20) throw failure('Falta el encargo del guion.',400);
    if(c.wordsPerSecond!==undefined&&(!Number.isFinite(c.wordsPerSecond)||c.wordsPerSecond<1||c.wordsPerSecond>4))throw failure('Ritmo de narración inválido.',400);
    if (![30,45,60,90,120,180,300,480].includes(Number(c.seconds))) throw failure('Duración no admitida.',400);
    if (c.editorialVersion!==undefined && c.editorialVersion!==2) throw failure('Versión editorial inválida.',400);
    if (c.editorialVersion===2 && (!Number.isInteger(c.sceneCount)||c.sceneCount<3||c.sceneCount>40||(c.mode==='profesor'&&c.sceneCount!==8))) throw failure('Número de escenas inválido.',400);
  } else if (typeof c.text !== 'string' || !c.text.trim() || c.text.length > 100000) throw failure('Texto inválido.',400);
  if (c.type === 'audio' && !['gemini','chirp','eleven'].includes(c.engine)) throw failure('Motor de voz inválido.',400);
  if (c.type==='review' && (typeof c.prompt!=='string'||c.prompt.length<10||c.prompt.length>25000||c.text.length>30000||JSON.stringify(c.plan||{}).length>20000)) throw failure('El encargo de revisión es inválido o demasiado extenso.',400);
}
function parseOutline(text, count, prompts, professor) {
  let d;
  try { d = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g,'')); } catch(e) { throw failure('El esquema llegó incompleto. Reanuda para pedir esta etapa otra vez.',502); }
  if (!d || !Array.isArray(d.sections) || d.sections.length !== count || !d.sections.every(s=>s && typeof s.beat === 'string' && s.beat.length > 10)) throw failure('El esquema no cubre todas las partes.',502);
  if (!Array.isArray(d.scenes) || d.scenes.length !== prompts || !d.scenes.every(s=>typeof s === 'string' && s.length > 25)) throw failure('El esquema no incluye todas las escenas.',502);
  if (professor && (!d.set || typeof d.set !== 'string')) throw failure('Falta el set de la clase.',502);
  return d;
}
function outputFor(job) {
  if (job.config.type === 'script') {
    if (!job.outline) return null;
    const a = job.parts.map(p=>p.text).join('\n\n');
    const v2=job.config.editorialVersion===2,visuals=v2?job.visuals:job.outline;
    if (!visuals) return null;
    const c = visuals.scenes, professor = job.config.mode === 'profesor';
    const montaje = [];
    if (professor) {
      // Repeat the teaching set, insert examples between explanations.
      const sequence = [0,1,5,2,3,6,0,4,7,1,2,4];
      for (let sec = 0, i = 0; sec < job.config.seconds; sec += 10,i++) {
        const index = sequence[i % sequence.length]; montaje.push({seg:sec,tipo:index < 5 ? 'toma':'ejemplo',n:index < 5 ? index+1:index-4});
      }
    }
    return {a,f:'',c,cRaw:c.map((p,i)=>'PROMPT '+(i+1)+': '+p).join('\n'),set:visuals.set || '',nTomas:professor?5:0,nEjemplos:professor?3:0,montaje,
      ...(v2?{editorialPlan:job.outline,quality:editorial.qualityFor(job),draftA:job.draftText||''}:{}),
      raw:'BLOQUE A\n'+a+'\n\nBLOQUE C\n'+c.map((p,i)=>'PROMPT '+(i+1)+': '+p).join('\n')};
  }
  if (job.config.type === 'english') return {text:job.parts.map(p=>p.text).join('\n\n')};
  if (job.config.type === 'review') return job.parts[0];
  return {parts:job.parts.map(p=>({...p,url:signedUrl(p.object)})),engine:job.config.engine,lang:job.config.lang};
}
function publicJob(j) {
  const total = j.total || 1, completed = j.parts.length;
  return {id:j.id,type:j.config.type,status:j.status,completed,total,stage:j.stage,error:j.error || '',
    progress:Math.round(completed/total*100),...(j.config.type==='script'&&j.config.editorialVersion===2?editorial.publicProgress(j):{}),result:j.status === 'done' ? outputFor(j) : null};
}
async function createJob(store, config, requestId) {
  validateConfig(config);
  if (!/^[a-zA-Z0-9_-]{8,100}$/.test(String(requestId))) throw failure('Falta un identificador estable para el trabajo.',400);
  const hash = createHash('sha256').update(JSON.stringify(config)).digest('hex');
  const id = 'task-'+createHash('sha256').update(requestId+'|'+hash).digest('hex').slice(0,32);
  const path = BASE+id+'.json', old = await store.read(path); if (old) return publicJob(old.data);
  const chunks = config.type === 'audio' ? core.chunks(config.text,80,3200) : config.type === 'english' ? core.chunks(config.text,220,6000) : [];
  const total = config.type === 'script' ? Math.max(1,Math.ceil(Number(config.seconds)*(Number(config.wordsPerSecond)||2.35)/220)) : config.type==='review'?1:chunks.length;
  const job = {id,config,hash,chunks,total,parts:[],status:'ready',stage:config.type === 'script'?'Preparando el esquema':'Listo para comenzar',createdAt:new Date().toISOString(),leaseUntil:0};
  try { await store.put(path,job,0); } catch(e) { if (e.status !== 412) throw e; return publicJob((await store.read(path)).data); }
  return publicJob(job);
}
async function advanceJob(store,id,deps) {
  if (!/^task-[a-f0-9]{32}$/.test(id)) throw failure('Trabajo inválido.',400);
  const path = BASE+id+'.json', old = await store.read(path); if (!old) throw failure('No se encontró este trabajo.',404);
  const job = old.data;
  if (job.status === 'done') return publicJob(job);
  if (job.leaseUntil > Date.now()) return {...publicJob(job),busy:true};
  const owner = randomUUID();
  job.leaseOwner = owner; job.leaseUntil = Date.now()+315000; job.status = 'running'; job.error = '';
  let saved;
  try { saved = await store.put(path,job,old.generation); } catch(e) { if (e.status === 412) return {...publicJob(job),busy:true}; throw e; }
  try {
    const c = job.config, i = job.parts.length;
    if (c.type==='script' && c.editorialVersion===2) {
      await editorial.advanceEditorial(store,job,deps,BASE);
      job.leaseUntil=0;
      await store.put(path,job,saved.generation);
      return publicJob(job);
    }
    const checkpoint = BASE+id+'/step-'+(c.type === 'script' && !job.outline ? 'outline' : i)+'.json';
    const existing = await store.read(checkpoint);
    let part = existing && existing.data;
    if (c.type === 'script' && !job.outline) {
      const n = c.mode === 'profesor' ? 8 : 10;
      if (!part) {
        const p = c.prompt+'\n\nESTA LLAMADA SOLO PLANIFICA; NO escribas el guion completo ni los bloques anteriores. Devuelve SOLO JSON válido sin markdown: {"sections":[{"title":"...","beat":"qué ocurre y qué idea NUEVA aporta esta parte"}],"set":"descripción del set si es profesor","scenes":["descripción de un plano con acción, lugar, ángulo, luz y personaje"]}. '
          +'EXACTAMENTE '+job.total+' sections, en orden y sin repetir contenido; EXACTAMENTE '+n+' scenes para toda la narración de '+c.seconds+' segundos. '
          +(c.mode === 'profesor'?'Las primeras 5 scenes son TOMAS distintas del MISMO set y vestuario del protagonista; las 3 últimas son ejemplos con OTRAS personas, fuera del set. ':'Las escenas siguen los momentos de la historia. Identifica el mismo lugar y vestuario cuando se repitan. ')
          +'Prepara un desenlace que cumpla la promesa del inicio. Sin biografías ficticias presentadas como reales.';
        const d = await deps.text(p,{maxTokens:6000}); part = parseOutline(d.text,job.total,n,c.mode === 'profesor');
      }
      job.outline = part; job.stage = 'Esquema guardado. Escribiendo por partes';
    } else if (c.type === 'script') {
      const target = Math.round(Number(c.seconds)*2.35/job.total);
      if (!part) {
        const p = c.prompt+'\n\nENCARGO DE ESTA ETAPA: SOLO el texto hablado de la parte '+(i+1)+' de '+job.total+'. NO BLOQUES, NO PROMPTS, NO TÍTULOS. '
          +'Entre '+Math.floor(target*0.85)+' y '+Math.ceil(target*1.15)+' palabras. No resumir ni añadir relleno. '
          +(i === 0?'Empieza directamente con el gancho. ': 'Continúa exactamente donde quedó la narración; no saludes ni repitas la introducción. ')
          +(i === job.total-1?'Resuelve el conflicto y termina con Legado de Hierro.':'No cierres el video ni digas Legado de Hierro todavía. ')
          +'\nESQUEMA COMPLETO: '+JSON.stringify(job.outline.sections)+'\nPARTE ACTUAL: '+JSON.stringify(job.outline.sections[i])
          +'\nNARRACIÓN ANTERIOR (mantén continuidad; NO repetir):\n'+job.parts.map(x=>x.text).join('\n\n');
        const d = await deps.text(p,{maxTokens:2500});
        const n = core.words(d.text).length;
        if (n < target*0.7 || n > target*1.4 || /^\s*(BLOQUE|PROMPT)\s+[A-Z0-9]/mi.test(d.text)) throw failure('La parte '+(i+1)+' no tiene una longitud o formato útil. Las anteriores se conservan.',502);
        part = {text:d.text};
      }
      job.parts.push(part); job.stage = 'Guion: parte '+job.parts.length+' de '+job.total;
    } else if (c.type === 'review') {
      if (!part) part=await editorial.reviewExisting(c,deps);
      job.parts.push(part);job.stage='Revisión del texto actual guardada';
    } else if (c.type === 'english') {
      if (!part) {
        const d = await deps.text('Adapt the following script fragment into natural US English, preserving every idea, number and paragraph. No preamble or headings; do not summarize. Do not add a new opening or ending. Only translate the brand when present as Iron Legacy.\n'+job.chunks[i],{maxTokens:2500});
        if (core.words(d.text).length < core.words(job.chunks[i]).length*0.75) throw failure('El fragmento en inglés llegó incompleto.',502);
        part = {text:d.text};
      }
      job.parts.push(part); job.stage = 'Inglés: parte '+job.parts.length+' de '+job.total;
    } else {
      if (!part) {
        const result = await deps.voice(job.chunks[i],c.engine,c.voice || {},c.lang,{previousText:job.chunks[i-1] || '',nextText:job.chunks[i+1] || ''});
        if (!result.parts || result.parts.length !== 1 || !result.parts[0]) throw failure('El proveedor devolvió un tramo de audio inválido.',502);
        const bytes = Buffer.from(result.parts[0],'base64');
        if (bytes.length < 100) throw failure('El tramo de audio está vacío.',502);
        const object = 'legado-studio/media/audio-'+id+'-'+i+'-'+owner+'.'+(result.format === 'wav'?'wav':'mp3');
        await store.bytes(object,bytes,result.format === 'wav'?'audio/wav':'audio/mpeg');
        part = {object,format:result.format,alignment:result.alignments && result.alignments[0] || null,text:job.chunks[i]};
      }
      job.parts.push(part); job.stage = 'Narración: tramo '+job.parts.length+' de '+job.total;
    }
    if (!existing) await store.put(checkpoint,part,0);
    job.status = job.parts.length === job.total ? 'done':'ready'; job.leaseUntil = 0;
    await store.put(path,job,saved.generation); return publicJob(job);
  } catch(e) {
    // Do not advance the failed step; finished checkpoints can be recovered even
    // when the response or final state write was lost.
    job.parts = old.data.parts.slice();
    const current = await store.read(path).catch(()=>null);
    if (current && current.data.leaseOwner === owner) {
      const failed = {...current.data,status:'paused',leaseUntil:0,error:e.message};
      await store.put(path,failed,current.generation).catch(()=>{});
    }
    throw e;
  }
}
module.exports = {createJob,advanceJob,publicJob,outputFor,validateConfig,parseOutline,BASE};
