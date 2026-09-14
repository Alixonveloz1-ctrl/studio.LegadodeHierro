const {test}=require('node:test'),assert=require('node:assert/strict');
const base=require('../server/_store');base.token=async()=> 'fixture-only';
process.env.GCP_PROJECT_ID='fixture-project';
const lib=require('../server/_library'),models=require('../server/_library-model'),assets=require('../server/_assets');
class Store{
  constructor(){this.bucket='current-bucket';this.files=new Map();this.remote=new Map();this.seq=0;this.failState=false;this.rewrites=[];}
  add(name,metadata={},remote=false){const row={name,size:'512',generation:String(++this.seq),crc32c:'test-crc',contentType:models.mimeFor({name}),metadata};(remote?this.remote:this.files).set(name,{info:row});return row;}
  async read(path){const r=this.files.get(path);return r?.data?{data:structuredClone(r.data),generation:r.info.generation}:null;}
  async put(path,data,g,catalog){const old=this.files.get(path);if(g!==undefined&&String(g)!==String(old?.info.generation||0))throw base.failure('conflict',412);
    if(path===lib.ACTIVE&&this.failState&&['ready','done'].includes(data.status)){this.failState=false;throw new Error('lost state response');}
    const generation=String(++this.seq);this.files.set(path,{data:structuredClone(data),info:{name:path,generation,size:'500',metadata:catalog?{record:JSON.stringify(data)}:{}}});return {generation};}
  async info(path){return structuredClone(this.files.get(path)?.info||null);}
  async bytes(path,bytes,mime){if(this.files.has(path))throw base.failure('exists',412);const row=this.add(path);row.size=String(bytes.length);row.contentType=mime;return row;}
  async list(prefix){return {items:[...this.files.values()].map(r=>r.info).filter(i=>i.name.startsWith(prefix))};}
  async sourceList(bucket,prefix,cursor,size){const all=[...(bucket===this.bucket?this.files:this.remote).values()].map(r=>r.info).filter(i=>i.name.startsWith(prefix)).sort((a,b)=>a.name.localeCompare(b.name));const remaining=all.filter(i=>!cursor||i.name.localeCompare(cursor)>0),n=Math.min(2,size),page=remaining.slice(0,n);return {items:structuredClone(page),nextPageToken:remaining.length>n?page.at(-1).name:''};}
  async sourceInfo(bucket,name){return structuredClone((bucket===this.bucket?this.files:this.remote).get(name)?.info||null);}
  async sourceJSON(bucket,name){return structuredClone(this.remote.get(name)?.data||null);}
  async rewriteFrom(source,object,rewriteToken){this.rewrites.push({source,object,rewriteToken});const row=this.remote.get(source.object);assert.equal(row.info.generation,source.generation);if(!rewriteToken)return {done:false,rewriteToken:'copy-next'};this.files.set(object,{info:{...structuredClone(row.info),name:object,generation:String(++this.seq)}});return {done:true};}
}
const description='Un hombre calcula su presupuesto con una calculadora en la mesa de su oficina.';
const analysis=info=>({title:'Calcular el presupuesto',description,tags:['calcular','oficina','manos'],action:'calcular',location:'oficina',mood:'calma',shot:'detalle',aspect:'9:16',kind:/\.mp4$/.test(info.name)?'video':'image',catalogSource:'gemini',analysis:{version:models.VERSION,generation:info.generation,model:models.MODEL,at:'2026-09-13'}});
async function finish(store,job,deps){for(let i=0;i<100&&job.status!=='done';i++)job=await lib.advance(store,job.id,deps);assert.equal(job.status,'done');return job;}
test('catalog scans every page and analyzes media itself, preserves corrections and never repeats an unchanged analysis',async()=>{
  const s=new Store();for(const name of ['legado-videos/sample_0.mp4','legado-studio/media/p.png','refs/private.png','unify/final.mp4','legado-studio/media/audio-task.wav'])s.add(name);
  let calls=0;const deps={analyze:async(st,info)=>{calls++;return analysis(info);}};
  let j=await lib.start(s,{type:'catalog'},'catalog-request-001');j=await finish(s,j,deps);assert.equal(calls,2);assert.equal(j.completed,2);
  const a=(await s.read(assets.PREFIX+assets.idFor('legado-videos/sample_0.mp4')+'.json')).data;assert.equal(a.title,'Calcular el presupuesto');assert.equal(a.kind,'video');
  await assets.register(s,{title:'Mi título corregido',description:'Mi descripción de la acción en la oficina.',catalogSource:'manual'},a.object,true);
  j=await lib.start(s,{type:'catalog'},'catalog-request-002');j=await finish(s,j,deps);assert.equal(calls,2);assert.equal(j.skipped,2);
  const old=s.files.get(a.object).info;old.generation='changed-generation';j=await lib.start(s,{type:'catalog'},'catalog-request-003');await finish(s,j,deps);assert.equal(calls,3);
  assert.equal((await s.read(assets.PREFIX+a.id+'.json')).data.title,'Mi título corregido');
});
test('two tabs share one paid analysis and checkpoints survive a lost final state response',async()=>{
  const s=new Store(),info=s.add('legado-videos/a.mp4');let calls=0,release;const waiting=new Promise(r=>{release=r;});
  const deps={analyze:async()=>{calls++;await waiting;return analysis(info);}};
  let j=await lib.start(s,{type:'catalog',objects:[info.name]},'catalog-concurrent-001');
  const first=lib.advance(s,j.id,deps);await new Promise(r=>setImmediate(r));assert.equal((await lib.advance(s,j.id,deps)).busy,true);
  release();s.failState=true;await assert.rejects(first,/lost state/);j=await lib.advance(s,j.id,deps);assert.equal(j.status,'done');assert.equal(calls,1);
});
test('a generated image saved before interruption is described on resume without regenerating or sharing the provider deadline',async()=>{
  const s=new Store();let generated=0,analyzed=0;
  const deps={generate:async(st,r,c,object)=>{generated++;await st.bytes(object,Buffer.alloc(200),'image/png');return {title:r.title,description:r.description,recipeId:r.id,aspect:c.aspect,kind:'image',character:'insignia'};},analyze:async(st,info)=>{analyzed++;return analysis(info);}};
  let j=await lib.start(s,{type:'generate',recipeIds:['receta-0-2','receta-1-2'],model:'gemini-3.1-flash-image',aspect:'9:16'},'generation-request-001');
  s.failState=true;await assert.rejects(lib.advance(s,j.id,deps),/lost state/);assert.equal(generated,1);assert.equal(analyzed,0);
  j=await finish(s,j,deps);assert.equal(generated,2);assert.equal(analyzed,2);
  const a=(await s.read(assets.PREFIX+assets.idFor(lib.imageObject('receta-0-2','9:16'))+'.json')).data;assert.equal(a.recipeId,'receta-0-2');assert.equal(a.character,'insignia');
  j=await lib.start(s,{type:'generate',recipeIds:['receta-0-2'],model:'gemini-3.1-flash-image',aspect:'9:16'},'generation-request-002');await finish(s,j,deps);assert.equal(generated,2);assert.equal(analyzed,2);
});
test('generation exposes the fixed selection and saved settings through progress and stop, including every existing image format',async()=>{
  const html=require('fs').readFileSync(require('path').join(__dirname,'../public/index.html'),'utf8');
  const options=id=>[...html.match(new RegExp('id="'+id+'"[\\s\\S]*?</select>'))[0].matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]);
  for(const model of options('selImgModel'))for(const aspect of options('selImgFmt')){
    const s=new Store(),ids=['receta-0-2','receta-0-0'];
    let j=await lib.start(s,{type:'generate',recipeIds:ids,model,aspect},'settings-request-001');assert.deepEqual(j.settings,{model,aspect});assert.deepEqual(j.recipeIds,ids);
    j=await lib.advance(s,j.id,{generate:async(st,r,c,object)=>{assert.equal(c.model,model);assert.equal(c.aspect,aspect);await st.bytes(object,Buffer.alloc(200),'image/png');return {...r,recipeId:r.id,kind:'image',aspect:c.aspect};}});
    assert.equal(j.lastAsset.recipeId,ids[0]);assert.deepEqual(j.recipeIds,ids);assert.deepEqual(j.pendingRecipeIds,ids);
    j=await lib.advance(s,j.id,{analyze:async(st,info)=>analysis(info)});assert.deepEqual(j.recipeIds,ids);assert.deepEqual(j.pendingRecipeIds,[ids[1]]);assert.equal(j.recipeResults[ids[0]],'ready');
    j=await lib.stop(s,j.id);assert.equal(j.stopped,true);assert.deepEqual(j.recipeIds,ids);assert.equal(j.recipeResults[ids[1]],undefined);assert.deepEqual(j.settings,{model,aspect});
    assert.ok(await s.info(lib.imageObject(ids[0],aspect)),'stopping keeps the generated file');
  }
});
test('cross-bucket copies resume by rewrite token, preserve metadata and copy each object generation only once',async()=>{
  const s=new Store();const info=s.add('coleccion/toma.mp4',{titulo:'Título original',descripcion:'Una descripción completa que ya existía en mi otra biblioteca.',etiquetas:'taller,trabajar',aspectRatio:'9:16',customField:'conservar'},true);
  let analyzed=0;const deps={analyze:async()=>{analyzed++;throw new Error('Metadata is already complete');}};
  let j=await lib.start(s,{type:'import',source:'gs://other-bucket/coleccion'},'import-request-001');j=await finish(s,j,deps);assert.equal(analyzed,0);assert.equal(s.rewrites.length,2);assert.equal(s.rewrites[1].rewriteToken,'copy-next');
  const a=j.lastAsset;assert.equal(a.title,'Título original');assert.match(a.description,/ya existía/);assert.deepEqual(a.tags,['taller','trabajar']);assert.equal(a.importedFrom.bucket,'other-bucket');assert.equal((await s.info(a.object)).metadata.customField,'conservar');assert.equal(s.remote.get(info.name).info.generation,info.generation);
  j=await lib.start(s,{type:'import',source:'other-bucket/coleccion/'},'import-request-002');j=await finish(s,j,deps);assert.equal(s.rewrites.length,2);assert.equal(j.skipped,1);
});
test('sidecar metadata is imported and Gemini fills only missing fields without replacing existing titles',async()=>{
  const s=new Store();s.add('a.png',{},true);s.remote.set('a.json',{data:{title:'Nombre que quiero conservar',description:'Mi descripción ya guardada.',tags:['original']},info:{name:'a.json',generation:'3'}});
  let calls=0;const deps={analyze:async(st,info)=>{calls++;return analysis(info);}};
  let j=await lib.start(s,{type:'import',source:'other-bucket'},'sidecar-import-001');j=await finish(s,j,deps);assert.equal(calls,1);assert.equal(j.lastAsset.title,'Nombre que quiero conservar');assert.equal(j.lastAsset.description,'Mi descripción ya guardada.');assert.deepEqual(j.lastAsset.tags,['original']);assert.equal(j.lastAsset.aspect,'9:16');
});
test('unreadable files do not prevent later files from being cataloged; provider quota errors pause the batch',async()=>{
  const s=new Store();s.add('legado-videos/bad.mp4');s.add('legado-videos/good.mp4');
  let j=await lib.start(s,{type:'catalog',objects:['legado-videos/bad.mp4','legado-videos/good.mp4']},'bad-file-request-001');
  j=await finish(s,j,{analyze:async(st,info)=>{if(info.name.includes('bad'))throw base.failure('Unreadable file',422);return analysis(info);}});assert.equal(j.completed,1);assert.equal(j.failed,1);assert.match(j.stage,/no se pudieron/);
  j=await lib.start(s,{type:'catalog',objects:['legado-videos/bad.mp4']},'bad-file-request-002');await assert.rejects(lib.advance(s,j.id,{analyze:async()=>{throw base.failure('quota',429);}}),/quota/);assert.equal((await s.read(lib.ACTIVE)).data.status,'paused');
});
test('validation rejects credentials/paths, preserves active batches and model output cannot select storage paths',async()=>{
  for(const source of ['https://bad.example/bucket','gs://bucket/../../secret','gs://bucket/path?token=123'])assert.throws(()=>lib.sourceConfig(source));
  assert.equal(lib.eligible({name:'refs/a.png'},true),false);assert.equal(lib.eligible({name:'unify/final.mp4'},true),false);
  const d=models.parseCatalog([{text:JSON.stringify({...analysis({name:'a.mp4',generation:'1'}),object:'refs/secret',archived:true,character:'invented'})}],'video');assert.equal(d.object,undefined);assert.equal(d.archived,undefined);assert.equal(d.character,undefined);
  const s=new Store();const first=await lib.start(s,{type:'catalog'},'active-request-001'),second=await lib.start(s,{type:'catalog'},'active-request-002');assert.equal(first.id,second.id);assert.equal(second.existing,true);assert.equal((await lib.start(s,{type:'catalog'},'active-request-001')).existing,false);
});
test('Gemini receives the actual GCS video with complete playback, not a filename-only prompt',async()=>{
  const original=global.fetch;let request;
  global.fetch=async(url,o)=>{request={url,body:JSON.parse(o.body)};return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(analysis({name:'a.mp4',generation:'3'}))}]}}]})};};
  try{const d=await models.analyze({bucket:'current-bucket'},{name:'legado-videos/sample_0.mp4',generation:'3'});const parts=request.body.contents[0].parts;assert.equal(parts[0].fileData.fileUri,'gs://current-bucket/legado-videos/sample_0.mp4');assert.equal(parts[0].fileData.mimeType,'video/mp4');assert.equal(parts[0].videoMetadata.fps,1);assert.equal(parts[0].videoMetadata.endOffset,undefined);assert.match(request.url,/gemini-3.1-flash-lite/);assert.equal(d.analysis.generation,'3');}finally{global.fetch=original;}
});
test('library image generation sends character and setting references and saves directly to its stable object',async()=>{
  const s=new Store();s.add('refs/personaje-1');s.add('refs/personaje-2');const anchor='legado-studio/media/anchor.png';s.add(anchor);
  const original=global.fetch;let body;
  global.fetch=async(url,o)=>{body=JSON.parse(o.body);return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{inlineData:{mimeType:'image/png',data:Buffer.alloc(200).toString('base64')}}]}}]})};};
  try{const recipe=require('../public/studio-core').recipes()[0],object=lib.imageObject(recipe.id,'9:16');const d=await models.generate(s,recipe,{model:'gemini-3.1-flash-image',aspect:'9:16',anchorObject:anchor},object);
    const parts=body.contents[0].parts;assert.match(parts[0].text,/Cinematic American 2D/);assert.ok(parts.some(p=>p.fileData?.fileUri==='gs://current-bucket/refs/personaje-1'));assert.equal(parts.at(-1).fileData.fileUri,'gs://current-bucket/'+anchor);assert.equal(body.generationConfig.imageConfig.aspectRatio,'9:16');assert.equal(d.recipeId,recipe.id);assert.ok(await s.info(object));
  }finally{global.fetch=original;}
});
test('Storage copies are server-to-server, generation-pinned, resumable and retain the original metadata by default',async()=>{
  const {privateKey}=require('crypto').generateKeyPairSync('rsa',{modulusLength:2048});
  process.env.GCP_SERVICE_ACCOUNT=JSON.stringify({client_email:'fixture@example.test',private_key:privateKey.export({format:'pem',type:'pkcs8'})});process.env.GCS_OUTPUT_BUCKET='current-bucket';
  const original=global.fetch,calls=[];
  global.fetch=async(url,o)=>{calls.push({url,o});return new Response(JSON.stringify(url.includes('oauth2')?{access_token:'fixture-only'}:{done:true}),{status:200});};
  try{const s=base.makeStore();await s.rewriteFrom({bucket:'source-bucket',object:'carpeta/a b.mp4',generation:'17'},'legado-studio/media/copy.mp4','checkpoint-token');
    const call=calls.find(c=>c.url.includes('rewriteTo')),url=new URL(call.url);assert.equal(call.o.method,'POST');assert.match(url.pathname,/source-bucket\/o\/carpeta%2Fa%20b.mp4\/rewriteTo\/b\/current-bucket/);assert.equal(url.searchParams.get('ifGenerationMatch'),'0');assert.equal(url.searchParams.get('ifSourceGenerationMatch'),'17');assert.equal(url.searchParams.get('rewriteToken'),'checkpoint-token');assert.equal(call.o.body,undefined,'omitting replacement metadata retains the source metadata');assert.ok(!calls.some(c=>c.o.method==='DELETE'));
  }finally{global.fetch=original;}
});

test('Storage waits after a rejected write and retries only that same conditional request',async()=>{
  const {privateKey}=require('crypto').generateKeyPairSync('rsa',{modulusLength:2048});
  process.env.GCP_SERVICE_ACCOUNT=JSON.stringify({client_email:'rate-test@example.test',private_key:privateKey.export({format:'pem',type:'pkcs8'})});process.env.GCS_OUTPUT_BUCKET='current-bucket';
  const original=global.fetch,calls=[];let mode='retry';
  global.fetch=async(url,o)=>{
    if(url.includes('oauth2'))return new Response(JSON.stringify({access_token:'fixture-only'}));
    calls.push({url,body:o.body,at:Date.now()});
    return new Response(JSON.stringify({generation:'2'}),{status:mode==='conflict'?412:calls.length===1?429:200});
  };
  try{
    const s=base.makeStore();await s.put('legado-studio/library/active.json',{completed:25},'1');
    assert.equal(calls.length,2);assert.equal(calls[0].url,calls[1].url);assert.equal(calls[0].body,calls[1].body);assert.ok(calls[1].at-calls[0].at>=1100);
    assert.match(calls[1].url,/ifGenerationMatch=1/);
    mode='conflict';await assert.rejects(s.put('other.json',{},'old'),e=>e.status===412);assert.equal(calls.length,3,'a stale conditional write is never retried');
  }finally{global.fetch=original;}
});

test('Storage paces a new function instance using the last modification of the progress object',async()=>{
  const original=global.fetch,start=Date.now();let wroteAt;
  global.fetch=async(url)=>{
    if(url.includes('oauth2'))return new Response(JSON.stringify({access_token:'fixture-only'}));
    if(url.includes('/upload/')){wroteAt=Date.now();return new Response(JSON.stringify({generation:'2'}));}
    return new Response(JSON.stringify(url.includes('alt=media')?{completed:25}:{generation:'1',updated:new Date(start).toISOString()}));
  };
  try{const s=base.makeStore();await s.read('progress.json');await s.put('progress.json',{completed:26},'1');assert.ok(wroteAt-start>=1100);}finally{global.fetch=original;}
});

test('automatic organization discovers only channel folders before processing and keeps its total fixed',async()=>{
  const s=new Store();for(const name of ['legado-videos/a.mp4','legado-videos/b.mp4','legado-videos/c.mp4','legado-studio/media/a.png','otro-proyecto/a.png','musica/shared.mp3'])s.add(name);
  const prefixes=[],orig=s.sourceList.bind(s);s.sourceList=async(...args)=>{prefixes.push(args[1]);return orig(...args);};
  let j=await lib.start(s,{type:'catalog'},'scope-request-001'),calls=0;
  const deps={analyze:async(st,info)=>{calls++;assert.equal(j.discovering,false);assert.equal(j.total,4);return analysis(info);}};
  while(j.discovering){j=await lib.advance(s,j.id,deps);assert.equal(calls,0);}
  while(j.status!=='done'){j=await lib.advance(s,j.id,deps);assert.equal(j.total,4);}
  assert.equal(calls,4);assert.deepEqual([...new Set(prefixes)],['legado-videos/','legado-studio/media/']);
});
test('resuming a legacy bucket-wide scan drops foreign queue entries without deleting files or saved records',async()=>{
  const s=new Store(),foreign=s.add('other-project/a.png');s.add('legado-videos/good.mp4');
  const foreignAsset=await assets.register(s,analysis(foreign),foreign.name,true);
  let j=await lib.start(s,{type:'catalog'},'scope-request-002');const row=await s.read(lib.ACTIVE);
  delete row.data.scopeVersion;row.data.queue=[foreign];row.data.cursor='old-page';row.data.total=300;
  await s.put(lib.ACTIVE,row.data,row.generation);
  j=await finish(s,j,{analyze:async(st,info)=>{assert.equal(info.name,'legado-videos/good.mp4');return analysis(info);}});
  assert.equal(j.total,1);assert.ok(await s.info(foreign.name));assert.ok(await s.read(assets.PREFIX+foreignAsset.id+'.json'));
  const listed=await assets.listAssets(s);assert.equal(listed.items.length,1);assert.equal(listed.items[0].object,'legado-videos/good.mp4');
});
