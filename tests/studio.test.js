const {test} = require('node:test');
const assert = require('node:assert/strict');
const {generateKeyPairSync} = require('node:crypto');
const core = require('../public/studio-core');
const {fitTimeline} = require('../cloudrun/unify/timeline');
const {createJob,advanceJob,BASE} = require('../api/_jobs');
const {cleanAsset,safeObject} = require('../api/_assets');

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
  assert.equal(core.recipes().length,96);
});
test('text deadline includes authentication and response body; MAX_TOKENS is rejected',async()=>{
  const {generateText}=require('../api/_text'),original=global.fetch;
  global.fetch=async(url,opts)=>{
    if(url.includes('oauth2'))return {ok:true,json:async()=>({access_token:'fake-token'})};
    return {ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'BLOQUE A\nIncomplete'}]}}]})};
  };
  try{
    await assert.rejects(generateText('test'),/incompleta/);
    global.fetch=async(url,opts)=>({ok:true,json:()=>new Promise((resolve,reject)=>{if(opts.signal.aborted)return reject(opts.signal.reason);opts.signal.addEventListener('abort',()=>reject(opts.signal.reason),{once:true});})});
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(new Error('deadline body')),20);
    await assert.rejects(generateText('test',{signal:controller.signal}),/deadline body/);clearTimeout(timer);
  }finally{global.fetch=original;}
});
