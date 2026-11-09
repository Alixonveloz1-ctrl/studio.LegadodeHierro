const {test} = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync} = require('node:crypto');
const core = require('../public/studio-core');
const {fitTimeline} = require('../cloudrun/unify/timeline');
const {createJob,advanceJob,BASE} = require('../server/_jobs');
const {cleanAsset,safeObject} = require('../server/_assets');

class MemoryStore {
  constructor(){this.data=new Map();this.seq=0;this.failNextState=false;}
  async read(p){const r=this.data.get(p);return r?structuredClone(r):null;}
  async put(p,d,g){
    const old=this.data.get(p);
    if(g!==undefined&&String(old?old.generation:0)!==String(g)){const e=new Error('conflict');e.status=412;throw e;}
    if(this.failNextState && d.status==='ready'){this.failNextState=false;throw new Error('connection lost saving state');}
    const generation=String(++this.seq);this.data.set(p,{data:structuredClone(d),generation});return {generation};
  }
  async bytes(p,b,mime){return this.put(p,{size:b.length,mime},0);}
}
const {privateKey} = generateKeyPairSync('rsa',{modulusLength:2048});
process.env.GCS_OUTPUT_BUCKET='test-bucket';process.env.GCP_PROJECT_ID='test-project';
process.env.GCP_SERVICE_ACCOUNT=JSON.stringify({client_email:'test@example.test',private_key:privateKey.export({format:'pem',type:'pkcs8'})});

test('long unpunctuated accented narration is bounded by words and UTF-8 bytes, with no lost words',()=>{
  const text=Array.from({length:1500},(_,i)=>'acción'+i).join(' '),parts=core.chunks(text,80,1000);
  assert.equal(parts.join(' '),text);assert.ok(parts.length>15);
  for(const part of parts){assert.ok(core.words(part).length<=80);assert.ok(Buffer.byteLength(part)<=1000);}
});
test('selection requires scene meaning, aspect and explicit continuity; favorites cannot substitute an unrelated shot',()=>{
  const assets=[{id:'a',kind:'video',description:'Calcular presupuesto en oficina con calculadora',aspect:'9:16'},
    {id:'b',kind:'video',description:'Caminar por la calle',aspect:'9:16',favorite:true},
    {id:'c',kind:'image',description:'Calcular presupuesto en oficina con calculadora',aspect:'16:9'}];
  assert.equal(core.rankAssets(assets,{description:'Calcular presupuesto en la oficina',aspect:'9:16'})[0].asset.id,'a');
  assert.equal(core.rankAssets(assets,{description:'Entrenar en gimnasio',aspect:'9:16'}).length,0);
  assert.equal(core.rankAssets(assets,{description:'Calcular presupuesto en oficina',aspect:'9:16',character:'insignia'}).length,0);
});
test('natural reuse rotates equivalent assets and reports missing scenes',()=>{
  const assets=['a','b'].map(id=>({id,kind:'video',aspect:'9:16',description:'Explicar en estudio con pizarra'}));
  const scenes=Array.from({length:5},()=>({description:'Explicar en estudio con pizarra',aspect:'9:16'}));
  const plan=core.selectPlan(scenes,assets);assert.notEqual(plan[0].assetId,plan[1].assetId);
  assert.equal(core.selectPlan([{description:'Caminar en calle'}],assets)[0].assetId,'');
});
test('5- and 8-minute mixed timelines cover the measured narration within one frame without slowing clips',()=>{
  for(const duration of [300.23,480.17]){
    const episode={a:'texto '.repeat(1000),modo:'relato',c:Array.from({length:10},(_,i)=>'Escena '+i)};
    const scenes=core.scenePlan(episode,duration,'9:16');assert.ok(scenes.every(s=>s.duration<=10));
    const timeline=fitTimeline(scenes.map((s,i)=>({object:'legado-studio/media/'+i,kind:i%2?'video':'image',duration:s.duration})),duration);
    assert.ok(Math.abs(timeline.reduce((n,s)=>n+s.duration,0)-duration)<1/30);
    assert.equal(timeline[0].start,0);assert.ok(timeline.every(s=>s.frames>0));
  }
});
test('professor timestamps preserve relative shot durations including repeated set shots',()=>{
  const ep={modo:'profesor',c:Array(8).fill('Protagonista en estudio'),nTomas:5,dO:{id:'300'},montaje:[{seg:0,tipo:'toma',n:1},{seg:50,tipo:'ejemplo',n:1},{seg:200,tipo:'toma',n:1}]};
  const p=core.scenePlan(ep,330,'9:16');assert.ok(p.every(x=>x.duration<=10));
  const at=t=>p.find(x=>t>=x.start&&t<x.start+x.duration);
  assert.equal(at(0).scene,0);assert.equal(at(55).scene,5);assert.equal(at(219).scene,5);assert.equal(at(220).scene,0);
  assert.ok(Math.abs(p.reduce((n,x)=>n+x.duration,0)-330)<0.001);
});
test('expired generation response never turns a partial story into a completed job',async()=>{
  const store=new MemoryStore(),config={type:'script',prompt:'Escribe una historia ilustrativa con una decisión concreta.',seconds:480,mode:'relato'};
  let j=await createJob(store,config,'story-request-001'),calls=0;
  const outline={sections:Array.from({length:j.total},(_,i)=>({title:'Parte '+i,beat:'Una decisión nueva y su consecuencia '+i})),scenes:Array.from({length:10},(_,i)=>'Escena cronológica en la oficina con luz sobria '+i)};
  const text=async()=>{calls++;if(calls===1)return {text:JSON.stringify(outline)};if(calls===3)throw new Error('provider timeout');return {text:('Contenido concreto '.repeat(100)).trim()};};
  j=await advanceJob(store,j.id,{text});j=await advanceJob(store,j.id,{text});assert.equal(j.completed,1);
  await assert.rejects(advanceJob(store,j.id,{text}),/timeout/);
  let saved=await store.read(BASE+j.id+'.json');assert.equal(saved.data.parts.length,1);assert.equal(saved.data.status,'paused');
  j=await advanceJob(store,j.id,{text});assert.equal(j.completed,2);
  while(j.status!=='done')j=await advanceJob(store,j.id,{text});
  assert.equal(j.result.c.length,10);assert.ok(j.result.a.length>1000);
  const before=calls;await advanceJob(store,j.id,{text});assert.equal(calls,before);
});
test('latin accent: every narration-stage prompt of the classic script job carries the writing rule',async()=>{
  const store=new MemoryStore(),config={type:'script',prompt:'Escribe una historia ilustrativa con una decisión concreta.',seconds:480,mode:'relato'};
  let j=await createJob(store,config,'story-request-latino'),calls=0;const prompts=[];
  const outline={sections:Array.from({length:j.total},(_,i)=>({title:'Parte '+i,beat:'Una decisión nueva y su consecuencia '+i})),scenes:Array.from({length:10},(_,i)=>'Escena cronológica en la oficina con luz sobria '+i)};
  const text=async(p)=>{prompts.push(p);calls++;if(calls===1)return {text:JSON.stringify(outline)};return {text:('Contenido concreto '.repeat(100)).trim()};};
  j=await advanceJob(store,j.id,{text});
  j=await advanceJob(store,j.id,{text});
  assert.equal(j.completed,1);
  assert.match(prompts[1],/ESPAÑOL NEUTRO LATINOAMERICANO/,'la parte de narración lleva la regla fija');
  assert.match(prompts[1],/vosotros/);
});

test('overlapping advances claim one lease and invoke the paid provider once',async()=>{
  const store=new MemoryStore();let j=await createJob(store,{type:'english',text:'One short complete fragment to translate.'},'english-request-001');
  let calls=0,release;const wait=new Promise(r=>{release=r;});
  const text=async()=>{calls++;await wait;return {text:'One complete translated fragment with all its original ideas.'};};
  const one=advanceJob(store,j.id,{text});
  await new Promise(r=>setImmediate(r));const two=await advanceJob(store,j.id,{text});
  assert.equal(two.busy,true);release();await one;assert.equal(calls,1);
});
test('a finished checkpoint survives a lost state write without paying for the same fragment again',async()=>{
  const store=new MemoryStore();let j=await createJob(store,{type:'english',text:('palabra '.repeat(450)).trim()},'english-request-002');let calls=0;
  const text=async()=>{calls++;return {text:('word '.repeat(220)).trim()};};
  store.failNextState=true;await assert.rejects(advanceJob(store,j.id,{text}),/connection lost/);
  assert.equal(calls,1);j=await advanceJob(store,j.id,{text});assert.equal(j.completed,1);assert.equal(calls,1);
});
test('audio stores object references and resumes completed chunks without base64 in the response',async()=>{
  const store=new MemoryStore(),text=('Narración útil. '.repeat(70)).trim();let j=await createJob(store,{type:'audio',text,engine:'chirp',voice:{voz:'Algenib'},lang:'es'},'audio-request-001');let calls=0;
  const voice=async(chunk)=>{calls++;assert.ok(core.words(chunk).length<=80);return {format:'wav',parts:[Buffer.alloc(200,1).toString('base64')],alignments:[null]};};
  while(j.status!=='done')j=await advanceJob(store,j.id,{voice});
  assert.ok(j.result.parts.every(p=>p.object.startsWith('legado-studio/media/')&&!p.base64));
  const before=calls;await advanceJob(store,j.id,{voice});assert.equal(calls,before);
});
test('metrics distinguish missing from zero, reject wrong age and never mix windows/platforms',()=>{
  const r=core.validateMetric({topic:'Prueba',platform:'facebook',window:'7d',publishedAt:'2026-08-01T12:00:00Z',measuredAt:'2026-08-08T12:00:00Z',duration:44,views:1000,avgWatch:21,nonFollowers:90,saves:10,shares:12,follows:10,revenue:'',bonus:0});
  assert.equal(r.revenue,null);assert.equal(r.bonus,0);assert.equal(r.format,'corto');
  assert.throws(()=>core.validateMetric({...r,measuredAt:'2026-09-01'}),/ventana/);
  assert.match(core.feedback([r,{...r,platform:'youtube'},{...r,window:'28d'}],{platform:'facebook',format:'corto',window:'7d'}),/Aún no/);
});
test('library metadata has stable IDs, retains favorites and refuses private bucket paths',()=>{
  const a=cleanAsset({kind:'video',description:'Caminar por la calle',favorite:true},'legado-videos/a.mp4');
  const b=cleanAsset({description:'Caminar solo por la calle'},a.object,a);assert.equal(a.id,b.id);assert.equal(b.favorite,true);assert.equal(b.version,2);
  assert.equal(safeObject('refs/secret.json',true),false);assert.equal(safeObject('unify/job.mp4',true),false);assert.equal(safeObject('../x.mp4',true),false);
  assert.equal(core.recipes().length,240);assert.equal(new Set(core.recipes().map(r=>r.id)).size,240);assert.ok(core.recipes().every(r=>r.description.length>100&&r.category));
});
test('text deadline includes authentication and response body; MAX_TOKENS is rejected',async()=>{
  const {generateText}=require('../server/_text'),original=global.fetch;
  global.fetch=async(url,opts)=>{
    if(url.includes('oauth2'))return {ok:true,json:async()=>({access_token:'fake-token'})};
    assert.ok(url.includes('/gemini-3-flash-preview:generateContent'));const cfg=JSON.parse(opts.body).generationConfig;assert.ok(cfg.maxOutputTokens>=16384);assert.equal(cfg.thinkingConfig.thinkingLevel,'LOW');
    return {ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'BLOQUE A\nIncomplete'}]}}]})};
  };
  try{
    await assert.rejects(generateText('test'),/incompleta/);
    global.fetch=async(url,opts)=>({ok:true,json:()=>new Promise((resolve,reject)=>{if(opts.signal.aborted)return reject(opts.signal.reason);opts.signal.addEventListener('abort',()=>reject(opts.signal.reason),{once:true});})});
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(new Error('deadline body')),20);
    await assert.rejects(generateText('test',{signal:controller.signal}),/deadline body/);clearTimeout(timer);
  }finally{global.fetch=original;}
});

test('ordinary scenes can reuse unlabelled sets by meaning, while professor and conflicting sets stay constrained',()=>{
  const a={id:'a',kind:'image',description:'Calcular presupuesto en oficina con calculadora',aspect:'9:16'};
  const episode={modo:'reel',a:'Calcular el presupuesto',c:['[LUGAR: oficina_casa] Calcular presupuesto en oficina con calculadora']};
  const scene=core.scenePlan(episode,10,'9:16')[0];assert.equal(core.selectPlan([scene],[a])[0].assetId,'a');
  assert.equal(core.selectPlan([scene],[{...a,setId:'otro_lugar'}])[0].assetId,'');
  const strict=core.scenePlan({...episode,modo:'profesor'},10,'9:16')[0];assert.equal(core.selectPlan([strict],[a])[0].assetId,'');
});

test('video-only assignment never chooses an image even when it scores better and does not pretend an unmatched clip is missing from storage',()=>{
  const scene={description:'Calcular presupuesto en oficina con calculadora',aspect:'9:16',videoOnly:true};
  const image={id:'image',kind:'image',aspect:'9:16',description:scene.description,favorite:true};
  const video={...image,id:'video',kind:'video',favorite:false};
  assert.equal(core.selectPlan([scene],[image,video])[0].assetId,'video');
  const gap=core.selectPlan([scene],[image])[0];assert.equal(gap.assetId,'');assert.match(gap.reason,/No se encontró un video compatible/);
});

test('job text receives a longer deadline while ordinary calls retain their deadline',async()=>{
  const {generateText}=require('../server/_text');
  const originalFetch=global.fetch,originalTimeout=AbortSignal.timeout,deadlines=[];
  AbortSignal.timeout=ms=>{deadlines.push(ms);return originalTimeout(ms);};
  global.fetch=async(url)=>url.includes('oauth2')?Response.json({access_token:'fake-token'}):Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'Narración completa.'}]}}]});
  try{
    await generateText('test',{timeoutMs:240000,stage:'write-0'});
    await generateText('test');
    assert.ok(deadlines.includes(240000));assert.ok(deadlines.includes(43000));
  }finally{global.fetch=originalFetch;AbortSignal.timeout=originalTimeout;}
});

test('adult-only policy rejects explicit young people and age references without excluding ordinary adult Spanish',()=>{
  for(const text of ['Un niño en la sala','Su hija juega','Una adolescente','Un personaje de 12 años','A child in the room'])assert.equal(core.hasMinors(text),true,text);
  assert.equal(core.hasMinors('Son adultos conversando con su pareja en casa.'),false);
  assert.equal(core.hasMinors({containsMinors:true,description:'Una sala'}),true);
  assert.ok(core.recipes().every(r=>!core.hasMinors(r)));
  assert.equal(core.rankAssets([{id:'kid',kind:'video',description:'Niño caminando en casa',aspect:'9:16'}],{description:'Caminar en casa',aspect:'9:16'}).length,0);
});

test('consecutive video references form one hold, while later reuse remains separate',()=>{
  const {fitTimeline,videoSpeed}=require('../cloudrun/unify/timeline');
  const shots=['a','a','b','a'].map(object=>({object,kind:'video',duration:6}));
  const timeline=fitTimeline(shots,24);
  assert.deepEqual(timeline.map(s=>[s.object,s.start,s.duration]),[['a',0,12],['b',12,6],['a',18,6]]);
  assert.equal(videoSpeed(8,12),1.5);assert.equal(videoSpeed(8,6),1);
  assert.throws(()=>videoSpeed(8,30),/otro plano/);
  assert.deepEqual(core.mergeContinuousShots(shots).map(s=>s.duration),[12,6,6]);
});

test('automatic character: the extraction reply is parsed and validated, secondaries only from [CON:] ids',()=>{
  const bueno=JSON.stringify({protagonista:{nombre:'Marco',fisico:'hombre de 40 años, cabello negro corto, barba recortada, complexión fuerte, mirada seria',vestuario:'camisa oscura'},secundarios:[{id:'companera',nombre:'Lucía',fisico:'mujer de 35 años, cabello castaño largo, rostro amable, complexión media',vestuario:'blusa clara'},{id:'inventado',nombre:'X',fisico:'hombre de 30 años, alto, delgado, pelo corto y gafas redondas',vestuario:'traje'}]});
  const r=core.repartoDesdeTexto(bueno,['companera']);
  assert.equal(r.protagonista.nombre,'Marco');assert.match(r.protagonista.fisico,/barba recortada/);
  assert.deepEqual(r.secundarios.map(s=>s.id),['companera'],'solo entran los ids que el guion marcó con [CON:]');
  assert.equal(core.repartoDesdeTexto(bueno,[]).secundarios.length,0,'sin marcas [CON:] no hay secundarios');
  assert.equal(core.repartoDesdeTexto('no es json',[]),null);
  assert.equal(core.repartoDesdeTexto(JSON.stringify({protagonista:{nombre:'M',fisico:'corto'},secundarios:[]}),[]),null,'un físico vacío o inútil no crea ficha');
  assert.equal(core.repartoDesdeTexto('```json\n'+bueno+'\n```',['companera']).protagonista.nombre,'Marco','tolera vallas de código');
  const prompt=core.promptDeReparto({tema:'Ahorrar',guion:'Un hombre decide...',escenas:['Un hombre en su taller'],conIds:['companera']});
  assert.match(prompt,/define a sus personajes/);assert.match(prompt,/companera/);assert.match(prompt,/25 años o más/);
});

test('latin accent: the writing rule exists once and bans the Spain forms',()=>{
  assert.match(core.LATIN_SPANISH_RULE,/NEUTRO LATINOAMERICANO/);
  assert.match(core.LATIN_SPANISH_RULE,/vosotros/);
  assert.match(core.LATIN_SPANISH_RULE,/ustedes/);
  assert.match(core.LATIN_SPANISH_RULE,/extrañar/);
});

test('latin accent: the audio-only cleanup swaps Spain vocabulary for Latin equivalents',()=>{
  const L=core.limpiarParaAudioLatino;
  assert.equal(L('Enciende el ordenador y revisa tu teléfono móvil.'),'Enciende la computadora y revisa tu teléfono celular.');
  assert.equal(L('Los ordenadores de la oficina y su móvil.'),'Las computadoras de la oficina y su celular.');
  assert.equal(L('Coge el libro y coge fuerzas.'),'Toma el libro y toma fuerzas.');
  assert.equal(L('Aparca junto al aparcamiento.'),'Estaciona junto al estacionamiento.');
  assert.equal(L('Te echo de menos cada día.'),'Te extraño cada día.');
  assert.equal(L('Aprende a echar de menos a tu familia.'),'Aprende a extrañar a tu familia.');
  assert.equal(L('Conducir el auto con calma.'),'Manejar el auto con calma.');
  assert.equal(L('El ordenador llegó ayer.'),'La computadora llegó ayer.');
});

test('latin accent: look-alikes and real meanings are NOT touched',()=>{
  const L=core.limpiarParaAudioLatino;
  assert.equal(L('Esto vale la pena, vale la pena intentarlo.'),'Esto vale la pena, vale la pena intentarlo.','«vale la pena» es el verbo valer, no muletilla');
  assert.equal(L('Eso conduce a un error grave.'),'Eso conduce a un error grave.','conducir = llevar a no se cambia');
  assert.equal(L('La policía encontró el móvil del crimen.'),'La policía encontró el móvil del crimen.','el móvil del crimen es el motivo');
  assert.equal(L('No puedo cogerte el recado.'),'No puedo cogerte el recado.','las formas pegadas no son palabra completa');
  assert.equal(L('Mi tío vive en Bogotá y mi tía en Cali.'),'Mi tío vive en Bogotá y mi tía en Cali.','tío/tía reales no son muletilla');
  assert.equal(L('Tío Juan llegó temprano.'),'Tío Juan llegó temprano.');
  assert.equal(L('Vosotros tenéis que decidir hoy.'),'Vosotros tenéis que decidir hoy.','la limpieza no inventa gramática: vosotros queda intacto');
});

test('latin accent: filler vale and vocative tío come out, sentence stays whole',()=>{
  const L=core.limpiarParaAudioLatino;
  assert.equal(L('Vale, escucha esto con calma.'),'escucha esto con calma.');
  assert.equal(L('Hazlo hoy, vale, sin pensarlo tanto.'),'Hazlo hoy, sin pensarlo tanto.');
  assert.equal(L('Escucha, tío, esto importa de verdad.'),'Escucha, esto importa de verdad.');
  assert.equal(L('Ven aquí, tío.'),'Ven aquí.');
  assert.equal(L('Tío, mira esto una vez más.'),'mira esto una vez más.');
});

test('latin accent: an already-Latin text comes out intact, including coche',()=>{
  const L=core.limpiarParaAudioLatino;
  const ok='Toma tu celular, maneja con calma hasta tu casa y estaciona el coche frente a la puerta. Tu computadora está sobre la mesa y tu familia te extraña.';
  assert.equal(L(ok),ok);
});

test('latin accent: ElevenLabs request cleans the text and forces es except on v4 and the English path',async()=>{
  process.env.ELEVENLABS_API_KEY='test-key';
  const {generateAudioChunk}=require('../server/_voice');
  const seen=[];
  const realFetch=global.fetch;
  global.fetch=async(url,opts)=>{seen.push(JSON.parse(opts.body));return {ok:true,json:async()=>({audio_base64:'AAAA',alignment:null})};};
  try{
    const es=await generateAudioChunk('Vale, coge tu ordenador y escucha.','eleven',{model:'eleven_multilingual_v2'},'es',{});
    assert.equal(es.engine,'eleven');
    assert.equal(seen[0].text,'toma tu computadora y escucha.');
    assert.equal(seen[0].language_code,'es','multilingual v2 lleva language_code es');
    seen.length=0;
    await generateAudioChunk('Coge tu ordenador y escucha.','eleven',{model:'eleven_v3'},'es',{});
    assert.equal(seen[0].language_code,'es','v3 lleva language_code es');
    seen.length=0;
    await generateAudioChunk('Coge tu ordenador y escucha.','eleven',{model:'eleven_v4'},'es',{});
    assert.equal(seen[0].text,'Toma tu computadora y escucha.','v4 también limpia el texto');
    assert.equal(seen[0].language_code,undefined,'v4 NO lleva language_code: no está documentado');
    assert.deepEqual(Object.keys(seen[0].voice_settings).sort(),['similarity_boost','stability'],'v4 mantiene solo sus dos ajustes');
    seen.length=0;
    await generateAudioChunk('Coge tu ordenador y escucha.','eleven',{model:'eleven_multilingual_v2'},'en',{});
    assert.equal(seen[0].text,'Coge tu ordenador y escucha.','el camino en inglés no se limpia ni se fuerza');
    assert.equal(seen[0].language_code,undefined);
  } finally { global.fetch=realFetch; }
});

test('automatic character: the project lock runs once, waits while fresh, retries when stale, never loops on failure',()=>{
  const now=Date.now();
  assert.equal(core.personajeAutoAccion(null,now),'crear');
  assert.equal(core.personajeAutoAccion({estado:'pendiente',en:now},now),'crear');
  assert.equal(core.personajeAutoAccion({estado:'creando',en:now},now),'esperar');
  assert.equal(core.personajeAutoAccion({estado:'creando',en:now-600001},now),'crear','una corrida interrumpida hace más de 10 minutos se puede retomar');
  assert.equal(core.personajeAutoAccion({estado:'fallo',en:now-9999999},now),'nada','el fallo no se reintenta solo en bucle');
  assert.equal(core.personajeAutoAccion({estado:'listo',en:now},now),'nada');
  assert.deepEqual(core.vistasQueFaltan({refs:['a',null,'c']},3),[1]);
  assert.deepEqual(core.vistasQueFaltan({refs:[]},3),[0,1,2]);
  assert.deepEqual(core.vistasQueFaltan({refs:['a','b','c']},3),[]);
});
