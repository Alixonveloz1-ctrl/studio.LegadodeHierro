// Offline DOM integration: actual HTML and all three application scripts.
// No browser process, external network, cloud writes or paid generations.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function ready(check){for(let i=0;i<30;i++){await tick();if(check())return;}throw new Error('UI operation did not settle');}
async function app(initialStorage={}){
  const errors=[],calls=[],projects=new Map(),assets=[];
  const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/Not implemented.*(?:HTMLMediaElement|navigation)/i.test(e.message))errors.push(e.message);});
  const dom=new JSDOM(fs.readFileSync(path.join(root,'public/index.html'),'utf8'),{url:'https://studio.example.test',runScripts:'outside-only',virtualConsole:vc});
  const w=dom.window;
  Object.entries(initialStorage).forEach(([k,v])=>w.localStorage.setItem(k,v));
  w.Headers=Headers;w.AbortSignal=AbortSignal;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLMediaElement.prototype.pause=()=>{};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.confirm=()=>true;w.alert=m=>errors.push(m);w.URL.createObjectURL=()=> 'blob:fixture';w.URL.revokeObjectURL=()=>{};
  w.fetch=async(input,init={})=>{
    const b=JSON.parse(init.body||'{}');calls.push({input,b});
    let d={};
    if(input==='/api/studio'){
      if(b.action==='project-save'){const prior=projects.get(b.id)||{};assert.ok(!b.version||b.version===prior.version);d={version:(prior.version||0)+1};projects.set(b.id,{...prior,...b.project,version:d.version});}
      else if(b.action==='project-get')d={project:projects.get(b.id)};
      else if(b.action==='projects')d={items:[...projects].map(([id,p])=>({id,topic:p.topic,updatedAt:'2026-09-13'}))};
      else if(b.action==='assets')d={items:assets};
      else if(b.action==='links')d={items:b.ids.map(id=>({...assets.find(a=>a.id===id),url:'https://media.example.test/'+id}))};
      else if(b.action==='asset-save'){const prior=assets.find(a=>a.object===b.object)||{};const asset={...prior,...b.asset,id:prior.id||String(assets.length+1).padStart(32,'0'),object:b.object,version:(prior.version||0)+1};if(prior.id)assets.splice(assets.indexOf(prior),1);assets.push(asset);d={asset};}
      else if(b.action==='discover')d={items:Array.from({length:20},(_,i)=>({object:'legado-videos/old'+i+'.mp4',kind:'video',title:'Clip '+i,url:'https://media.example.test/old'+i}))};
      else d={items:[]};
    }else if(input==='/api/music')d={tracks:[]};
    else if(input==='/api/generate')d={text:'CAPTION:\nUn paso concreto.\nHASHTAGS:\n#Disciplina\nYOUTUBE:\nUn paso concreto'};
    else if(input==='/api/unify-status')d={done:true,videoUrl:'https://media.example.test/final.mp4',duracion:480,avisos:[]};
    else d={refs:[],personajes:[]};
    return new Response(JSON.stringify(d),{status:200,headers:{'Content-Type':'application/json'}});
  };
  for(const name of ['studio-core.js','app.js','studio.js'])w.eval(fs.readFileSync(path.join(root,'public',name),'utf8'));
  await tick();
  return {w,errors,calls,projects,assets,close:()=>dom.window.close()};
}
function episode(w,id='project-001'){
  return {uid:id,topic:'Empezar con una prueba',a:'Imagina que hoy decides ofrecer un servicio pequeño. Habla con una persona y escucha qué problema necesita resolver antes de gastar.',f:'',c:Array(10).fill('Calcular presupuesto en oficina con calculadora'),modo:'relato',tO:w.THEMES[0],dO:w.DURS_LARGAS[1],hO:w.HOOKS[0],editorial:{family:'metodo',platform:'facebook',audience:'constructor'},caption:'Texto guardado',tags:'#Disciplina'};
}

test('cloud project opens with captions, stable ID, saved scene plan and recoverable final render',async()=>{
  const a=await app();try{
    const {w,projects,calls,errors}=a,p=episode(w);p.renders={es:{jobId:'job-111111111111111111111111'}};projects.set(p.uid,p);
    await w.studioOpenProjects();w.document.querySelector('#projectList button').click();await ready(()=>!w.STUDIO.busy);
    assert.equal(w.lastRes.uid,p.uid);assert.equal(w.lastCaption,'Texto guardado');assert.equal(w.document.querySelector('#scriptEdit').value,p.a);
    assert.equal(calls.filter(c=>c.input==='/api/generate').length,0,'restoring captions must not regenerate paid text');
    w.document.querySelector('#resumeRender').click();await ready(()=>!w.STUDIO.busy);
    assert.equal(w.FINALES.es.jobId,p.renders.es.jobId);assert.equal(w.document.querySelector('#unifyRes video').src,'https://media.example.test/final.mp4');
    w.saveHistory(w.lastRes);w.saveHistory(w.lastRes);await w.STUDIO.saveQueue;
    assert.equal(w.getHistory().length,1,'stable project IDs upsert history');assert.equal(w.getHistory()[0].editorial.family,'metodo');assert.deepEqual(errors,[]);
  }finally{a.close();}
});

test('library creates a complete mixed-source plan without paid media and keeps optional edits collapsed on mobile',async()=>{
  const a=await app();try{
    const {w,assets,calls,errors}=a;w.lastRes=episode(w);assets.push(...['image','video'].map((kind,i)=>({id:String(i+1).padStart(32,'0'),kind,object:'legado-studio/media/'+i,aspect:'9:16',description:'Calcular presupuesto en oficina con calculadora',title:'Calcular '+i})));
    await w.studioLoadLibrary();w.document.querySelector('#buildScenePlan').click();await ready(()=>!w.STUDIO.busy);
    assert.equal(w.STUDIO.plan.length,30);assert.ok(w.STUDIO.plan.every(p=>p.assetId));assert.notEqual(w.STUDIO.plan[0].assetId,w.STUDIO.plan[1].assetId);
    assert.equal(w.document.querySelectorAll('#scenePlan .studio-shot').length,30);assert.equal(calls.filter(c=>c.input==='/api/image'||c.input==='/api/video-start').length,0);
    assert.equal(w.document.querySelectorAll('#libraryGrid .studio-media-tile').length,2);
    assert.equal(w.document.querySelectorAll('#libraryGrid input, #libraryGrid textarea, #libraryGrid details').length,0);
    w.document.querySelector('#libraryGrid button').click();await ready(()=>w.document.querySelector('#libraryViewerContent .studio-asset'));
    assert.equal(w.document.querySelector('#libraryViewer').open,true);assert.equal(w.document.querySelector('#libraryViewer details').open,false);
    const edit=w.document.querySelector('#libraryViewer input');edit.value='Nombre corregido';w.document.querySelector('#libraryViewer details button').click();await ready(()=>w.document.querySelector('#libraryGrid').textContent.includes('Nombre corregido'));
    w.document.querySelector('#libraryViewerClose').click();assert.equal(w.document.querySelector('#libraryViewer').open,false);
    assert.equal(w.document.querySelector('#libraryUploadDescription'),null);assert.equal(w.document.querySelector('#recipeSelect'),null);
    assert.deepEqual(errors,[]);
  }finally{a.close();}
});

test('editing a script invalidates old narration, captions, plan and final output while preserving source assets',async()=>{
  const a=await app();try{
    const {w,projects}=a;w.lastRes=episode(w);w.lastRes.renders={es:{jobId:'old'}};w.imgs=[{src:'https://media.example.test/a',object:'legado-studio/media/a',assetId:'1'.repeat(32)}];w.audES={url:'blob:old'};w.FINALES.es={url:'blob:old'};w.finalVid=w.FINALES.es;w.STUDIO.plan=[{assetId:'old'}];
    w.document.querySelector('#scriptEdit').value='Otra decisión concreta cambia la historia y sus consecuencias. Este es el guion revisado con una promesa diferente.';
    await w.studioEditScript();await w.STUDIO.saveQueue;
    assert.equal(w.audES,null);assert.equal(w.finalVid,null);assert.equal(w.FINALES.es,null);assert.equal(w.lastCaption,'');assert.equal(w.STUDIO.plan.length,0);assert.equal(w.imgs.length,1);
    assert.deepEqual(JSON.parse(JSON.stringify(projects.get('project-001').renders)),{});assert.equal(w.document.querySelector('#unifyRes').style.display,'none');
  }finally{a.close();}
});

test('English generation preserves the current images and respects a project change during the response',async()=>{
  const a=await app();try{
    const {w}=a,p=episode(w);w.lastRes=p;w.activeTab='f';w.imgs=[{src:'https://media.example.test/kept'}];w.rfTabs(p);
    w.studioEnglish=async()=> 'One useful step to test your idea.';
    w.document.querySelector('#tabcontent button').click();await ready(()=>!w.STUDIO.busy);
    assert.equal(w.imgs.length,1);assert.match(w.document.querySelector('#tabcontent').textContent,/One useful step/);
    p.f='';w.rfTabs(p);let release;w.studioEnglish=()=>new Promise(r=>{release=r;});w.document.querySelector('#tabcontent button').click();await tick();
    const other=episode(w,'project-002');w.lastRes=other;release('English text for the first project only.');await ready(()=>!w.STUDIO.busy);
    assert.equal(w.lastRes.uid,'project-002');assert.equal(w.lastRes.f,'');
  }finally{a.close();}
});

test('new voice settings create a new configuration; recover explicitly reuses the saved one',async()=>{
  const a=await app();try{
    const {w}=a;w.lastRes=episode(w);const configs=[];w.VOX.engine='gemini';w.VOX.gemini={voz:'Charon',speed:1};
    w.STUDIO.audioJobs.es={type:'audio',text:w.lastRes.a,engine:'gemini',voice:{voz:'Puck',speed:1},lang:'es'};
    w.studioRunJob=async config=>{configs.push(JSON.parse(JSON.stringify(config)));return {parts:[]};};
    w.studioReadAudio=async()=>({dur:30,url:'blob:audio',audioObjects:['legado-studio/media/a.wav'],blob:new w.Blob(['test'])});
    await w.studioAudio('es');assert.equal(configs[0].voice.voz,'Charon');w.VOX.gemini.voz='Fenrir';
    await w.studioRecoverAudio('es');assert.equal(configs[1].voice.voz,'Charon');
  }finally{a.close();}
});

test('a batch episode uses its own duration and topic in the resumable editorial job, including short reels',async()=>{
  const a=await app();try{
    const {w}=a;w.document.querySelector('#conc').value='Tema distinto que quedó en el formulario';
    assert.equal(w.document.querySelector('#editorialFamily'),null);
    assert.equal(w.document.querySelector('#metricForm'),null);
    assert.equal(w.document.querySelector('#cloudInfoPanel'),null);
    w.localStorage.setItem('editorialFamily','metodo'); // Obsolete settings must not override the selected mode.
    const configs=[];w.studioRunJob=async c=>{configs.push(c);return {a:'Narración original completa de la prueba.',c:Array(c.sceneCount).fill('Escena en el taller'),quality:{status:'reviewed'}};};
    for(const seconds of [30,480]){
      const built=w.buildEpisodeMsg('Tema del elemento del lote',w.THEMES[0].id,w.HOOKS[0].id,'historia',String(seconds));
      await w.fetchEpisode(built.msg,'historia',built.dO,built);
      const cfg=configs.at(-1),pending=w.studioPending();
      assert.equal(cfg.editorialVersion,2);assert.equal(cfg.sceneCount,seconds===30?3:10);
      assert.equal(pending.meta.topic,'Tema del elemento del lote');assert.equal(pending.meta.seconds,seconds);
      assert.equal(pending.meta.editorial.family,'relato');
      assert.match(cfg.prompt,new RegExp(seconds===30?'FORMATO CORTO':'FORMATO LARGO'));
    }
  }finally{a.close();}
});

test('editorial evidence survives save/restore and a manual edit clears the stale review before rechecking',async()=>{
  const a=await app();try{
    const {w,projects}=a,p=episode(w);w.lastRes=p;
    p.quality={scriptFingerprint:w.LH.fingerprint(p.a),status:'needs_revision',summary:'Hace falta mostrar el ejemplo.',checks:[{criterion:'promise',status:'revise',evidence:p.a.slice(0,40),reason:'Se ofreció un ejemplo que no se desarrolló.',fix:'Mostrar la pregunta al cliente.'}]};
    p.editorialPlan={audienceMoment:'Una persona al salir del trabajo.',promise:'Una prueba concreta.',payoff:'Una decisión al final.',hooks:[],sections:[]};
    p.draftA='Borrador previo a la mejora.';
    w.studioRenderEpisode(p);assert.match(w.document.querySelector('#qualityReview').textContent,/Quedan ajustes/);
    await w.studioSaveProject(p);assert.equal(projects.get(p.uid).quality.status,'needs_revision');
    w.saveHistory(p);assert.equal(w.getHistory()[0].quality.status,'needs_revision');await w.STUDIO.saveQueue;
    w.document.querySelector('#scriptEdit').value='Imagina que preguntas a un vecino qué arreglo necesita y cuánto puede esperar. Apunta la respuesta antes de comprar herramientas.';
    await w.studioEditScript();assert.equal(w.lastRes.quality,null);assert.equal(projects.get(p.uid).quality,null);
    assert.match(w.document.querySelector('#qualityReview').textContent,/aún no tiene revisión/);
    let reviewConfig;w.studioRunJob=async c=>{reviewConfig=c;return {quality:{scriptFingerprint:w.LH.fingerprint(c.text),status:'reviewed',summary:'Ahora el ejemplo se entrega.',checks:[]}};};
    await w.studioReviewScript();assert.equal(reviewConfig.type,'review');assert.equal(reviewConfig.text,p.a);
    assert.equal(projects.get(p.uid).quality.scriptFingerprint,w.LH.fingerprint(p.a));
    assert.match(w.document.querySelector('#qualityReview').textContent,/Revisión completada/);
  }finally{a.close();}
});

test('ideas need no URLs or setup forms and their structure reaches the saved script job',async()=>{
  const a=await app();try{
    const {w,calls,errors}=a;
    const ideas=Array.from({length:5},(_,i)=>({concept:'Cómo conseguir el primer cliente '+i,t:'negocio',h:'historia',family:'relato',audience:'negocio',format:'Historia con giro',opening:'Empieza con una objeción concreta.',beats:['El cliente duda del plazo.','El artesano ofrece una prueba.','La prueba permite decidir.'],payoff:'El cliente decide después de ver el trabajo.',videoUrl:''}));
    const api=w.studioAPI;w.studioAPI=async(action,data,endpoint)=>action==='search'?{version:2,ideas,checkedAt:'2026-09-13',sources:[{title:'Nombre de otro canal',uri:'https://example.test/source'}]}:api(action,data,endpoint);
    await w.genTrends();
    assert.equal(w.document.querySelectorAll('#trendBox .studio-idea').length,5);assert.equal(w.document.querySelectorAll('#trendBox select, #trendBox input, #metricForm, #editorialReference').length,0);
    assert.doesNotMatch(w.document.querySelector('#trendBox').textContent,/Nombre de otro canal|https:/);
    const configs=[];w.studioRunJob=async config=>{configs.push(config);return {a:'Un guion de prueba con una objeción concreta y su resolución.',c:['Una escena del taller']};};
    w.applySelection('relato','negocio','480','historia');await w.genTrendOne(0);await w.STUDIO.saveQueue;
    assert.equal(configs[0].seconds,480);assert.match(configs[0].prompt,/El artesano ofrece una prueba/);assert.equal(w.lastRes.editorial.research.format,'Historia con giro');
    w.TREND_IDEAS=[];w.restoreTrendIdeas();assert.equal(w.TREND_IDEAS.length,5);
    assert.equal(calls.some(c=>c.b.action==='metrics'||c.b.action==='metric-save'),false);assert.deepEqual(errors,[]);
  }finally{a.close();}
});

test('choosing an idea analyzes its video automatically and reuses the result; failures preserve production',async()=>{
  const a=await app();try{
    const {w}=a,idea={concept:'Una oferta pequeña',t:'negocio',h:'historia',family:'relato',audience:'negocio',format:'Negociación con giro',opening:'Hay una oferta.',beats:['Una oferta inicial.','Otra posibilidad.','La respuesta final.'],payoff:'La respuesta resuelve la duda.',videoUrl:'https://www.youtube.com/watch?v=d1K48J72HMY'};
    w.TREND_IDEAS=[idea];w.TREND_RESEARCH={version:2,ideas:[idea]};let analyzes=0;
    w.studioAPI=async()=>{analyzes++;return {analysis:{...idea,visualRhythm:'Un detalle del objeto antes de la respuesta.',observations:[{second:0,detail:'Una oferta.'}],basis:'video'}};};
    const context=w.buildEpisodeMsg(idea.concept,'negocio','historia','historia','60');
    const text=await w.studioPrepareReference(context);assert.match(text,/Un detalle del objeto/);assert.equal(context.editorial.referenceAnalysis.basis,'video');
    await w.studioPrepareReference(w.buildEpisodeMsg(idea.concept,'negocio','historia','historia','60'));assert.equal(analyzes,1);
    delete idea.analysis;w.studioAPI=async()=>{throw new Error('Video unavailable');};
    const next=w.buildEpisodeMsg(idea.concept,'negocio','historia','historia','60');assert.equal(await w.studioPrepareReference(next),'');assert.match(next.editorial.referenceNotice,/estructura propuesta/);
  }finally{a.close();}
});


test('the library uses the original selectors and mode changes and project restore preserve every chosen model and format',async()=>{
  const a=await app();let second;
  try{
    const {w}=a,panel=w.document.querySelector('#genSettings'),parent=panel.parentNode;
    w.document.querySelector('#librarySettings').click();assert.equal(w.document.querySelector('#librarySettingsDialog').open,true);
    assert.equal(w.document.querySelector('#librarySettingsContent #genSettings'),panel);
    const choices={selImgModel:'gemini-3-pro-image',selImgFmt:'3:4',selVidModel:'veo-3.1-generate-001',selVidFmt:'16:9'};
    for(const [id,value] of Object.entries(choices)){const el=w.document.getElementById(id);el.value=value;el.dispatchEvent(new w.Event('change'));assert.equal(w.document.querySelectorAll('#'+id).length,1);}
    w.document.querySelector('#librarySettingsClose').click();assert.equal(panel.parentNode,parent);
    w.document.querySelector('#modeSelector [data-id="relato"]').click();w.document.querySelector('#modeSelector [data-id="impacto"]').click();
    w.studioRestoreEditorial({platform:'youtube'});await w.studioPaintRecipes();
    assert.equal(w.imgModel,choices.selImgModel);assert.equal(w.imgFmt,'3:4');assert.equal(w.vidModel,choices.selVidModel);assert.equal(w.vidFmt,'16:9');
    assert.match(w.document.querySelector('#recipeSettings').textContent,/Nano Banana Pro.*3:4/);
    const storage=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));second=await app(storage);
    for(const [id,value] of Object.entries(choices))assert.equal(second.w.document.getElementById(id).value,value,'reload preserves '+id);
    assert.equal(second.w.document.querySelector('#recipeCategory option[value="trabajo"]').textContent,'Trabajo y negocio');
    second.w.document.querySelector('#libraryCreateTab').click();assert.equal(second.w.document.querySelector('#librarySavedView').hidden,true);
    assert.equal(second.w.document.querySelector('#libraryCreateView').hidden,false);
    second.w.document.querySelector('#libraryCreateTab').dispatchEvent(new second.w.KeyboardEvent('keydown',{key:'ArrowLeft'}));assert.equal(second.w.document.querySelector('#librarySavedTab').getAttribute('aria-selected'),'true');
  }finally{a.close();if(second)second.close();}
});

test('each saved image appears before the next generation, the selection stays fixed, and reload resumes the same choices',async()=>{
  const a=await app();let reloaded,release;
  try{
    const {w,assets}=a;assets.push({id:'a'.repeat(32),object:'legado-studio/media/old.png',kind:'image',recipeId:'receta-0-2',aspect:'3:4',title:'Guardada',description:'Toma general en la oficina'});
    w.imgFmt='3:4';w.imgModel='gemini-3.1-flash-image';let approvals=0;w.confirm=()=>{approvals++;return true;};w.loadRefs=async()=>[];
    let job,config,advances=0;const api=w.studioAPI;
    w.studioAPI=async(action,data,endpoint)=>{
      if(action==='library-start'){
        config=JSON.parse(JSON.stringify(data.config));job={id:'batch-test',type:'generate',status:'ready',total:12,completed:0,failed:0,skipped:0,stage:'Preparado',recipeIds:config.recipeIds,pendingRecipeIds:config.recipeIds,recipeResults:{},settings:{model:config.model,aspect:config.aspect}};return {job:structuredClone(job)};
      }
      if(action==='library-advance'){
        advances++;
        if(advances===1){const asset={id:'b'.repeat(32),object:'legado-studio/media/new.png',kind:'image',recipeId:config.recipeIds[0],aspect:config.aspect,title:'La primera imagen',version:1};assets.push(asset);job.lastAsset=asset;return {job:structuredClone(job)};}
        await new Promise(r=>{release=r;});job={...job,completed:1,pendingRecipeIds:config.recipeIds.slice(1),recipeResults:{[config.recipeIds[0]]:'ready'}};return {job:structuredClone(job)};
      }
      return api(action,data,endpoint);
    };
    const running=w.studioGenerateRecipe();await ready(()=>advances===2);
    assert.equal(approvals,1);assert.equal(config.recipeIds.length,12);assert.ok(!config.recipeIds.includes('receta-0-2'));assert.equal(config.model,w.imgModel);assert.equal(config.aspect,'3:4');
    const grid=w.document.querySelector('#recipePreview'),first=grid.firstElementChild;
    assert.equal(grid.children.length,12);assert.equal(first.dataset.recipeId,config.recipeIds[0]);assert.ok(first.querySelector('img').src.includes('media.example.test'));assert.match(first.textContent,/Imagen guardada/);
    assert.deepEqual([...grid.children].map(c=>c.dataset.recipeId),config.recipeIds);assert.equal(grid.querySelectorAll('input, textarea, li').length,0);
    assert.equal(w.document.querySelector('#selImgModel').disabled,false);
    w.document.querySelector('#libraryPause').click();release();await running;
    assert.equal(grid.firstElementChild,first,'progress updates keep the existing image element in place');assert.equal(w.document.querySelector('#libraryResume').hidden,false);
    assert.equal(w.document.querySelector('#recipeGenerate').hidden,true);assert.equal(w.document.querySelector('#selImgModel').disabled,false);
    reloaded=await app({'lh_gen_imgModel':'gemini-2.5-flash-image','lh_gen_imgFmt':'9:16'});const v=reloaded.w;reloaded.assets.push(...structuredClone(assets));const nextAPI=v.studioAPI;let starts=0,continued=0;
    v.studioAPI=async(action,data,endpoint)=>{
      if(action==='library-status')return {job:structuredClone(job)};
      if(action==='library-start'){starts++;throw new Error('Must continue the saved job');}
      if(action==='library-advance'){
        continued++;assert.equal(data.id,job.id);assert.equal(job.settings.aspect,'3:4');
        for(const [i,id] of config.recipeIds.slice(1).entries())reloaded.assets.push({id:String(i+1).padStart(32,'0'),object:'legado-studio/media/continued-'+i+'.png',kind:'image',recipeId:id,aspect:job.settings.aspect,title:'Guardada '+i});
        job={...job,status:'done',completed:12,pendingRecipeIds:[],recipeResults:Object.fromEntries(config.recipeIds.map(id=>[id,'ready']))};return {job:structuredClone(job)};
      }
      return nextAPI(action,data,endpoint);
    };
    await v.studioLoadLibrary();assert.deepEqual([...v.document.querySelector('#recipePreview').children].map(c=>c.dataset.recipeId),config.recipeIds);
    assert.match(v.document.querySelector('#recipeSettings').textContent,/Nano Banana 2.*3:4/);assert.equal(v.imgFmt,'9:16','restoring a job displays its settings without overwriting the current selectors');
    await v.studioLibraryResume();assert.equal(continued,1);assert.equal(starts,0);assert.equal(v.document.querySelectorAll('#recipePreview img').length,12);
    assert.equal(v.document.querySelector('#recipeNew').hidden,false);assert.equal(v.document.querySelector('#recipeGenerate').hidden,true);
    v.document.querySelector('#recipeNew').click();assert.equal(v.document.querySelector('#recipeGenerate').hidden,false);assert.match(v.document.querySelector('#recipeSettings').textContent,/9:16/);
    assert.deepEqual(a.errors,[]);assert.deepEqual(reloaded.errors,[]);
  }finally{if(release)release();a.close();if(reloaded)reloaded.close();}
});

test('active cataloging leaves model settings and both import panels usable, and preparation errors release controls',async()=>{
  const a=await app();try{
    const {w}=a;
    w.STUDIO_LIBRARY.running=true;
    await w.studioLibraryPaint({id:'catalog-test',type:'catalog',status:'ready',total:100,completed:15,stage:'15 de 100'});
    const bring=w.document.querySelector('#libraryBring');bring.click();assert.equal(bring.getAttribute('aria-expanded'),'true');assert.equal(w.document.querySelector('#libraryCloudPanel').hidden,false);
    w.document.querySelector('#libraryBringPhone').click();assert.equal(w.document.querySelector('#libraryPhonePanel').hidden,false);assert.equal(w.document.querySelector('#libraryCloudPanel').hidden,true);
    assert.ok(w.document.querySelector('#libraryPhonePanel input[type=file]'));w.document.querySelector('#libraryBringCloud').click();assert.ok(w.document.querySelector('#libraryCloudPanel #librarySource'));
    assert.equal(w.document.querySelector('#libraryImportBusy').hidden,false);
    w.document.querySelector('#libraryCreateTab').click();assert.equal(w.document.querySelector('#librarySettings').disabled,false);
    w.document.querySelector('#librarySettings').click();assert.equal(w.document.querySelector('#librarySettingsDialog').open,true);assert.equal(w.document.querySelector('#selImgModel').disabled,false);
    const select=w.document.querySelector('#selImgFmt');select.value='16:9';select.dispatchEvent(new w.Event('change'));assert.equal(w.imgFmt,'16:9');w.document.querySelector('#librarySettingsClose').click();
    w.STUDIO_LIBRARY.running=false;w.STUDIO_LIBRARY.job=null;
    w.document.querySelector('#recipeBatchSize').value='1';w.loadRefs=async()=>{throw new Error('Reference connection failed');};
    await assert.rejects(w.studioGenerateRecipe(),/Reference connection failed/);
    assert.equal(w.STUDIO_LIBRARY.preparing,false);assert.equal(w.document.querySelector('#recipeGenerate').disabled,false);assert.equal(w.document.querySelector('#librarySettings').disabled,false);
  }finally{a.close();}
});

test('a storage throttle resumes the same job automatically and waiting can be paused',async()=>{
  const a=await app();try{
    const {w}=a,api=w.studioAPI;let attempts=0,starts=0;const waits=[];
    const job={id:'storage-retry',type:'catalog',status:'ready',completed:25,total:100,stage:'25 de 100'};
    w.studioAPI=async(action,data,endpoint)=>{
      if(action==='library-start')starts++;
      if(action==='library-advance'){assert.equal(data.id,job.id);if(++attempts===1){const e=new Error('rate limit');e.status=429;e.storageRateLimited=true;throw e;}return {job:{...job,status:'done',completed:100}};}
      return api(action,data,endpoint);
    };
    w.studioLibraryWait=async ms=>{waits.push(ms);};
    await w.studioLibraryRun(job);assert.equal(attempts,2);assert.equal(starts,0);assert.deepEqual(waits,[5000]);
    attempts=0;w.studioLibraryWait=async()=>{w.document.querySelector('#libraryPause').click();};
    await w.studioLibraryRun(job);assert.equal(attempts,1);assert.equal(w.document.querySelector('#libraryResume').hidden,false);assert.equal(w.STUDIO_LIBRARY.running,false);
  }finally{a.close();}
});

test('script transients retry the same saved job automatically, with a finite limit',async()=>{
  const a=await app();try{
    const {w}=a;let advances=0,creates=0;const waits=[];
    w.studioRetryWait=async ms=>waits.push(ms);
    w.studioAPI=async(action,b)=>{if(action==='create'){creates++;return {id:'same-job',status:'ready'};}assert.equal(b.id,'same-job');advances++;if(advances<3){const e=new Error('temporary');e.status=504;throw e;}return {id:'same-job',status:'done',result:{a:'saved script'}};};
    const out=await w.studioRunJob({type:'script'},'request-001');assert.equal(out.a,'saved script');assert.equal(creates,1);assert.equal(advances,3);assert.deepEqual(waits,[3000,6000]);
    advances=0;w.studioAPI=async action=>{if(action==='create')return {id:'same-job',status:'ready'};advances++;const e=new Error('persistent');e.status=503;throw e;};
    await assert.rejects(w.studioRunJob({type:'script'},'request-002'),/persistent/);assert.equal(advances,3);
  }finally{a.close();}
});

test('library button assigns scenes without opening the legacy picker and ZIP includes unique library sources',async()=>{
  const a=await app();try{
    const {w,assets,calls}=a;w.lastRes=episode(w);assets.push(...['image','video'].map((kind,i)=>({id:String(i+1).padStart(32,'0'),kind,object:'legado-studio/media/a'+i+(i?'.mp4':'.png'),aspect:'9:16',description:'Calcular presupuesto en oficina con calculadora',title:'Calcular '+i})));
    w.renderOut(w.lastRes);await w.studioUseLibrary();await tick();
    assert.ok(w.STUDIO.plan.every(p=>p.assetId));assert.equal(w.document.querySelector('#bancoPanel').style.display,'none');assert.match(w.document.querySelector('#bbanco').textContent,/Asignar/);
    assert.ok(w.document.querySelectorAll('#scenePlan .studio-plan-preview').length>0);
    assert.ok([...w.document.querySelectorAll('#scenePlan details')].every(d=>!d.open));
    const original=w.fetch;w.fetch=async(url,opts)=>String(url).startsWith('https://media.example.test/')?{ok:true,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer}:original(url,opts);
    const files=new Map();await w.studioZipLibrary({file:(name,data)=>files.set(name,data)},'test');
    assert.equal(files.size,2);assert.ok([...files.keys()].some(k=>k.endsWith('.mp4')));assert.ok([...files.keys()].some(k=>k.endsWith('.png')));
    assert.equal(calls.filter(c=>c.input==='/api/image'||c.input==='/api/video-start').length,0);
  }finally{a.close();}
});
