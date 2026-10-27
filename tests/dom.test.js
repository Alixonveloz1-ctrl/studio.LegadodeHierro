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
      else if(b.action==='select-videos')d={plan:w.LH.selectPlan(b.scenes,assets)};
      else if(b.action==='links')d={items:b.ids.map(id=>({...assets.find(a=>a.id===id),duration:60,url:'https://media.example.test/'+id}))};
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

test('simplified UI shows no library, biblia or bank controls, and the main video flow is present',async()=>{
  const a=await app();try{
    const {w,errors}=a;
    for(const id of ['libraryPanel','bibliaPanel','bibliaBtn','buildScenePlan','libraryGrid','libraryViewer','librarySettingsDialog','bbanco','bancoPanel','selBibliaModel','libraryCreateTab','librarySavedTab'])assert.equal(w.document.getElementById(id),null,id+' debe estar eliminado');
    for(const id of ['modeSelector','themeGrid','durGrid','hookGrid','conc','gbtn','projectsPanel','episodeTools','genSettings','selImgModel','selImgFmt','selVidModel','selVidFmt','unifyCard'])assert.ok(w.document.getElementById(id),id+' debe seguir presente');
    assert.ok(w.document.querySelectorAll('.lh-step').length===8);
    assert.ok(w.document.querySelector('.lh-step.lh-active').dataset.lhStep==='inicio');
    assert.ok(w.document.querySelector('#lh-step-inicio').contains(w.document.querySelector('.lh-hero')));
    assert.ok(w.document.querySelectorAll('.lh-quick .lh-qcard').length===6);
    assert.ok(w.document.querySelector('#lhCurrentTitle'));
    assert.ok(w.document.querySelector('#lhRecentGrid'));
    assert.ok(w.document.querySelector('#lhConnGoogle'));
    assert.ok(w.document.querySelector('#lhConnEleven'));
    assert.ok(w.document.querySelector('.lh-bottom button[data-lh-step="mis-videos"]'));
    assert.ok(w.document.querySelector('.lh-bottom button[data-lh-step="produccion"]'));
    assert.ok(w.document.querySelector('.lh-sidebar'));assert.ok(w.document.querySelector('.lh-bottom'));
    assert.ok(w.document.querySelector('#lh-step-investigacion').contains(w.document.querySelector('#bTrends')));
    assert.ok(w.document.querySelector('#lh-step-tema').contains(w.document.querySelector('#modeSelector')));
    assert.ok(w.document.querySelector('#lh-step-produccion').contains(w.document.querySelector('#episodeTools')));
    assert.ok(w.document.querySelector('#lh-step-musica').contains(w.document.querySelector('#musicBox')));
    assert.ok(w.document.querySelector('#lh-step-montaje').contains(w.document.querySelector('#unifyCard')));
    assert.ok(w.document.querySelector('#lh-step-extras').contains(w.document.querySelector('#postTema')));
    const css=w.document.querySelector('style').textContent;
    assert.match(css,/\.lh-bottom\{display:flex/);
    assert.match(css,/\.lh-sidebar\{display:none/);
    assert.match(css,/\.tgrid\{display:grid;grid-template-columns:repeat\(2/);
    assert.match(css,/\.olist\{display:grid;grid-template-columns:repeat\(2/);
    w.lhShowStep('produccion');assert.ok(w.document.querySelector('.lh-step.lh-active').dataset.lhStep==='produccion');
    w.document.querySelector('[data-lh-step="musica"]').click();assert.ok(w.document.querySelector('.lh-step.lh-active').dataset.lhStep==='musica');
    assert.equal(w.document.querySelectorAll('.lh-step-foot').length,0,'no debe haber botones Anterior/Siguiente duplicando la navegación');
    assert.equal(w.document.getElementById('gcost'),null,'la barra de costos debe estar eliminada');
    w.document.querySelector('.lh-bottom button[data-lh-step="extras"]').click();assert.ok(w.document.querySelector('.lh-step.lh-active').dataset.lhStep==='extras');
    assert.ok(w.document.querySelector('#lh-step-extras').contains(w.document.querySelector('#bpost')));
    // Visibilidad real: ninguna pantalla puede estar anidada dentro de otra, si no, se ve en blanco.
    for(const step of w.document.querySelectorAll('.lh-step')){
      let parent=step.parentElement, nested=false;
      while(parent){if(parent.classList&&parent.classList.contains('lh-step'))nested=true;parent=parent.parentElement;}
      assert.equal(nested,false,step.dataset.lhStep+' no debe estar dentro de otra pantalla');
    }
    for(const name of ['inicio','mis-videos','investigacion','tema','produccion','musica','montaje','extras']){
      w.lhShowStep(name);
      const active=w.document.querySelector('.lh-step.lh-active');
      assert.equal(active.dataset.lhStep,name);
      assert.equal(w.document.defaultView.getComputedStyle(active).display,'block',name+' debe ser visible al activarla');
    }
    // Producción no puede vivir dentro de un .slbl: ese contenedor es flex con
    // mayúsculas heredadas y apretaba Tomas y Narración en columnas diminutas.
    for(const id of ['episodeTools','audioCard','imgCard']){
      const el=w.document.getElementById(id);
      assert.ok(el,id+' debe existir');
      assert.equal(el.closest('.slbl'),null,id+' no debe estar dentro de un .slbl');
    }
    // El selector de voz debe verse siempre, no dentro de un panel plegado.
    const vEngine=w.document.getElementById('vEngine');
    assert.ok(vEngine,'el selector de motor de voz debe existir');
    assert.equal(vEngine.closest('details'),null,'el selector de voz no debe estar dentro de un details plegado');
    assert.deepEqual([...vEngine.options].map(o=>o.value),['eleven','chirp','gemini']);
    // En el teléfono, las tomas van en una sola columna a ancho completo.
    const studioCss=fs.readFileSync(path.join(root,'public/studio.css'),'utf8');
    assert.ok(/@media\(max-width:520px\)\{[^}]*\.studio-plan\{grid-template-columns:minmax\(0,1fr\)/.test(studioCss),'el plan debe ser de una columna en el teléfono');
    // La lista de Inicio se limpia sola una vez, sin borrar nada (Ver todos restaura).
    const studioJs=fs.readFileSync(path.join(root,'public/studio.js'),'utf8');
    assert.ok(studioJs.includes('lh_recent_auto_cleared_v1'),'la lista reciente debe limpiarse sola una vez al actualizar');
    assert.equal(w.document.querySelector('#lh-step-inicio').textContent.includes('Posts de Facebook, independientes'),false,'Inicio no debe duplicar el generador de posts');
    assert.deepEqual(errors,[]);
  }finally{a.close();}
});

test('editing a script invalidates old narration, captions, plan and final output while preserving source assets',async()=>{
  const a=await app();try{
    const {w,projects}=a;w.lastRes=episode(w);w.lastRes.renders={es:{jobId:'old'}};w.imgs=[{src:'https://media.example.test/a',object:'legado-studio/media/a',assetId:'1'.repeat(32)}];w.audES={url:'blob:old'};w.FINALES.es={url:'blob:old'};w.finalVid=w.FINALES.es;w.STUDIO.plan=[{assetId:'old'}];
    w.document.querySelector('#scriptEdit').value='Otra decisión concreta cambia la historia y sus consecuencias. Este es el guion revisado con una promesa diferente.';
    await w.studioEditScript();await w.STUDIO.saveQueue;
    assert.equal(w.audES,null);assert.equal(w.finalVid,null);assert.equal(w.FINALES.es,null);assert.equal(w.lastCaption,'');assert.ok(w.STUDIO.plan.every(p=>!p.assetId));assert.equal(w.imgs.length,1);
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


test('model and format selectors work directly and survive mode changes and reload, without a library settings dialog',async()=>{
  const a=await app();let second;
  try{
    const {w}=a,panel=w.document.querySelector('#genSettings'),parent=panel.parentNode;
    assert.equal(w.document.querySelector('#librarySettings'),null);assert.equal(w.document.querySelector('#librarySettingsDialog'),null);
    const choices={selImgModel:'gemini-3-pro-image',selImgFmt:'3:4',selVidModel:'veo-3.1-generate-001',selVidFmt:'16:9'};
    for(const [id,value] of Object.entries(choices)){const el=w.document.getElementById(id);el.value=value;el.dispatchEvent(new w.Event('change'));assert.equal(w.document.querySelectorAll('#'+id).length,1);}
    assert.equal(w.imgModel,choices.selImgModel);assert.equal(w.imgFmt,'3:4');assert.equal(w.vidModel,choices.selVidModel);assert.equal(w.vidFmt,'16:9');
    w.document.querySelector('#modeSelector [data-id="relato"]').click();w.document.querySelector('#modeSelector [data-id="impacto"]').click();
    assert.equal(w.imgModel,choices.selImgModel);assert.equal(w.imgFmt,'3:4');
    const storage=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));second=await app(storage);
    for(const [id,value] of Object.entries(choices))assert.equal(second.w.document.getElementById(id).value,value,'reload preserves '+id);
    assert.equal(panel.parentNode,parent);
  }finally{a.close();if(second)second.close();}
});

test('per-video generation needs no library panel: painting recipes without it does not crash',async()=>{
  const a=await app();try{
    const {w,errors}=a;
    assert.equal(w.document.querySelector('#recipePreview'),null);assert.equal(w.document.querySelector('#recipeGenerate'),null);assert.equal(w.document.querySelector('#recipeSettings'),null);
    await w.studioPaintRecipes();await w.studioPaintLibrary();
    assert.ok(w.document.querySelector('#genSettings'));assert.ok(w.document.querySelector('#selImgModel'));
    assert.deepEqual(errors,[]);
  }finally{a.close();}
});

test('library paint and controls are no-ops without a library panel',async()=>{
  const a=await app();try{
    const {w,errors}=a;
    w.STUDIO_LIBRARY.running=true;
    await w.studioLibraryPaint({id:'catalog-test',type:'catalog',status:'ready',total:100,completed:15,stage:'15 de 100'});
    assert.equal(w.document.querySelector('#libraryPanel'),null);assert.equal(w.document.querySelector('#libraryBring'),null);assert.equal(w.document.querySelector('#librarySettings'),null);assert.equal(w.document.querySelector('#libraryImportBusy'),null);
    w.STUDIO_LIBRARY.running=false;w.STUDIO_LIBRARY.job=null;w.studioLibraryControls();
    assert.deepEqual(errors,[]);
  }finally{a.close();}
});

test('a storage throttle resumes the same job automatically without library buttons',async()=>{
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
    attempts=0;w.studioLibraryWait=async()=>{w.STUDIO_LIBRARY.pause=true;};
    await w.studioLibraryRun(job);assert.equal(attempts,1);assert.equal(w.document.querySelector('#libraryPause'),null);assert.equal(w.document.querySelector('#libraryResume'),null);assert.equal(w.STUDIO_LIBRARY.running,false);
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

test('no bank button or bank panel in the simplified UI, even after rendering a project',async()=>{
  const a=await app();try{
    const {w,errors}=a;w.lastRes=episode(w);w.renderOut(w.lastRes);await tick();
    assert.equal(w.document.querySelector('#bbanco'),null);assert.equal(w.document.querySelector('#bancoPanel'),null);assert.equal(w.document.querySelector('#buildScenePlan'),null);
    assert.ok(w.document.querySelector('#episodeTools'));assert.ok(w.document.querySelector('#scenePlan'));
    assert.deepEqual(errors,[]);
  }finally{a.close();}
});

test('eight shot cards show three assigned previews and five generation controls, and image-to-video keeps the same shot',async()=>{
  const a=await app();try{
    const {w,assets}=a;w.lastRes=episode(w);
    assets.push(...['image','video','image'].map((kind,i)=>({id:String(i+1).padStart(32,'0'),kind,object:'legado-studio/media/'+i,aspect:'9:16',description:'Calcular presupuesto',title:'Toma '+i})));
    w.STUDIO.assets=assets;w.STUDIO.plan=Array.from({length:8},(_,i)=>({scene:i,start:i*6,duration:6,description:'Escena '+i,assetId:i<3?assets[i].id:'',reason:i<3?'Asignada':'Falta material',aspect:'9:16'}));
    w.studioPaintPlan();await tick();await tick();
    const cards=[...w.document.querySelectorAll('.studio-shot')];assert.equal(cards.length,8);assert.equal(w.document.querySelectorAll('.studio-plan-preview img,.studio-plan-preview video').length,3);
    assert.equal(cards.filter(c=>c.textContent.includes('Generar imagen')).length,5);assert.equal(cards.filter(c=>c.textContent.includes('Generar video')).length,2);assert.ok(cards.every(c=>!c.textContent.includes('Ver toma')));
    w.loadRefs=async()=>Array(10).fill('ref');w.prepararImagen=async()=>({prompt:'prepared',refs:[]});w.genOneImage=async()=> 'data:image/png;base64,AA==';
    w.studioSaveImage=async(src,desc,n)=>{const saved={id:'9'.repeat(32),object:'legado-studio/media/new.png',kind:'image',aspect:'9:16',description:desc};assets.push(saved);return saved;};
    await w.studioGenerateShot(3);await tick();assert.equal(w.STUDIO.plan[3].assetId,'9'.repeat(32));assert.ok(w.document.querySelector('[data-shot="3"] img'));
    w.vidFmt='9:16';let called;
    w.genVideoForSlot=async(n,box,batch)=>{called={n,batch,id:w.imgs[n].assetId};w.vids[n]={assetId:'8'.repeat(32),object:'legado-videos/new.mp4'};w.vidState[n]='done';assets.push({id:'8'.repeat(32),kind:'video',object:'legado-videos/new.mp4',description:'Animada'});};
    await w.studioAnimateShot(3,w.document.querySelector('[data-shot="3"]'));assert.deepEqual(called,{n:3,batch:true,id:'9'.repeat(32)});assert.equal(w.STUDIO.plan[3].assetId,'8'.repeat(32));assert.equal(w.STUDIO.plan[0].assetId,assets[0].id);
    await tick();const media=w.document.querySelector('[data-shot="0"] img');media.dispatchEvent(new w.Event('error'));assert.match(w.document.querySelector('[data-shot="0"]').textContent,/Recargar vista previa/);
  }finally{a.close();}
});

test('montage rejects pending images and completing a newly created scene animates it using the existing video flow',async()=>{
  const a=await app();try{
    const {w,assets}=a;w.lastRes=episode(w);assets.push({id:'1'.repeat(32),kind:'image',aspect:'9:16',object:'legado-studio/media/image.png'});w.STUDIO.assets=assets;w.STUDIO.plan=[{scene:0,start:0,duration:60,assetId:assets[0].id}];
    await assert.rejects(w.studioPrepareMontage({dur:60,audioObjects:['legado-studio/media/voice.wav']}),/pendientes de convertir a video/);
    let animations=0;w.studioAnimateShot=async i=>{animations++;assets.push({id:'2'.repeat(32),kind:'video',aspect:'9:16',object:'legado-videos/video.mp4'});w.STUDIO.plan[i].assetId='2'.repeat(32);};
    await w.studioGenerateMissing();assert.equal(animations,1);
    const payload=await w.studioPrepareMontage({dur:60,audioObjects:['legado-studio/media/voice.wav']});assert.ok(payload.shots.every(s=>s.kind==='video'));
    await w.studioGenerateMissing();assert.equal(animations,1);
  }finally{a.close();}
});

test('secondary reference failures stop image generation and a later attempt fetches the real references again',async()=>{
  const a=await app(),w=a.w;
  try{
    w.BIBLIA=[{id:'companera',nombre:'Compañera adulta',rol:'pareja',fisico:'Mujer de 35 años',vestuario:'camisa azul'}];
    let attempts=0;
    w.fetch=async()=>({ok:true,json:async()=>({refs:++attempts===1?[]:['adult-view-1','adult-view-2']})});
    await assert.rejects(w.prepararImagen('[CON: companera] Conversan en casa',['main-view']),/referencias/);
    w.apuntarPersonajes=()=>{};
    const result=await w.prepararImagen('[CON: companera] Conversan en casa',['main-view']);
    assert.deepEqual(Array.from(result.refs),['main-view','adult-view-1','adult-view-2']);
    assert.match(result.prompt,/Mujer de 35/);assert.equal(attempts,2);
    await assert.rejects(w.prepararImagen('Un niño en la sala',['main-view']),/adultos/);
  }finally{a.close();}
});

test('manual shot picker includes every available video without an automatic match or format match',async()=>{
  const a=await app();try{
    const {w,assets}=a;w.lastRes=episode(w);
    assets.push(...Array.from({length:32},(_,i)=>({id:'manual-'+i,kind:'video',title:'Video '+i,description:'Adulto trabajando en oficina',aspect:i%2?'16:9':'9:16'})));
    assets.push({id:'excluded',kind:'video',description:'Un niño en la sala'}, {id:'still',kind:'image',description:'Adulto trabajando'}, {id:'archived',kind:'video',archived:true,description:'Adulto trabajando'});
    w.STUDIO.assets=assets;w.STUDIO.plan=[{scene:0,start:0,duration:8,description:'Otra escena sin coincidencias',aspect:'9:16',assetId:'',alternatives:[]}];
    w.studioPaintPlan();
    const picker=w.document.querySelector('[aria-label="Material de la toma 1"]');
    assert.equal(picker.options.length,33);assert.equal(picker.value,'');
    assert.ok(Array.from(picker.options).some(o=>o.value==='manual-31'));
    picker.value='manual-31';picker.dispatchEvent(new w.Event('change'));
    assert.equal(w.STUDIO.plan[0].assetId,'manual-31');assert.equal(w.STUDIO.plan[0].reason,'Selección manual');
    await tick();await tick();assert.ok(w.document.querySelector('[data-shot="0"] video'));
  }finally{a.close();}
});

test('one reel list combines cloud and local history by ID, preserves same-title projects and restores local-only reels',async()=>{
  const a=await app();try{
    const {w,projects}=a,p=episode(w);p.topic='Tema compartido';projects.set(p.uid,p);
    w.localStorage.setItem('lh_hist',JSON.stringify([{id:'r'+p.uid,a:p.a,topic:p.topic,fecha:'2026-09-13'}, {id:'rlocal-only',a:'Guion antiguo conservado',topic:p.topic,fecha:'2026-08-20',modo:'reel',d:'60',c:[]} ]));
    await w.studioOpenProjects();
    assert.equal(w.document.querySelectorAll('#projectList [data-project-id]').length,2);
    assert.equal(w.document.getElementById('histBtn'),null);assert.equal(w.document.getElementById('histPanel'),null);assert.ok(w.document.getElementById('projectsPanel'));
    let restored;w.restoreHistory=(id)=>{restored=id;};
    w.document.querySelector('[data-project-id="local-only"] button').click();assert.equal(restored,'rlocal-only');
    w.studioLoadAll=async()=>{throw Error('offline');};await w.studioOpenProjects();
    assert.equal(w.document.querySelectorAll('#projectList [data-project-id]').length,2);
    assert.equal(JSON.parse(w.localStorage.getItem('lh_hist')).length,2);
  }finally{a.close();}
});

test('one shot workspace owns the original model controls and thumbnail, without a library settings dialog',async()=>{
  const a=await app();try{
    const {w}=a,settings=w.document.getElementById('genSettings');
    assert.ok(w.document.getElementById('episodeTools').contains(settings));
    assert.ok(w.document.getElementById('imgCard').hidden);
    w.lastRes=episode(w);w.renderOut(w.lastRes);
    assert.ok(w.document.getElementById('imgCard').hidden,'renderOut must not expose the old duplicate panel');
    assert.equal(w.document.querySelectorAll('#selImgModel').length,1);
    assert.ok(w.document.getElementById('sceneExtras').contains(w.document.getElementById('bthumb')));
    assert.equal(w.document.getElementById('librarySettingsDialog'),null);
    const before=settings.parentNode;w.studioLibrarySettings();assert.equal(settings.parentNode,before,'without a library dialog, settings stay where they are');
    assert.ok(w.document.querySelectorAll('#scenePlan .studio-shot').length>0);
  }finally{a.close();}
});

test('model picker shows complete labels and updates the original model selector',async()=>{
 const a=await app();try{const {w}=a,select=w.document.getElementById('selImgModel');select.nextElementSibling.click();
 const options=[...w.document.querySelectorAll('.studio-model-option')];assert.equal(options.length,3);options[2].click();
 assert.equal(select.value,'gemini-3-pro-image');assert.equal(w.imgModel,select.value);assert.match(select.nextElementSibling.textContent,/máxima calidad/);
 }finally{a.close();}
});
test('regeneration keeps the old image on failure and uses the linked image for a video retry',async()=>{
 const a=await app();try{const {w,assets}=a;w.lastRes=episode(w);assets.push({id:'image',kind:'image',aspect:'9:16',object:'image.png'},{id:'video',kind:'video',sourceImageId:'image',object:'video.mp4'});w.STUDIO.assets=assets;
 w.STUDIO.plan=[{scene:0,start:0,duration:8,assetId:'video',description:'Adulto trabajando',reason:'LONG UNWANTED REASON'}];w.imgs[0]={assetId:'unrelated',src:'unrelated'};w.vids[0]={assetId:'video'};w.vidState[0]='done';
 w.studioPaintPlan();assert.ok(!w.document.getElementById('scenePlan').textContent.includes('LONG UNWANTED'));
 w.loadRefs=async()=>Array(10).fill('ref');w.prepararImagen=async()=>({prompt:'p',refs:[]});w.genOneImage=async()=>{throw Error('provider failed');};
 await assert.rejects(w.studioGenerateShot(0,true),/provider failed/);assert.equal(w.STUDIO.plan[0].assetId,'video');
 w.vidFmt='9:16';w.genVideoForSlot=async n=>{assert.equal(w.imgs[n].assetId,'image');w.vidState[n]='error';w.vidErrMsg[n]='video failed';};
 await assert.rejects(w.studioAnimateShot(0,w.document.querySelector('.studio-shot')),/video failed/);assert.equal(w.STUDIO.plan[0].assetId,'video');assert.equal(w.vids[0].assetId,'video');assert.equal(w.imgs[0].assetId,'unrelated');
 }finally{a.close();}
});

test('batch image generation stops before animation; video batch uses only reviewed existing images',async()=>{
 const a=await app();try{const {w,assets}=a;w.lastRes=episode(w);assets.push({id:'ready',kind:'video'},{id:'still',kind:'image',aspect:'9:16'});w.STUDIO.assets=assets;
 w.STUDIO.plan=[{scene:0,start:0,duration:8,assetId:'ready'},{scene:1,start:8,duration:8,assetId:'still'},{scene:2,start:16,duration:8,assetId:''}];
 let imageCalls=0,videoCalls=0;w.vidFmt='9:16';w.studioGenerateShot=async i=>{imageCalls++;assets.push({id:'new',kind:'image',aspect:'9:16'});w.STUDIO.plan[i].assetId='new';};
 w.studioAnimateShot=async i=>{videoCalls++;assets.push({id:'animated'+i,kind:'video'});w.STUDIO.plan[i].assetId='animated'+i;};
 await w.studioGenerateMissingImages();assert.equal(imageCalls,1);assert.equal(videoCalls,0);assert.equal(w.STUDIO.plan[0].assetId,'ready');assert.equal(w.STUDIO.plan[1].assetId,'still');
 w.STUDIO.plan.push({scene:3,start:24,duration:8,assetId:''});await w.studioGenerateMissing();assert.equal(imageCalls,1);assert.equal(videoCalls,2);assert.equal(w.STUDIO.plan[3].assetId,'');
 }finally{a.close();}
});
test('animation follows the selected source image and does not silently generate a replacement image',async()=>{
 const a=await app();try{const {w,assets}=a;w.lastRes=episode(w);w.imgs[0]={description:'Hold a cup with the right hand'};
 assert.match(w.buildVideoMotionPrompt(0),/Hold a cup/);assert.ok(!w.buildVideoMotionPrompt(0).includes('Calcular presupuesto'));
 assets.push({id:'old',kind:'video'});w.STUDIO.assets=assets;w.STUDIO.plan=[{scene:0,start:0,duration:8,assetId:'old'}];let generated=0;w.studioGenerateShot=async()=>{generated++;};
 await assert.rejects(w.studioAnimateShot(0,w.document.createElement('div')),/imagen de origen/);assert.equal(generated,0);assert.equal(w.STUDIO.plan[0].assetId,'old');await tick();await tick();
 }finally{a.close();}
});

test('real image batch completes multiple saved shots without replacing earlier previews or replaying hidden gallery saves',async()=>{
 const a=await app();try{const {w,assets}=a;w.lastRes=episode(w);w.STUDIO.assets=assets;w.STUDIO.plan=[0,1,2].map(i=>({scene:i,start:i*8,duration:8,assetId:'',description:'Adulto trabajando '+i}));
 w.studioPaintPlan();w.loadRefs=async()=>Array(10).fill('ref');w.prepararImagen=async p=>({prompt:p,refs:[]});let generated=0,saved=0,first;
 w.genOneImage=async()=>{generated++;if(generated>1)assert.equal(w.document.querySelector('[data-shot="0"]'),first);return 'data:image/png;base64,'+generated;};
 w.studioSaveImage=async(src,description,n)=>{saved++;const asset={id:'image'+n,kind:'image',object:'image'+n+'.png',description};assets.push(asset);return asset;};
 const paint=w.studioPaintPlan;w.studioPaintPlan=()=>{paint();if(!first&&w.STUDIO.plan[0].assetId)first=w.document.querySelector('[data-shot="0"]');};
 await w.studioGenerateMissingImages();await tick();await tick();assert.equal(generated,3);assert.equal(saved,3);assert.ok(w.STUDIO.plan.every(p=>p.assetId));assert.match(w.document.getElementById('sceneBatchProgress').textContent,/3 de 3/);assert.equal(w.document.getElementById('igrid').children.length,0);
 }finally{a.close();}
});
test('video batch continues after a failed shot and preserves existing media DOM',async()=>{
 const a=await app();try{const {w,assets}=a;w.lastRes=episode(w);w.vidFmt='9:16';assets.push(...[0,1,2].map(i=>({id:'still'+i,kind:'image',aspect:'9:16'})));w.STUDIO.assets=assets;w.STUDIO.plan=assets.map((a,i)=>({scene:i,start:i*8,duration:8,assetId:a.id}));w.studioPaintPlan();await tick();await tick();const unchanged=w.document.querySelector('[data-shot="2"]');let attempts=[];
 w.genVideoForSlot=async n=>{attempts.push(n);if(n===1){w.vidState[n]='error';w.vidErrMsg[n]='provider failed';return;}const video={id:'video'+n,kind:'video'};assets.push(video);w.vids[n]={assetId:video.id};w.vidState[n]='done';};
 await w.studioGenerateMissing();await tick();await tick();assert.deepEqual(attempts,[0,1,2]);assert.equal(w.STUDIO.plan[1].assetId,'still1');assert.match(w.document.getElementById('sceneBatchProgress').textContent,/2 de 3/);assert.match(w.document.getElementById('sceneBatchProgress').textContent,/provider failed/);assert.equal(w.STUDIO.batch,false);
 const card=w.document.querySelector('[data-shot="0"]');const media=card.querySelector('video');w.studioPaintPlan();await tick();assert.equal(w.document.querySelector('[data-shot="0"]'),card);assert.equal(card.querySelector('video'),media);
 }finally{a.close();}
});

test('montage progress and errors appear beside the original start button, recovery only for a saved render',async()=>{
 const a=await app();try{const {w}=a;w.lastRes=episode(w);w.updUnifyCard();assert.equal(w.document.getElementById('resumeRender').hidden,true);
 w.STUDIO.busy=true;await w.unifyVideo();assert.match(w.document.getElementById('unifyErr').textContent,/generación en curso/);w.STUDIO.busy=false;
 w.studioRenderVideo=async()=>{w.studioMontageMessage('Montando los clips');assert.equal(w.document.getElementById('unifySt').style.display,'block');throw Error('render failure');};
 await w.unifyVideo();assert.match(w.document.getElementById('unifyFeedback').textContent,/render failure/);assert.equal(w.document.getElementById('bunify').disabled,false);
 w.lastRes.renders={es:{jobId:'saved'}};w.UNIFY_LANG='es';w.updUnifyCard();assert.equal(w.document.getElementById('resumeRender').hidden,false);
 }finally{a.close();}
});
test('coverage redistributes available clip time and plans missing coverage before starting a paid render',async()=>{
 const a=await app();try{const {w}=a;w.lastRes=episode(w);w.STUDIO.plan=[{scene:0,start:0,duration:20,description:'Adulto trabajando',assetId:'a'},{scene:1,start:20,duration:10,description:'Adulto decidiendo',assetId:'b'}];
 const linked=[{object:'a',duration:8},{object:'b',duration:10}],shots=[{object:'a',duration:20},{object:'b',duration:10}];await w.studioFitMontageCoverage(shots,linked,30);assert.equal(shots[0].duration,16);assert.equal(shots[1].duration,14);
 await assert.rejects(w.studioFitMontageCoverage(shots,linked,40),/Preparé 1 toma nueva/);assert.equal(w.STUDIO.plan.length,3);assert.equal(w.STUDIO.plan[0].assetId,'a');assert.equal(w.STUDIO.plan[2].assetId,'');await tick();await tick();
 }finally{a.close();}
});
test('actual narration pace feeds the next script duration estimate',async()=>{
 const a=await app();try{const {w}=a;w.studioRememberSpeech({dur:80},Array(148).fill('palabra').join(' '));assert.equal(w.studioSpeechRate(),1.85);assert.equal(Math.round(60*w.studioSpeechRate()),111);}finally{a.close();}
});
