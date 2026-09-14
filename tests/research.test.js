const {test}=require('node:test'),assert=require('node:assert/strict');
const base=require('../server/_store');
const research=require('../server/_research');
const brief={format:'Historia con giro',opening:'Un desacuerdo obliga a decidir.',beats:['Aparece una oferta.','El personaje plantea otra salida.','Una respuesta cambia el resultado.'],payoff:'La respuesta cierra el conflicto.',family:'relato',audience:'negocio'};
const response=(value,ground=true)=>({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'Not output'},{text:JSON.stringify(value)}]},...(ground?{groundingMetadata:{groundingChunks:[{web:{uri:'https://www.youtube.com/watch?v=d1K48J72HMY',title:'Public video'}}],searchEntryPoint:{renderedContent:'<div>Google</div>'}}}:{})}]});
test('research requires actual grounding and complete, distinct narrative ideas',()=>{
  const ideas=Array.from({length:5},(_,i)=>({...brief,concept:'Una decisión concreta '+i,t:'negocio',h:'historia',videoUrl:'https://youtu.be/d1K48J72HMY?si=share'}));
  const data=research.parseResearch(response({ideas}));
  assert.equal(data.ideas.length,5);assert.equal(data.ideas[0].videoUrl,'https://www.youtube.com/watch?v=d1K48J72HMY');assert.equal(data.ideas[0].basis,'public_search');
  assert.deepEqual(data.ideas[0].beats,brief.beats);assert.equal(data.sources.length,1);
  assert.throws(()=>research.parseResearch(response({ideas},false)),/fuentes/);
  assert.throws(()=>research.parseResearch(response({ideas:[ideas[0],ideas[0],{}]})),/suficientes/);
  assert.throws(()=>research.parseResearch(response(null)),/suficientes/);
  const truncated=response({ideas});truncated.candidates[0].finishReason='MAX_TOKENS';assert.throws(()=>research.parseResearch(truncated),/incompleta/);
});
test('only canonical public YouTube references can reach the video model',()=>{
  assert.equal(research.youtubeURL('https://www.youtube.com/shorts/d1K48J72HMY'),'https://www.youtube.com/watch?v=d1K48J72HMY');
  for(const url of ['http://youtu.be/d1K48J72HMY','https://youtube.com.evil.test/watch?v=d1K48J72HMY','https://a:b@youtube.com/watch?v=d1K48J72HMY','https://www.youtube.com/@channel','file:///secret','https://127.0.0.1/video.mp4','https://www.youtube.com:8080/watch?v=d1K48J72HMY'])assert.equal(research.youtubeURL(url),'');
});
test('a video analysis needs distinct observed moments inside the inspected fragment',()=>{
  const value={...brief,visualRhythm:'Alterna interlocutores con un detalle del objeto.',observations:[{second:0,detail:'Se presenta una oferta.'},{second:12,detail:'El interlocutor hace una pausa.'},{second:24,detail:'Una respuesta resuelve la oferta.'}]};
  const a=research.parseAnalysis(response(value,false));assert.equal(a.basis,'video');assert.equal(a.maxSeconds,180);
  for(const observations of [[null],value.observations.map(o=>({...o,second:0})),value.observations.map(o=>({...o,second:181}))])assert.throws(()=>research.parseAnalysis(response({...value,observations},false)),/leer el video/);
  assert.throws(()=>research.parseAnalysis(response({unavailable:true},false)),/leer el video/);
});
test('analysis is authenticated, saved once, reused and sends the video itself with bounded sampling',async t=>{
  const saved=new Map(),calls=[];
  t.mock.method(base,'makeStore',()=>({read:async key=>saved.has(key)?{data:saved.get(key)}:null,put:async(key,data)=>saved.set(key,data)}));
  t.mock.method(base,'token',async()=> 'test-token');
  t.mock.method(global,'fetch',async(url,init)=>{calls.push({url,init,body:JSON.parse(init.body)});return new Response(JSON.stringify(response({...brief,visualRhythm:'Cambios con cada interlocutor.',observations:[{second:0,detail:'Una pregunta.'},{second:8,detail:'Una objeción.'},{second:20,detail:'Una decisión.'}]},false)),{status:200});});
  process.env.APP_KEY='research-test-key';process.env.GCP_PROJECT_ID='test-project';
  delete require.cache[require.resolve('../server/trends')];const handler=require('../server/trends');
  async function req(videoUrl,authorized=true){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this;},json(d){this.body=d;return this;},end(){}};await handler({method:'POST',headers:authorized?{'x-app-key':'research-test-key'}:{},body:{action:'analyze',videoUrl}},res);return res;}
  assert.equal((await req('https://youtu.be/d1K48J72HMY',false)).statusCode,401);assert.equal(calls.length,0);
  assert.equal((await req('https://127.0.0.1/video.mp4')).statusCode,400);assert.equal(calls.length,0);
  let r=await req('https://youtu.be/d1K48J72HMY');assert.equal(r.statusCode,200);assert.equal(r.body.reused,false);
  r=await req('https://www.youtube.com/watch?v=d1K48J72HMY');assert.equal(r.body.reused,true);assert.equal(calls.length,1);
  assert.equal(calls[0].body.contents[0].parts[0].fileData.fileUri,'https://www.youtube.com/watch?v=d1K48J72HMY');
  assert.equal(calls[0].body.contents[0].parts[0].videoMetadata.endOffset,'180s');assert.ok(calls[0].init.signal);assert.equal(saved.size,1);
});

test('search automatically retrieves evidence separately when the creative answer omits sources',async()=>{
 const ideas=Array.from({length:5},(_,i)=>({...brief,concept:'Decisión '+i})),calls=[];
 const evidence=response({report:'Video público con una decisión observable.'});
 const result=await research.searchWithRecovery({mode:'reel',seconds:60},async(parts,search)=>{calls.push({parts,search});return calls.length===1?response({ideas},false):calls.length===2?evidence:response({ideas},false);});
 assert.deepEqual(calls.map(c=>c.search),[true,true,false]);assert.equal(result.ideas.length,5);assert.equal(result.sources[0].uri,evidence.candidates[0].groundingMetadata.groundingChunks[0].web.uri);assert.match(calls[2].parts[0].text,/INFORME DE BÚSQUEDA/);
});
test('search uses one call when grounded and stops after two ungrounded attempts',async()=>{
 const ideas=Array.from({length:5},(_,i)=>({...brief,concept:'Decisión '+i}));let calls=0;
 await research.searchWithRecovery({},async()=>{calls++;return response({ideas});});assert.equal(calls,1);calls=0;
 await assert.rejects(research.searchWithRecovery({},async()=>{calls++;return response({ideas},false);}),/segundo intento/);assert.equal(calls,2);
});
