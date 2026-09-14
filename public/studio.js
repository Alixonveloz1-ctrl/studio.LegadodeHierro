// Personal production studio: saved work, automatic script direction and reusable shots.
var STUDIO={assets:[],plan:[],imageRefs:{},imageSaves:{},audioJobs:{},uploadedAudio:{},videoOps:{},versions:{},saveQueue:Promise.resolve(),busy:false};
function studioEl(id){return document.getElementById(id);}
function studioMessage(message,error){var el=studioEl('studioStatus');if(el){el.hidden=!message;el.textContent=message;el.className='studio-status'+(error?' studio-error':'');}}
async function studioAPI(action,data,endpoint){
  var r=await fetch(endpoint||'/api/studio',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(57000),body:JSON.stringify(Object.assign({action:action},data||{}))});
  var d=await r.json().catch(function(){return {};});
  if(!r.ok){var e=new Error(d.error||'No se pudo completar esta etapa (HTTP '+r.status+'). Lo guardado se conserva.');e.status=r.status;e.storageRateLimited=d.storageRateLimited===true;e.retryAfterMs=Number(d.retryAfterMs)||0;throw e;}
  return d;
}
function studioOptions(mode,seconds,topic,theme){
  mode=mode||sMode;
  topic=topic===undefined?(studioEl('conc').value||''):topic;
  var idea=typeof TREND_IDEAS!=='undefined'?TREND_IDEAS.find(function(it){return LH.norm(it.concept)===LH.norm(topic);}):null;
  var family=LH.familyFor(mode),research=idea?LH.researchBrief(idea):null;
  if(research&&mode!=='profesor'&&mode!=='relato'&&mode!=='historia')family=research.family;
  var audience=research?research.audience:LH.audienceFor(topic,theme||sT);
  return {audience:audience,family:family,platform:'facebook',seconds:Number(seconds||sD),
    referenceId:family==='identidad'&&/reto|ano|dias/.test(LH.norm(topic))?'lh-reto':'auto',research:research,referenceVideo:idea&&idea.videoUrl||'',referenceAnalysis:idea&&idea.analysis||null};
}
async function studioPrepareReference(context){
  var options=context.editorial||{},url=options.referenceVideo;if(!url)return '';
  var analysis=options.referenceAnalysis;
  if(!analysis){
    studioMessage('Analizando la apertura, el desarrollo y el cierre del video de referencia…');
    try{
      var data=await studioAPI('analyze',{videoUrl:url},'/api/trends');analysis=data.analysis;
      if(!analysis||!LH.researchBrief(analysis))throw new Error('Análisis incompleto.');
      options.referenceAnalysis=analysis;
      TREND_IDEAS.forEach(function(it){if(it.videoUrl===url)it.analysis=analysis;});saveTrendIdeas();
    }catch(e){
      if(e.status===401)throw e;
      options.referenceAnalysis=null;options.referenceNotice='No se pudo leer el video; se utilizó la estructura propuesta por la búsqueda.';
      var notice=studioEl('trendErr');notice.textContent=options.referenceNotice;notice.style.display='block';
      return '';
    }
  }
  return '\nANÁLISIS AUDIOVISUAL DE REFERENCIA (hasta 180 segundos): '+JSON.stringify({structure:LH.researchBrief(analysis),visualRhythm:analysis.visualRhythm,observations:analysis.observations})
    +'\nAdapta las funciones observadas al TEMA ORIGINAL de esta idea y a la duración solicitada. Mantén la voz, personajes y estética de Legado de Hierro. No copies diálogos ni acontecimientos literales. El ritmo visual orienta las escenas del texto final. No inventes el cierre si no se observó.';
}
function studioPending(){try{return JSON.parse(localStorage.getItem('lh_pending_job')||'null');}catch(e){return null;}}
function studioRemember(pending){if(pending)localStorage.setItem('lh_pending_job',JSON.stringify(pending));else localStorage.removeItem('lh_pending_job');studioPaintPending();}
function studioPaintPending(){var el=studioEl('studioPending'),p=studioPending();if(el){el.hidden=!p;el.textContent=p?'Reanudar '+(p.label||'trabajo guardado'):'';}}
async function studioRunJob(config,requestId,onProgress){
  var d=await studioAPI('create',{config:config,requestId:requestId},'/api/studio-job');
  while(d.status!=='done'){
    if(onProgress)onProgress(d);
    d=await studioAPI('advance',{id:d.id},'/api/studio-job');
    if(d.busy)await new Promise(function(r){setTimeout(r,2500);});
  }
  if(onProgress)onProgress(d);return d.result;
}
async function studioEpisode(prompt,mode,seconds,context){
  var pending=studioPending(),reqId=nextUid();
  var config={type:'script',editorialVersion:2,prompt:prompt,mode:mode,seconds:seconds,sceneCount:imagenesDe(mode,String(seconds))};
  var info=context||{},meta={mode:mode,seconds:seconds,topic:info.topic||studioEl('conc').value,t:info.tO?info.tO.id:sT,h:info.hO?info.hO.id:sH,editorial:info.editorial||studioOptions(mode,seconds)};
  if(pending&&pending.config&&JSON.stringify(pending.config)===JSON.stringify(config))reqId=pending.requestId;
  studioRemember({requestId:reqId,config:config,meta:meta,label:'guion de '+(seconds<60?seconds+' segundos':seconds/60+' minutos')});
  var out=await studioRunJob(config,reqId,function(d){studioMessage(d.stage+' · '+d.completed+'/'+d.total+' etapas guardadas');var n=studioEl('gnote');if(n)n.textContent=d.stage;});
  out.studioRequestId=reqId;out.editorial=meta.editorial;
  studioMessage(out.quality&&out.quality.status==='needs_revision'?'Guion guardado. La revisión dejó ajustes para leer antes de narrar.':'Guion, revisión y escenas guardados.');
  // Keep the pointer until the episode itself is durably saved.
  return out;
}
async function studioResume(){
  var p=studioPending();if(!p||loading)return;
  loading=true;updGBtn();
  try{
    var out=await studioRunJob(p.config,p.requestId,function(d){studioMessage(d.stage+' · '+d.completed+'/'+d.total);});
    var m=p.meta;
    applySelection(m.mode,m.t,String(m.seconds),m.h);
    lastRes=Object.assign({},out,{uid:p.requestId,studioRequestId:p.requestId,topic:m.topic,modo:m.mode,editorial:m.editorial,
      tO:THEMES.find(function(t){return t.id===m.t;}),hO:HOOKS.find(function(h){return h.id===m.h;}),dO:DURS.concat(DURS_LARGAS).find(function(d){return d.id===String(m.seconds);})});
    resetReelAssets();saveHistory(lastRes);renderOut(lastRes);
  }catch(e){studioMessage(e.message,true);}finally{loading=false;updGBtn();}
}
async function studioEnglish(text){
  var id=lastRes?String(lastRes.uid):'english-session';
  var out=await studioRunJob({type:'english',text:text},id+'-english',function(d){studioMessage(d.stage+' · '+d.completed+'/'+d.total);});
  return out.text;
}
function studioProjectSnapshot(res){
  var p={};['uid','topic','a','f','c','cRaw','set','montaje','nTomas','nEjemplos','modo','tO','dO','hO','sem','editorial','editorialPlan','quality','draftA','studioRequestId'].forEach(function(k){if(res[k]!==undefined)p[k]=res[k];});
  return p;
}
function studioSaveProject(res,extra){
  if(!res||!res.uid)return Promise.resolve();
  var id=String(res.uid),snapshot=Object.assign(studioProjectSnapshot(res),extra||{});
  // Serialize writes from captions, voice and images. They update only their fields.
  STUDIO.saveQueue=STUDIO.saveQueue.catch(function(){}).then(async function(){
    var d=await studioAPI('project-save',{id:id,project:snapshot,version:STUDIO.versions[id]});STUDIO.versions[id]=d.version;
    if(res.studioRequestId&&studioPending()&&studioPending().requestId===res.studioRequestId)studioRemember(null);
  }).catch(function(e){studioMessage('El proyecto sigue en este dispositivo, pero falta guardar en la nube: '+e.message,true);throw e;});
  // Existing handlers may not await; avoid losing the visible error to an unhandled rejection.
  STUDIO.saveQueue.catch(function(){});return STUDIO.saveQueue;
}
async function studioLoadAll(action){
  var out=[],cursor='';do{var d=await studioAPI(action,{cursor:cursor});out=out.concat(d.items||[]);cursor=d.cursor||'';}while(cursor);return out;
}
async function studioLoadLibrary(){
  studioMessage('Leyendo la biblioteca...');
  STUDIO.assets=await studioLoadAll('assets');
  studioMessage('');
  await studioLibraryStatus();await studioPaintLibrary();loadMusicList();
}
function studioMedia(asset,url){
  var el=document.createElement(asset.kind==='image'?'img':asset.kind==='music'?'audio':'video');
  if(asset.kind==='image'){el.loading='lazy';el.alt=asset.title||asset.description||'Material de la biblioteca';}
  else{el.controls=true;el.preload='none';if(asset.kind==='video'){el.playsInline=true;el.muted=true;}}
  el.src=url;return el;
}
var STUDIO_PAGE=0;
var STUDIO_LIBRARY_LINKS={},STUDIO_LIBRARY_PAINT=0;
async function studioLibraryLinks(rows){
  var missing=rows.filter(function(a){return !STUDIO_LIBRARY_LINKS[a.id]||STUDIO_LIBRARY_LINKS[a.id].expires<Date.now();});
  for(var i=0;i<missing.length;i+=100){
    var d=await studioAPI('links',{ids:missing.slice(i,i+100).map(function(a){return a.id;})});
    (d.items||[]).forEach(function(a){STUDIO_LIBRARY_LINKS[a.id]={url:a.url,expires:Date.now()+300000};});
  }
  return STUDIO_LIBRARY_LINKS;
}
async function studioPaintLibrary(){
  var grid=studioEl('libraryGrid');if(!grid)return;
  var paint=++STUDIO_LIBRARY_PAINT;
  var q=LH.norm(studioEl('librarySearch').value),kind=studioEl('libraryKind').value;
  var rows=STUDIO.assets.filter(function(a){return !a.archived&&(!kind||a.kind===kind)&&(!q||LH.norm([a.title,a.description,a.location,a.action,(a.tags||[]).join(' '),a.collection].join(' ')).includes(q));});
  rows.sort(function(a,b){return (b.createdAt||'').localeCompare(a.createdAt||'')||a.id.localeCompare(b.id);});
  STUDIO_PAGE=Math.min(STUDIO_PAGE,Math.max(0,Math.ceil(rows.length/8)-1));
  var page=rows.slice(STUDIO_PAGE*8,STUDIO_PAGE*8+8);
  studioEl('libraryCount').textContent=rows.length+' materiales'+(rows.length?' · '+(STUDIO_PAGE*8+1)+'–'+(STUDIO_PAGE*8+page.length):'');
  studioEl('libraryPrev').disabled=STUDIO_PAGE===0;studioEl('libraryNext').disabled=(STUDIO_PAGE+1)*8>=rows.length;
  studioEl('libraryPrev').parentElement.hidden=rows.length<=8;
  if(!page.length){
    grid.innerHTML='';var empty=document.createElement('div');empty.className='studio-library-empty';
    var title=document.createElement('strong');title.textContent=q||kind?'No hay material en esta selección':'Tu biblioteca empieza aquí';empty.appendChild(title);
    var help=document.createElement('p');help.textContent=q||kind?'Prueba otra búsqueda o tipo de archivo.':'Organiza lo que ya generaste o crea las escenas preparadas para el canal.';empty.appendChild(help);
    if(!q&&!kind){var create=document.createElement('button');create.textContent='Ver escenas para crear';create.onclick=function(){studioLibraryView('create');};empty.appendChild(create);}
    grid.appendChild(empty);return;
  }
  var links=await studioLibraryLinks(page);if(paint!==STUDIO_LIBRARY_PAINT)return;
  grid.innerHTML='';page.forEach(function(a){grid.appendChild(studioAssetCard(a,links[a.id]&&links[a.id].url));});
}
function studioInput(label,value,type){
  var l=document.createElement('label');l.appendChild(document.createTextNode(label));var input=document.createElement(type==='textarea'?'textarea':'input');
  if(type!=='textarea')input.type=type||'text';input.value=value||'';l.appendChild(input);return {label:l,input:input};
}
function studioAssetCard(asset,url){
  var card=document.createElement('article');card.className='studio-media-tile';card.dataset.assetId=asset.id;
  var preview=document.createElement('button');preview.className='studio-tile-preview';preview.setAttribute('aria-label','Abrir '+(asset.title||'material'));
  if(url&&asset.kind!=='music'){
    var media=studioMedia(asset,asset.kind==='video'?url.split('#')[0]+'#t=0.1':url);media.removeAttribute('controls');
    if(asset.kind==='video')media.preload='metadata';media.tabIndex=-1;preview.appendChild(media);
  }else{var icon=document.createElement('span');icon.className='studio-tile-symbol';icon.textContent=asset.kind==='music'?'♫':'▧';icon.setAttribute('aria-hidden','true');preview.appendChild(icon);}
  var kind=document.createElement('span');kind.className='studio-tile-kind';kind.textContent=asset.kind==='video'?'▶ Video':asset.kind==='music'?'Música':'Imagen';preview.appendChild(kind);
  preview.onclick=function(){studioOpenAsset(asset);};card.appendChild(preview);
  var title=document.createElement('strong');title.className='studio-tile-title';title.textContent=asset.title||'Material guardado';card.appendChild(title);
  var meta=document.createElement('span');meta.className='studio-tile-meta';meta.textContent=[asset.aspect,asset.favorite?'★ Favorito':''].filter(Boolean).join(' · ');card.appendChild(meta);
  return card;
}
async function studioOpenAsset(asset){
  var dialog=studioEl('libraryViewer'),box=studioEl('libraryViewerContent');
  studioEl('libraryViewerTitle').textContent=asset.title||'Vista previa';box.textContent='Cargando vista previa…';dialog.showModal();
  try{
    var links=await studioLibraryLinks([asset]);if(!dialog.open)return;
    if(!links[asset.id])throw new Error('No se pudo abrir este archivo. Actualiza la biblioteca.');
    box.innerHTML='';box.appendChild(studioAssetDetails(asset,links[asset.id].url));
  }catch(e){box.textContent=e.message;}
}
function studioAssetDetails(asset,url){
  var card=document.createElement('div');card.className='studio-asset';card.appendChild(studioMedia(asset,url));
  var title=document.createElement('strong');title.textContent=asset.title||'Material pendiente de organizar';card.appendChild(title);
  var description=document.createElement('p');description.textContent=asset.description||'Gemini preparará su descripción al organizar la biblioteca.';card.appendChild(description);
  var details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Ajustar descripción (opcional)';details.appendChild(summary);
  var name=studioInput('Título',asset.title),desc=studioInput('Descripción',asset.description,'textarea');details.appendChild(name.label);details.appendChild(desc.label);
  var save=document.createElement('button');save.textContent='Guardar ajuste';save.onclick=async function(){save.disabled=true;try{
    var d=await studioAPI('asset-save',{object:asset.object,legacy:true,asset:Object.assign({},asset,{title:name.input.value,description:desc.input.value,catalogSource:'manual'})});
    asset=d.asset;title.textContent=asset.title;description.textContent=asset.description;details.open=false;
    STUDIO.assets=STUDIO.assets.filter(function(a){return a.id!==asset.id;}).concat(asset);studioEl('libraryViewerTitle').textContent=asset.title;await studioPaintLibrary();await studioPaintRecipes();
  }catch(e){studioLibraryMessage(e.message,true);}finally{save.disabled=false;}};details.appendChild(save);card.appendChild(details);
  var favorite=document.createElement('button');favorite.className='studio-favorite';favorite.textContent=asset.favorite?'★ Favorito':'☆ Marcar favorito';favorite.onclick=async function(){favorite.disabled=true;try{
    var d=await studioAPI('asset-save',{object:asset.object,legacy:true,asset:{favorite:!asset.favorite}});asset=d.asset;
    STUDIO.assets=STUDIO.assets.filter(function(a){return a.id!==asset.id;}).concat(asset);favorite.textContent=asset.favorite?'★ Favorito':'☆ Marcar favorito';await studioPaintLibrary();
  }catch(e){studioLibraryMessage(e.message,true);}finally{favorite.disabled=false;}};card.appendChild(favorite);
  if(asset.kind==='music'){var use=document.createElement('button');use.textContent='Usar como música del canal';use.onclick=function(){localStorage.setItem('lh_music_sel',asset.object);musicLoaded=false;loadMusicList();};card.appendChild(use);}
  return card;
}
async function studioUploadBlob(blob,metadata,narration){
  var mime=blob.type||'video/mp4';if(mime==='audio/x-wav')mime='audio/wav';
  var t=await studioAPI('upload',{mime:mime,size:blob.size,narration:!!narration});
  var r=await fetch(t.url,{method:'PUT',headers:{'Content-Type':mime},body:blob});
  if(!r.ok)throw new Error('No se pudo subir el archivo al almacenamiento (HTTP '+r.status+').');
  if(narration)return {object:t.object};
  var d=await studioAPI('asset-save',{object:t.object,asset:metadata});
  STUDIO.assets=STUDIO.assets.filter(function(a){return a.id!==d.asset.id;}).concat(d.asset);return d.asset;
}
async function studioCatalogMusic(track,description){
  var d=await studioAPI('asset-save',{object:track.object,asset:{kind:'music',title:track.name,description:description,collection:'Música del canal'}});
  STUDIO.assets=STUDIO.assets.filter(function(a){return a.id!==d.asset.id;}).concat(d.asset);
}
async function studioUploadFiles(){
  var files=Array.from(studioEl('libraryFiles').files||[]);if(!files.length)return;
  var objects=[];
  for(var i=0;i<files.length;i++){
    studioLibraryMessage('Guardando archivo '+(i+1)+' de '+files.length);
    var asset=await studioUploadBlob(files[i],{kind:files[i].type.startsWith('audio/')?'music':files[i].type.startsWith('image/')?'image':'video',collection:'Mis archivos'});objects.push(asset.object);
  }
  studioEl('libraryFiles').value='';await studioPaintLibrary();musicLoaded=false;loadMusicList();
  return studioLibraryStart({type:'catalog',objects:objects});
}
function studioSaveImage(src,description,index,extra){
  var previous=STUDIO.imageSaves[src]||Promise.resolve();
  var pending=previous.catch(function(){}).then(function(){return studioSaveImageNow(src,description,index,extra);});
  STUDIO.imageSaves[src]=pending;
  pending.finally(function(){if(STUDIO.imageSaves[src]===pending)delete STUDIO.imageSaves[src];}).catch(function(){});
  return pending;
}
async function studioSaveImageNow(src,description,index,extra){
  if(STUDIO.imageRefs[src]){
    var existing=STUDIO.imageRefs[src];
    if(extra||existing.description!==description){var updated=await studioAPI('asset-save',{object:existing.object,asset:Object.assign({},existing,extra||{},{description:description})});existing=updated.asset;STUDIO.imageRefs[src]=existing;STUDIO.assets=STUDIO.assets.filter(function(a){return a.id!==existing.id;}).concat(existing);}
    if(imgs[index]&&imgs[index].src===src){imgs[index].object=existing.object;imgs[index].assetId=existing.id;await studioPersistAssets();}
    return existing;
  }
  var owner=lastRes,blob=await (await fetch(src)).blob();
  var asset=await studioUploadBlob(blob,Object.assign({title:(owner?owner.topic:'Imagen')+' · '+(index+1),description:description,kind:'image',aspect:imgFmt,sourceProject:owner?String(owner.uid):'',character:'',collection:'Generado en el estudio'},extra||{}));
  STUDIO.imageRefs[src]=asset;
  if(owner===lastRes&&imgs[index]&&imgs[index].src===src){imgs[index].object=asset.object;imgs[index].assetId=asset.id;await studioPersistAssets();}
  return asset;
}
async function studioRegisterVideo(video,description,index){
  var u=new URL(video.remoteUrl),segments=u.pathname.split('/').slice(2),object=segments.map(decodeURIComponent).join('/');
  var d=await studioAPI('asset-save',{object:object,asset:{title:(lastRes?lastRes.topic:'Video')+' · '+(index+1),description:description,kind:'video',aspect:vidFmt,sourceProject:lastRes?String(lastRes.uid):'',collection:'Clips del canal'}});
  video.object=d.asset.object;video.assetId=d.asset.id;
  STUDIO.assets=STUDIO.assets.filter(function(a){return a.id!==d.asset.id;}).concat(d.asset);await studioPersistAssets();
}
function studioPersistAssets(){
  return studioSaveProject(lastRes,{images:imgs.map(function(a){return a&&a.object?{object:a.object,assetId:a.assetId}:null;}),videos:vids.map(function(a){return a&&a.object?{object:a.object,assetId:a.assetId}:null;}),plan:STUDIO.plan,audioJobs:STUDIO.audioJobs,uploadedAudio:STUDIO.uploadedAudio,videoOps:STUDIO.videoOps});
}
async function studioRestoreAssets(item){
  if(!lastRes)return;var owner=lastRes;
  try{
    var d=await studioAPI('project-get',{id:String(owner.uid)});if(owner!==lastRes||!d.project)return;
    var p=d.project;STUDIO.versions[String(owner.uid)]=p.version;
    if(p.plan&&p.plan.length&&!STUDIO.assets.length)STUDIO.assets=await studioLoadAll('assets');
    if(owner!==lastRes)return;
    STUDIO.plan=p.plan||[];STUDIO.audioJobs=p.audioJobs||{};STUDIO.uploadedAudio=p.uploadedAudio||{};STUDIO.videoOps=p.videoOps||{};owner.renders=p.renders||{};
    studioHydrateCaptions(p);
    studioRestoreEditorial(p.editorial);
    var ids=(p.images||[]).concat(p.videos||[]).filter(Boolean).map(function(a){return a.assetId;}).filter(Boolean);
    var linked=ids.length?(await studioAPI('links',{ids:ids})).items:[],map={};linked.forEach(function(a){map[a.id]=a;});
    if(owner!==lastRes)return;
    imgs=(p.images||[]).map(function(a,i){return a&&map[a.assetId]?Object.assign({},a,{src:map[a.assetId].url,idx:i+1}):null;});
    vids=(p.videos||[]).map(function(a){return a&&map[a.assetId]?Object.assign({},a,{url:map[a.assetId].url,remoteUrl:map[a.assetId].url}):null;});
    vidState=vids.map(function(v){return v?'done':'idle';});
    Object.keys(STUDIO.videoOps).forEach(function(i){vidState[i]='error';vidErrMsg[i]='Hay una animación iniciada. Reintentar consulta su resultado sin iniciar otra.';});
    studioPaintCurrentImages();studioPaintPlan();updUnifyCard();
    if(STUDIO.audioJobs.es||STUDIO.audioJobs.en||STUDIO.uploadedAudio.es||STUDIO.uploadedAudio.en)studioMessage('Proyecto restaurado. Usa “Recuperar narración” para continuar con su voz guardada. “Generar audio” utiliza los ajustes de voz que elijas ahora.');
  }catch(e){studioMessage('No se pudieron restaurar los materiales: '+e.message,true);}
}
async function studioOpenProjects(){
  var rows=await studioLoadAll('projects'),grid=studioEl('projectList');grid.innerHTML='';
  rows.sort(function(a,b){return b.updatedAt.localeCompare(a.updatedAt);}).forEach(function(row){
    var b=document.createElement('button');b.textContent=row.topic||'Proyecto guardado';b.onclick=function(){studioGuard(async function(){
      if(loading)throw new Error('Espera a que termine la etapa actual.');
      var d=await studioAPI('project-get',{id:row.id});if(!d.project)throw new Error('No se encontró el proyecto.');
      lastRes=d.project;lastRes.uid=row.id;STUDIO.versions[row.id]=d.project.version;
      applySelection(lastRes.modo,lastRes.tO&&lastRes.tO.id,lastRes.dO&&lastRes.dO.id,lastRes.hO&&lastRes.hO.id);
      resetReelAssets();studioRestoreEditorial(lastRes.editorial);studioEl('conc').value=lastRes.topic||'';renderOut(lastRes);await studioRestoreAssets();
    });};grid.appendChild(b);
  });
}
function studioPaintCurrentImages(){
  var grid=studioEl('igrid');grid.innerHTML='';imgs.forEach(function(a,i){if(!a)return;var div=document.createElement('div');grid.appendChild(div);setSlotOk(div,a.src,i);});
}
async function studioBuildPlan(){
  if(!lastRes)throw new Error('Genera o restaura un guion primero.');
  var owner=lastRes;if(!STUDIO.assets.length)await studioLoadLibrary();if(owner!==lastRes)return;
  var audio=unifyLang()==='en'?audEN:audES,duration=audio&&audio.dur||Number(lastRes.dO&&lastRes.dO.id)||60;
  var scenes=LH.scenePlan(lastRes,duration,imgFmt);
  STUDIO.plan=LH.selectPlan(scenes,STUDIO.assets);studioPaintPlan();await studioPersistAssets();
  var gaps=STUDIO.plan.filter(function(p){return !p.assetId;}).length;
  studioMessage(gaps?'Plan preparado: '+gaps+' tomas necesitan material. Puedes elegirlo, importarlo o generarlo.':STUDIO.plan.length+' tomas elegidas. Revisa la secuencia antes de montar; no se generó contenido nuevo.');
}
function studioPaintPlan(){
  var grid=studioEl('scenePlan');if(!grid)return;grid.innerHTML='';
  STUDIO.plan.forEach(function(p,i){
    var row=document.createElement('div');row.className='studio-shot';
    var title=document.createElement('strong');title.textContent=(i+1)+' · '+p.start.toFixed(1)+'–'+(p.start+p.duration).toFixed(1)+' s';row.appendChild(title);
    var text=document.createElement('p');text.textContent=p.description;row.appendChild(text);
    if(p.narration){var spoken=document.createElement('details'),heading=document.createElement('summary'),words=document.createElement('p');heading.textContent='Texto que acompaña a esta escena';words.textContent=p.narration;spoken.appendChild(heading);spoken.appendChild(words);row.appendChild(spoken);}
    var reason=document.createElement('p');reason.textContent=p.reason;reason.className=p.assetId?'':'studio-gap';row.appendChild(reason);
    var select=document.createElement('select');select.setAttribute('aria-label','Material de la toma '+(i+1));select.add(new Option('Elegir material para esta toma',''));
    var search=studioInput('Buscar otro material para esta toma','','search');row.appendChild(search.label);
    function choices(){
      var q=LH.norm(search.input.value),ids=(p.alternatives||[]).concat(p.assetId?[p.assetId]:[]);
      var candidates=STUDIO.assets.filter(function(a){return !a.archived&&a.kind!=='music'&&(!a.aspect||a.aspect===p.aspect)&&(q?LH.norm([a.title,a.description,(a.tags||[]).join(' ')].join(' ')).includes(q):ids.includes(a.id));}).slice(0,25);
      var selected=STUDIO.assets.find(function(a){return a.id===p.assetId;});if(selected&&!candidates.some(function(a){return a.id===selected.id;}))candidates.unshift(selected);
      select.innerHTML='';select.add(new Option('Elegir material para esta toma',''));
      candidates.forEach(function(a){var o=new Option((a.kind==='video'?'Video · ':'Imagen · ')+(a.title||a.description),a.id);o.selected=p.assetId===a.id;select.add(o);});
    }
    search.input.oninput=choices;choices();
    select.onchange=function(){p.assetId=select.value;p.reason='Selección manual';studioPersistAssets();};row.appendChild(select);
    var preview=document.createElement('button');preview.textContent='Ver toma';preview.onclick=async function(){try{if(!p.assetId)return;var a=(await studioAPI('links',{ids:[p.assetId]})).items[0];var old=row.querySelector('.studio-plan-preview');if(old)old.remove();var box=document.createElement('div');box.className='studio-plan-preview studio-asset';box.appendChild(studioMedia(a,a.url));row.appendChild(box);}catch(e){studioMessage(e.message,true);}};row.appendChild(preview);
    grid.appendChild(row);
  });
}
function studioRenderEpisode(res){
  studioEl('episodeTools').hidden=false;
  var n=LH.words(res.a).length,seconds=Number(res.dO&&res.dO.id)||60;
  var notes=[n+' palabras · '+Math.round(n/2.35)+' s estimados; el montaje usará el audio medido.'];
  if(n/2.35<seconds*.75||n/2.35>seconds*1.3)notes.push('Revisa la duración: el texto se aleja del objetivo.');
  if(/comenta\s+["“']?(yo puedo|si|am[eé]n)|asesor[ií]as?\s+(completamente\s+)?gratis/i.test(res.a))notes.push('Revisa el cierre: ofrece utilidad dentro del video y evita recompensas por comentar.');
  studioEl('scriptReview').textContent=notes.join('\n');studioEl('scriptEdit').value=res.a;
  studioPaintQuality(res);
}
function studioPaintQuality(res){
  var planBox=studioEl('editorialPlan'),reviewBox=studioEl('qualityReview'),plan=res.editorialPlan;
  planBox.replaceChildren();reviewBox.replaceChildren();
  if(plan){
    var planTitle=document.createElement('h3');planTitle.textContent='Promesa y desarrollo';planBox.appendChild(planTitle);
    [plan.audienceMoment,plan.promise,'Resolución prevista: '+plan.payoff].forEach(function(t){var p=document.createElement('p');p.textContent=t;planBox.appendChild(p);});
    var details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Aperturas y secuencia del plan inicial';details.appendChild(summary);
    (plan.hooks||[]).forEach(function(h,i){var p=document.createElement('p');p.textContent=(i+1)+'. '+h.text+' — '+h.why+(i===plan.selectedHook?' (elegida en el plan)':'');details.appendChild(p);});
    (plan.sections||[]).forEach(function(s,i){var p=document.createElement('p');p.textContent='Parte '+(i+1)+': '+s.title+'. '+s.beat;details.appendChild(p);});planBox.appendChild(details);
  }
  var q=res.quality,current=q&&q.scriptFingerprint===LH.fingerprint(res.a);
  var note=document.createElement('p');note.className='studio-status';
  if(!current)note.textContent='Esta versión del texto aún no tiene revisión editorial. Guarda los cambios y pulsa «Revisar el guion guardado».';
  else{
    note.textContent=(q.status==='needs_revision'?'Quedan ajustes para revisar: ':'Revisión completada: ')+q.summary;
    if(q.status==='needs_revision')note.classList.add('studio-error');
    if((q.rewrittenSections||[]).length)note.textContent+=' Se mejoraron las partes '+q.rewrittenSections.join(', ')+'.';
  }
  reviewBox.appendChild(note);
  if(current)(q.checks||[]).forEach(function(c){
    var detail=document.createElement('details'),heading=document.createElement('summary');
    heading.textContent=(c.status==='ok'?'Cumple · ':'Revisar · ')+(LH.CRITERIA[c.criterion]||c.criterion);detail.appendChild(heading);
    var evidence=document.createElement('blockquote');evidence.textContent='«'+c.evidence+'»';detail.appendChild(evidence);
    var reason=document.createElement('p');reason.textContent=c.reason+(c.fix?' Cambio sugerido: '+c.fix:'');detail.appendChild(reason);reviewBox.appendChild(detail);
  });
  studioEl('scriptDraftBox').hidden=!res.draftA;studioEl('scriptDraft').textContent=res.draftA||'';
}
async function studioReviewScript(){
  if(!lastRes)throw new Error('Abre un proyecto primero.');
  var owner=lastRes,text=owner.a,seconds=Number(owner.dO&&owner.dO.id)||60;
  if(studioEl('scriptEdit').value.trim()!==text.trim())throw new Error('Guarda primero el texto que estás editando.');
  var options=owner.editorial||studioOptions(owner.modo,seconds,owner.topic,owner.tO&&owner.tO.id);
  var config={type:'review',text:text,prompt:LH.editorial(options)+'\nTema: '+owner.topic+'\nDuración prevista: '+seconds+' segundos.',plan:owner.editorialPlan||{}};
  var out=await studioRunJob(config,String(owner.uid)+'-review',function(d){studioMessage('Revisando el guion guardado. Puedes repetir este botón para recuperar la misma revisión si se interrumpe.');});
  if(lastRes!==owner||owner.a!==text)return;
  owner.quality=out.quality;owner.editorial=options;
  guardarEnReel({quality:out.quality,editorial:options});await studioSaveProject(owner);studioPaintQuality(owner);
  studioMessage('Revisión guardada. Lee los ajustes antes de producir la narración.');
}
async function studioEditScript(){
  if(!lastRes)throw new Error('Genera un guion primero.');
  var text=studioEl('scriptEdit').value.trim();if(text.length<20)throw new Error('El guion está vacío.');
  lastRes.a=text;lastRes.f='';audES=null;audEN=null;STUDIO.audioJobs={};STUDIO.uploadedAudio={};STUDIO.plan=[];
  finalVid=null;FINALES={es:null,en:null};lastRes.renders={};
  var patch={a:text,f:'',quality:null,audioJobs:{},uploadedAudio:{},renders:{},plan:[],caption:'',tags:'',tiktok:'',youtube:'',captionEN:'',tagsEN:'',tiktokEN:'',youtubeEN:''};
  Object.assign(lastRes,patch);studioHydrateCaptions(patch);guardarEnReel(patch);await studioSaveProject(lastRes,patch);
  ['rES','rEN','unifyRes','capBox'].forEach(function(id){studioEl(id).style.display='none';});
  studioEl('unifyRes').innerHTML='';studioPaintPlan();rfTabs(lastRes);studioRenderEpisode(lastRes);updUnifyCard();
  studioMessage('Guion actualizado. Revisa las escenas y genera la narración de esta versión.');
}

async function studioAudio(lang,recover){
  if(!lastRes)throw new Error('Genera un guion primero.');
  var owner=lastRes,text=lang==='en'?owner.f:owner.a;if(!text)throw new Error('Falta el guion de este idioma.');
  var config={type:'audio',text:text,engine:VOX.engine,voice:JSON.parse(JSON.stringify(VOX[VOX.engine]||{})),lang:lang};
  // Persist the exact settings. A restore must not silently pick another voice.
  var existing=STUDIO.audioJobs[lang];
  if(recover){if(!existing||existing.text!==text)throw new Error('No hay una narración guardada para esta versión del guion.');config=existing;}
  STUDIO.audioJobs[lang]=config;delete STUDIO.uploadedAudio[lang];await studioPersistAssets();
  var out=await studioRunJob(config,String(owner.uid)+'-audio-'+lang,function(d){studioMessage(d.stage+' · '+d.completed+'/'+d.total+' tramos guardados');studioEl('ast').textContent=d.stage;});
  var audio=await studioReadAudio(out,lang);
  if(owner!==lastRes)return;
  if(lang==='en')audEN=audio;else audES=audio;
  studioEl(lang==='en'?'pEN':'pES').src=audio.url;studioEl(lang==='en'?'dEN':'dES').href=audio.url;
  studioEl(lang==='en'?'rEN':'rES').style.display='block';invalidateVoiceMix();chkExport();updUnifyCard();
  studioMessage('Narración '+lang.toUpperCase()+' lista: '+Math.round(audio.dur)+' segundos reales. '+(audio.alignment?'Tiempos del proveedor conservados.':'Subtítulos estimados dentro de cada tramo medido; revisa su sincronía al escuchar.'));
  return audio;
}
function studioHydrateCaptions(p){
  lastCaption=p.caption||'';lastTags=p.tags||'';lastTikTok=p.tiktok||'';lastYouTube=p.youtube||'';
  lastCaptionEN=p.captionEN||'';lastTagsEN=p.tagsEN||'';lastTikTokEN=p.tiktokEN||'';lastYouTubeEN=p.youtubeEN||'';
  if(studioEl('capText'))studioEl('capText').textContent=lastCaption;
  if(studioEl('capTags'))studioEl('capTags').textContent=lastTags;
  if(lastCaption||lastTags){studioEl('capBox').style.display='block';pintarCaptionEN();}
}
function studioRestoreEditorial(options){
  // Restoring old editorial metadata must not change the user's media settings.
  wireGenSettings();
}
async function studioSaveUploadedAudio(audio,lang,name){
  if(!audio.audioObjects||!audio.audioObjects.length){var saved=await studioUploadBlob(audio.blob,{},true);audio.audioObjects=[saved.object];}
  STUDIO.uploadedAudio[lang]={object:audio.audioObjects[0],name:name||'Narración',text:lang==='en'?lastRes.f:lastRes.a,mime:audio.blob.type};
  delete STUDIO.audioJobs[lang];await studioPersistAssets();
}
async function studioRecoverAudio(lang){
  if(!lastRes)throw new Error('Abre un proyecto primero.');
  var owner=lastRes,saved=STUDIO.uploadedAudio[lang];
  if(!saved)return studioAudio(lang,true);
  if(saved.text!==(lang==='en'?owner.f:owner.a))throw new Error('Esta narración corresponde a otra versión del guion.');
  var linked=await studioAPI('narration-link',{id:String(owner.uid),lang:lang});
  var audio=await studioReadAudio({parts:[{object:saved.object,url:linked.url,text:saved.text}]},lang);
  if(owner!==lastRes)return;
  if(lang==='en')audEN=audio;else audES=audio;
  studioEl(lang==='en'?'pEN':'pES').src=audio.url;studioEl(lang==='en'?'dEN':'dES').href=audio.url;studioEl(lang==='en'?'rEN':'rES').style.display='block';
  invalidateVoiceMix();chkExport();updUnifyCard();studioMessage('Narración recuperada de tu archivo guardado.');
}
function studioShiftSRT(srt,offset,nextIndex){
  return srt.trim().split(/\n\s*\n/).filter(Boolean).map(function(block){
    var lines=block.split('\n');lines[0]=String(nextIndex.value++);
    lines[1]=lines[1].replace(/(\d+):(\d+):(\d+),(\d+)/g,function(_,h,m,s,ms){return fmtSRTTime(Number(h)*3600+Number(m)*60+Number(s)+Number(ms)/1000+offset);});return lines.join('\n');
  }).join('\n\n');
}
async function studioReadAudio(out,lang){
  // Decode only one small part at a time, at 24 kHz mono. Keep PCM bytes, not
  // dozens of floating-point AudioBuffers, in the iPhone's memory.
  var C=window.OfflineAudioContext||window.webkitOfflineAudioContext,ctx=new C(1,1,24000);
  var pcm=[],durations=[],alignments=[],srt=[],offset=0,nextIndex={value:1},tramos=[];
  for(var i=0;i<out.parts.length;i++){
    var p=out.parts[i],r=await fetch(p.url);if(!r.ok)throw new Error('No se pudo recuperar el tramo '+(i+1)+'. Vuelve a pulsar generar para recuperarlo.');
    var decoded=await ctx.decodeAudioData(await r.arrayBuffer()),buf=decoded;
    if(decoded.numberOfChannels>1){buf=ctx.createBuffer(1,decoded.length,decoded.sampleRate);var mono=buf.getChannelData(0);for(var channel=0;channel<decoded.numberOfChannels;channel++){var channelData=decoded.getChannelData(channel);for(var sample=0;sample<mono.length;sample++)mono[sample]+=channelData[sample]/decoded.numberOfChannels;}}
    var wave=audioBufferToWav(buf);
    // audioBufferToWav writes a standard 44-byte PCM header.
    pcm.push(wave.slice(44));durations.push(buf.duration);alignments.push(p.alignment);
    var v=tramoDeVoz(buf),local={dur:buf.duration,vozIni:v.ini,vozFin:v.fin,vozTramos:v.tramos};
    (v.tramos||[{ini:v.ini,fin:v.fin}]).forEach(function(t){tramos.push({ini:t.ini+offset,fin:t.fin+offset});});
    var sub=p.alignment?makeSRTFromAlignment(p.alignment):makeSRT(p.text,local,lang);
    srt.push(studioShiftSRT(sub,offset,nextIndex));offset+=buf.duration;
  }
  var bytes=pcm.reduce(function(n,b){return n+b.size;},0),h=new ArrayBuffer(44),dv=new DataView(h);
  function put(pos,s){for(var i=0;i<s.length;i++)dv.setUint8(pos+i,s.charCodeAt(i));}
  put(0,'RIFF');dv.setUint32(4,36+bytes,true);put(8,'WAVE');put(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,24000,true);dv.setUint32(28,48000,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);put(36,'data');dv.setUint32(40,bytes,true);
  var blob=new Blob([h].concat(pcm),{type:'audio/wav'});
  return {blob:blob,url:URL.createObjectURL(blob),dur:offset,vozIni:tramos.length?tramos[0].ini:0,vozFin:tramos.length?tramos[tramos.length-1].fin:offset,vozTramos:tramos,
    alignment:alignments.every(Boolean)?combineAlignments(alignments,durations):null,audioObjects:out.parts.map(function(p){return p.object;}),srt:srt.join('\n\n')+'\n',partsB64:[]};
}
async function studioPrepareMontage(audio){
  if(!audio.audioObjects||!audio.audioObjects.length){
    // Existing uploaded narration and old sessions are migrated once, directly
    // to storage, instead of posting a long base64 WAV through Vercel.
    await studioSaveUploadedAudio(audio,unifyLang(),'Narración importada');
  }
  var owner=lastRes,plan=STUDIO.plan,shots=[];
  if(plan.length){
    if(plan.some(function(s){return !s.assetId;}))throw new Error('Hay tomas sin material. Completa la biblioteca o selecciona un archivo para cada hueco.');
    var ids=Array.from(new Set(plan.map(function(s){return s.assetId;}))),linked=[];
    for(var k=0;k<ids.length;k+=50)linked=linked.concat((await studioAPI('links',{ids:ids.slice(k,k+50)})).items);
    var map={};linked.forEach(function(a){map[a.id]=a;});
    var planned=plan.reduce(function(n,s){return n+s.duration;},0);
    plan.forEach(function(s){var a=map[s.assetId];if(!a)throw new Error('Un material del plan ya no está disponible. Selecciónalo de nuevo.');shots.push({object:a.object,kind:a.kind,duration:s.duration/planned*audio.dur,assetId:a.id});});
  }else{
    var scenes=LH.scenePlan(owner,audio.dur,imgFmt);
    for(var i=0;i<scenes.length;i++){
      var sc=scenes[i],v=vids[sc.scene],im=imgs[sc.scene];
      if(v&&v.remoteUrl){if(!v.object)await studioRegisterVideo(v,owner.c[sc.scene],sc.scene);shots.push({kind:'video',object:v.object,duration:sc.duration,assetId:v.assetId});}
      else if(im&&im.src){if(!im.object){var a=await studioSaveImage(im.src,owner.c[sc.scene],sc.scene);im.object=a.object;im.assetId=a.id;}shots.push({kind:'image',object:im.object,duration:sc.duration,assetId:im.assetId});}
      else throw new Error('Falta material para la escena '+(sc.scene+1)+'. Elige una imagen o un video de la biblioteca, o genera esa escena.');
    }
  }
  return {shots:shots,audioObjects:audio.audioObjects,aspect:imgFmt};
}
async function studioRenderVideo(){
  if(!lastRes)throw new Error('Genera un guion primero.');
  var owner=lastRes,lang=unifyLang(),audio=lang==='en'?audEN:audES;
  if(!audio)throw new Error('Genera o sube la narración '+lang.toUpperCase()+' primero.');
  if(!audio.dur){var C=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new C(1,1,24000);audio.dur=(await c.decodeAudioData(await audio.blob.arrayBuffer())).duration;}
  var payload=await studioPrepareMontage(audio);payload.music=selectedMusic();payload.srt=audio.srt||(audio.alignment?makeSRTFromAlignment(audio.alignment):makeSRT(lang==='en'?owner.f:owner.a,audio,lang));
  payload.targetSeconds=Number(owner.dO&&owner.dO.id)||0;
  studioMessage('Enviando el montaje con archivos guardados...');
  var d=await studioAPI('start',payload,'/api/unify');
  var renders=owner.renders||{};renders[lang]={jobId:d.jobId,music:payload.music,legacy:!!d.legacy};owner.renders=renders;
  await studioSaveProject(owner,{renders:renders});
  return studioWatchRender(d.jobId,owner,lang);
}
async function studioWatchRender(id,owner,lang){
  for(var i=0;i<150;i++){
    var d=await studioAPI('status',{jobId:id},'/api/unify-status');
    if(d.done){
      if(d.error)throw new Error(d.error);
      if(owner!==lastRes)return;
      finalVid={url:d.videoUrl,remoteUrl:d.videoUrl,lang:lang,jobId:id};FINALES[lang]=finalVid;
      renderFinalVid();chkExport();studioEl('unifyRes').style.display='block';
      var notices=d.avisos||[];studioMessage('Video terminado · '+(d.duracion?d.duracion.toFixed(1)+' s':'')+(notices.length?'\nRevisa antes de publicar: '+notices.join(' · '):' · narración y montaje completos.'),!!notices.length);
      return;
    }
    studioMessage(d.stage||'Montaje en curso. El trabajo continúa en el servidor.');
    await new Promise(function(r){setTimeout(r,6000);});
  }
  studioMessage('El montaje sigue guardado. Puedes consultar su resultado desde este proyecto.');
}
async function studioResumeRender(){
  var lang=unifyLang(),r=lastRes&&lastRes.renders&&lastRes.renders[lang];
  if(!r)throw new Error('Este proyecto todavía no tiene un montaje iniciado en este idioma.');
  return studioWatchRender(r.jobId,lastRes,lang);
}
var STUDIO_LIBRARY={running:false,preparing:false,pause:false,job:null,draft:false,view:'saved'};
function studioLibraryMessage(text,error){var el=studioEl('libraryNotice');el.hidden=!text;el.textContent=text;el.className='studio-status'+(error?' studio-error':'');}
function studioLibraryView(view){
  STUDIO_LIBRARY.view=view;
  ['saved','create'].forEach(function(name){
    var selected=name===view,tab=studioEl(name==='saved'?'librarySavedTab':'libraryCreateTab');
    tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;studioEl(name==='saved'?'librarySavedView':'libraryCreateView').hidden=!selected;
  });
  if(view==='create')studioPaintRecipes();else studioPaintLibrary().catch(function(e){studioLibraryMessage(e.message,true);});
}
function studioLibrarySettings(){
  // Move the existing controls into this dialog; never create another set.
  var panel=studioEl('genSettings'),dialog=studioEl('librarySettingsDialog');
  STUDIO_LIBRARY.settingsHome={parent:panel.parentNode,next:panel.nextSibling};
  studioEl('librarySettingsContent').appendChild(panel);dialog.showModal();
}
function studioLibraryControls(){
  var locked=STUDIO_LIBRARY.running||STUDIO_LIBRARY.preparing;
  ['libraryCatalog','libraryImport','libraryUpload','recipeCategory','recipeBatchSize'].forEach(function(id){studioEl(id).disabled=locked;});
  // A running job has a saved configuration. Viewing or changing future
  // preferences must never be blocked by cataloging, copying or generation.
  ['selImgModel','selImgFmt','selVidModel','selVidFmt','librarySettings'].forEach(function(id){studioEl(id).disabled=false;});
  studioEl('libraryImportBusy').hidden=!locked;
  studioEl('libraryPause').hidden=!STUDIO_LIBRARY.running;
  if(!STUDIO_LIBRARY.running)studioEl('libraryPause').textContent='Pausar';
}
async function studioLibraryPaint(job){
  var previous=STUDIO_LIBRARY.job,changed=job&&job.lastAsset&&(!previous||!previous.lastAsset||previous.lastAsset.id!==job.lastAsset.id||previous.lastAsset.version!==job.lastAsset.version);
  STUDIO_LIBRARY.job=job;studioEl('libraryWork').hidden=!job;studioLibraryControls();
  if(job){
    if(job.lastAsset)STUDIO.assets=STUDIO.assets.filter(function(a){return a.id!==job.lastAsset.id;}).concat(job.lastAsset);
    var done=(job.completed||0)+(job.skipped||0)+(job.failed||0),progress=studioEl('libraryProgress');progress.max=Math.max(1,job.total||1);progress.value=done;
    if(job.discovering)progress.removeAttribute('value');
    var status=job.error||job.stage;
    if(job.type==='generate'&&job.recipeIds&&job.recipeIds.length){
      var saved=job.recipeIds.filter(function(id){return STUDIO.assets.some(function(a){return a.recipeId===id&&a.aspect===job.settings.aspect&&!a.archived;});}).length;
      // Older jobs did not store the full selection; their counters still survive.
      saved=Math.max(saved,(job.completed||0)+(job.skipped||0)+(job.lastAsset&&(job.pendingRecipeIds||[]).includes(job.lastAsset.recipeId)?1:0));
      status=saved+' de '+job.total+' imágenes guardadas';
      if(job.error)status+=' · '+job.error;
      else if(job.stopped)status+=' · Creación detenida';
      else if(job.status==='done')status+=' · '+(job.failed?'Hay '+job.failed+' sin completar':'Listas para reutilizar');
      else if(!STUDIO_LIBRARY.running)status+=' · Toca Continuar para seguir';
      else status+=' · '+(saved>done?'Preparando su descripción':'Creando la siguiente imagen');
    }
    studioEl('libraryWorkStatus').textContent=status;
    studioEl('libraryResume').hidden=STUDIO_LIBRARY.running||job.status==='done';
    studioEl('libraryStop').hidden=STUDIO_LIBRARY.running||job.status==='done';
    studioEl('libraryShowProgress').hidden=job.type!=='generate';
  }
  await studioPaintRecipes();
  if(changed&&STUDIO_LIBRARY.view==='saved')await studioPaintLibrary().catch(function(e){studioLibraryMessage('El archivo está guardado. No se pudo cargar su vista previa: '+e.message,true);});
}
async function studioLibraryStatus(){var d=await studioAPI('library-status');await studioLibraryPaint(d.job||null);}
async function studioLibraryWait(ms){
  var end=Date.now()+ms;
  while(!STUDIO_LIBRARY.pause&&Date.now()<end)await new Promise(function(resolve){setTimeout(resolve,Math.min(250,end-Date.now()));});
}
async function studioLibraryRun(job){
  if(STUDIO_LIBRARY.running)return;STUDIO_LIBRARY.running=true;STUDIO_LIBRARY.pause=false;STUDIO_LIBRARY.draft=false;studioLibraryMessage('');
  if(job.type==='generate')studioLibraryView('create');
  var storageRetries=0;
  try{
    while(job.status!=='done'&&!STUDIO_LIBRARY.pause){
      await studioLibraryPaint(job);
      try{
        var d=await studioAPI('library-advance',{id:job.id});job=d.job;
        if(storageRetries)studioLibraryMessage('');storageRetries=0;
      }catch(e){
        if(e.status!==429||!e.storageRateLimited||storageRetries>=3||e.retryAfterMs>60000)throw e;
        var seconds=Math.max(5*Math.pow(2,storageRetries++),Math.ceil((e.retryAfterMs||0)/1000));
        studioLibraryMessage('Google Cloud pide una pausa. Reintentando en '+seconds+' segundos; el avance guardado se conserva.');
        await studioLibraryWait(seconds*1000);continue;
      }
      if(job.busy)await new Promise(function(r){setTimeout(r,2000);});
    }
    await studioLibraryPaint(job);
  }catch(e){studioLibraryMessage(e.message,true);try{await studioLibraryStatus();job=STUDIO_LIBRARY.job;}catch(ignored){}}
  finally{
    STUDIO_LIBRARY.running=false;await studioLibraryPaint(job);
    try{STUDIO.assets=await studioLoadAll('assets');await studioPaintRecipes();await studioPaintLibrary();}
    catch(e){studioLibraryMessage('El avance sigue guardado. No se pudo actualizar la vista: '+e.message,true);}
  }
}
async function studioLibraryStart(config){
  var pending=null;try{pending=JSON.parse(localStorage.getItem('lh_library_start')||'null');}catch(e){}
  if(!pending||JSON.stringify(pending.config)!==JSON.stringify(config))pending={requestId:nextUid(),config:config};
  localStorage.setItem('lh_library_start',JSON.stringify(pending));
  var d=await studioAPI('library-start',pending);localStorage.removeItem('lh_library_start');STUDIO_LIBRARY.draft=false;await studioLibraryPaint(d.job);
  if(d.job.existing){studioLibraryMessage('Hay un trabajo pendiente. Toca Continuar para terminarlo, o Detener para conservar lo guardado y empezar otro.');return;}
  return studioLibraryRun(d.job);
}
async function studioCatalogExisting(){return studioLibraryStart({type:'catalog'});}
async function studioLibraryResume(){
  var pending=null;try{pending=JSON.parse(localStorage.getItem('lh_library_start')||'null');}catch(e){}
  if(pending)return studioLibraryStart(pending.config);
  STUDIO.assets=await studioLoadAll('assets');await studioLibraryStatus();
  if(STUDIO_LIBRARY.job&&STUDIO_LIBRARY.job.status!=='done')return studioLibraryRun(STUDIO_LIBRARY.job);
}
async function studioLibraryStop(){
  var job=STUDIO_LIBRARY.job;if(!job)return;
  var d=await studioAPI('library-stop',{id:job.id});await studioLibraryPaint(d.job);studioLibraryMessage(d.job.stage);
}
async function studioImportLibrary(){
  var source=studioEl('librarySource').value.trim();if(!source)throw new Error('Indica el bucket de origen una sola vez.');
  localStorage.setItem('lh_library_source',source);return studioLibraryStart({type:'import',source:source});
}
function studioRecipeBatch(){
  var category=studioEl('recipeCategory').value,limit=Number(studioEl('recipeBatchSize').value);
  return LH.recipes().filter(function(r){return (!category||r.category===category)&&!STUDIO.assets.some(function(a){return a.recipeId===r.id&&a.aspect===imgFmt&&!a.archived;});})
    .sort(function(a,b){return Number(a.id.split('-')[1])-Number(b.id.split('-')[1])||[2,0,1,3].indexOf(Number(a.id.split('-')[2]))-[2,0,1,3].indexOf(Number(b.id.split('-')[2]));}).slice(0,limit);
}
function studioRecipeJob(){
  var job=STUDIO_LIBRARY.job;return job&&job.type==='generate'&&(!STUDIO_LIBRARY.draft||job.status!=='done')&&job.recipeIds&&job.recipeIds.length?job:null;
}
function studioModelLabel(model){
  var option=Array.from(studioEl('selImgModel').options).find(function(o){return o.value===model;});return option?option.textContent.split(' · ')[0]:model;
}
function studioRecipeTile(recipe,index,aspect){
  var card=document.createElement('article');card.className='studio-media-tile studio-recipe-tile';card.dataset.recipeId=recipe.id;
  var preview=document.createElement('button');preview.className='studio-tile-preview';preview.disabled=true;card.appendChild(preview);
  var pending=document.createElement('span');pending.className='studio-tile-placeholder';
  var frame=document.createElement('span');frame.className='studio-tile-frame';frame.style.aspectRatio=aspect.replace(':',' / ');frame.textContent=String(index+1).padStart(2,'0');pending.appendChild(frame);
  var hint=document.createElement('span');hint.textContent='Por crear';pending.appendChild(hint);preview.appendChild(pending);
  var badge=document.createElement('span');badge.className='studio-tile-state';card.appendChild(badge);
  var title=document.createElement('strong');title.className='studio-tile-title';title.textContent=recipe.title.split(' · ')[0];card.appendChild(title);
  var shot=document.createElement('span');shot.className='studio-tile-meta';shot.textContent=recipe.shot+' · '+aspect;card.appendChild(shot);
  return card;
}
async function studioPaintRecipes(){
  var job=studioRecipeJob(),all=LH.recipes(),recipes=job?job.recipeIds.map(function(id){return all.find(function(r){return r.id===id;});}).filter(Boolean):studioRecipeBatch();
  var count=recipes.length,settings=job?job.settings:{model:imgModel,aspect:imgFmt},locked=STUDIO_LIBRARY.running||STUDIO_LIBRARY.preparing;
  studioEl('recipeControls').hidden=!!job;studioEl('librarySettings').hidden=!!job;
  studioEl('recipeSettings').textContent=studioModelLabel(settings.model)+' · '+settings.aspect+(job?' · Ajustes de esta creación':' · Tus ajustes de imagen');
  studioEl('recipeSummary').textContent=job?'Todo lo que ves guardado ya está disponible en Mi biblioteca.':locked?'Hay un trabajo de biblioteca en curso. Puedes cambiar tus ajustes; para crear imágenes, primero pausa y detén ese trabajo.':count?count+' imágenes · $'+(count*(IMG_COST[settings.model]||0.05)).toFixed(2)+' aprox. La descripción automática con Gemini se cobra según uso.':'Estas escenas ya están guardadas en el formato elegido. Puedes elegir otro contenido.';
  studioEl('recipeGenerate').hidden=!!job;studioEl('recipeGenerate').disabled=locked||!count;studioEl('recipeGenerate').textContent='Crear '+count+' imágenes';
  studioEl('recipeNew').hidden=!job||job.status!=='done'||locked;
  studioEl('recipeHeading').textContent=job?(job.status==='done'?'Imágenes de esta creación':'Tus imágenes, una a una'):'Imágenes que vas a crear';
  studioEl('recipeHint').textContent=job?'Toca una imagen guardada para verla en grande.':'Cada situación tiene un plano general, uno medio, un detalle de manos y uno desde atrás. Estas son las siguientes imágenes pendientes.';
  var grid=studioEl('recipePreview'),key=(job?job.id:'draft')+'|'+settings.aspect+'|'+recipes.map(function(r){return r.id;}).join(',');
  if(grid.dataset.selection!==key){grid.innerHTML='';grid.dataset.selection=key;recipes.forEach(function(r,i){grid.appendChild(studioRecipeTile(r,i,settings.aspect));});}
  var rows=[];
  recipes.forEach(function(recipe,index){
    var card=grid.children[index],asset=STUDIO.assets.find(function(a){return a.recipeId===recipe.id&&a.aspect===settings.aspect&&!a.archived;});
    var pending=job&&(job.pendingRecipeIds||[]),current=pending&&pending[0]===recipe.id;
    var failed=job&&(job.recipeResults||{})[recipe.id]==='failed';
    var state=asset?(pending&&pending.includes(recipe.id)?'Imagen guardada':'Lista'):failed?'No se completó':job&&job.stopped?'Sin crear':current?(STUDIO_LIBRARY.running?'Creando…':'En pausa'):'Por crear';
    card.querySelector('.studio-tile-state').textContent=state;card.dataset.state=asset?'saved':failed?'failed':current&&STUDIO_LIBRARY.running?'creating':'pending';
    var button=card.querySelector('button');
    if(asset){rows.push(asset);button.disabled=false;button.setAttribute('aria-label','Ver '+asset.title);button.onclick=function(){studioOpenAsset(asset);};var placeholder=button.querySelector('.studio-tile-placeholder');if(placeholder)placeholder.lastChild.textContent='Cargando vista previa…';}
  });
  if(!rows.length)return;
  try{
    var links=await studioLibraryLinks(rows);if(grid.dataset.selection!==key)return;
    Array.from(grid.children).forEach(function(card){
      var asset=rows.find(function(a){return a.recipeId===card.dataset.recipeId;});if(!asset||!links[asset.id])return;
      var button=card.querySelector('button'),src=links[asset.id].url;
      if(button.dataset.url!==src){button.innerHTML='';button.appendChild(studioMedia(asset,src));button.dataset.url=src;}
    });
  }catch(e){studioLibraryMessage('La imagen está guardada. No se pudo cargar la vista previa: '+e.message,true);}
}
async function studioGenerateRecipe(){
  if(STUDIO_LIBRARY.job&&STUDIO_LIBRARY.job.status!=='done'){studioLibraryMessage('Hay un trabajo pendiente. Toca Continuar o Detener antes de crear otras imágenes.');return;}
  STUDIO.assets=await studioLoadAll('assets');STUDIO_LIBRARY.draft=true;await studioPaintRecipes();var recipes=studioRecipeBatch();if(!recipes.length)return;
  // Snapshot the existing selectors before any asynchronous preparation.
  var config={type:'generate',recipeIds:recipes.map(function(r){return r.id;}),model:imgModel,aspect:imgFmt};
  if(!confirm('Crear '+recipes.length+' imágenes con '+studioModelLabel(config.model)+' en '+config.aspect+': $'+(recipes.length*imgCost()).toFixed(2)+' aprox., más la descripción automática. Se guardarán para reutilizarlas. ¿Comenzar?'))return;
  STUDIO_LIBRARY.preparing=true;
  try{studioLibraryControls();await studioPaintRecipes();studioLibraryMessage('Preparando el personaje para estas escenas…');await loadRefs();return await studioLibraryStart(config);}
  finally{STUDIO_LIBRARY.preparing=false;studioLibraryControls();await studioPaintRecipes();}
}
async function studioGenerateMissing(){
  if(!lastRes||!STUDIO.plan.length)throw new Error('Prepara el montaje desde la biblioteca primero.');
  var missing=Array.from(new Set(STUDIO.plan.filter(function(p){return !p.assetId;}).map(function(p){return p.scene;})));
  if(!missing.length){studioMessage('Todas las tomas tienen material.');return;}
  if(!confirm('Faltan imágenes para '+missing.length+' escenas. Coste estimado: $'+(missing.length*imgCost()).toFixed(2)+'. Las imágenes quedarán en la biblioteca para reutilizarse. ¿Generarlas?'))return;
  var owner=lastRes,refs=await loadRefs();if(refs.length<MIN_REFS)throw new Error('Faltan referencias del protagonista.');
  for(var i=0;i<missing.length;i++){
    var n=missing[i];studioMessage('Generando solo la escena pendiente '+(i+1)+' de '+missing.length);
    var prepared=await prepararImagen(owner.c[n],refs),src=await genOneImage(imgPromptPrefix(imgFmt)+prepared.prompt,prepared.refs);
    imgs[n]={src:src,idx:n+1};var a=await studioSaveImage(src,owner.c[n],n);
    STUDIO.plan.forEach(function(p){if(p.scene===n&&!p.assetId){p.assetId=a.id;p.reason='Imagen nueva guardada para reutilizar';}});
    cost+=imgCost();updCost();await studioPersistAssets();studioPaintPlan();
    if(i<missing.length-1)await new Promise(function(r){setTimeout(r,PAUSA_IMAGENES);});
  }
  studioPaintCurrentImages();studioMessage('Huecos completos. El resto del material se reutilizó.');
}
async function studioGuard(fn){
  if(STUDIO.busy)return;STUDIO.busy=true;
  try{await fn();}catch(e){if(studioEl('libraryPanel').open)studioLibraryMessage(e.message,true);else studioMessage(e.message,true);}finally{STUDIO.busy=false;}
}
function studioInit(){
  studioPaintPending();studioPaintRecipes();
  studioEl('projectsPanel').addEventListener('toggle',function(){if(this.open)studioGuard(studioOpenProjects);});
  var bind=function(id,fn){var el=studioEl(id);if(el)el.onclick=function(){studioGuard(fn);};};
  bind('libraryLoad',studioLoadLibrary);bind('libraryUpload',studioUploadFiles);bind('libraryCatalog',studioCatalogExisting);bind('libraryImport',studioImportLibrary);bind('libraryResume',studioLibraryResume);bind('libraryStop',studioLibraryStop);
  studioEl('libraryPause').onclick=function(){STUDIO_LIBRARY.pause=true;this.textContent='Terminando la toma actual…';};
  studioEl('librarySavedTab').onclick=function(){studioLibraryView('saved');};studioEl('libraryCreateTab').onclick=function(){studioLibraryView('create');};
  ['librarySavedTab','libraryCreateTab'].forEach(function(id){studioEl(id).onkeydown=function(e){
    if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();var create=e.key==='End'||(e.key!=='Home'&&id==='librarySavedTab');studioLibraryView(create?'create':'saved');studioEl(create?'libraryCreateTab':'librarySavedTab').focus();}
  };});
  studioEl('libraryShowProgress').onclick=function(){STUDIO_LIBRARY.draft=false;studioLibraryView('create');};
  studioEl('recipeNew').onclick=function(){STUDIO_LIBRARY.draft=true;studioLibraryMessage('');studioPaintRecipes();};
  studioEl('librarySettings').onclick=studioLibrarySettings;
  studioEl('libraryBring').onclick=function(){var panel=studioEl('libraryBringPanel');panel.hidden=!panel.hidden;this.setAttribute('aria-expanded',String(!panel.hidden));};
  ['Cloud','Phone'].forEach(function(source){studioEl('libraryBring'+source).onclick=function(){
    ['Cloud','Phone'].forEach(function(name){studioEl('library'+name+'Panel').hidden=name!==source;studioEl('libraryBring'+name).setAttribute('aria-pressed',String(name===source));});
  };});
  studioEl('librarySettingsClose').onclick=function(){studioEl('librarySettingsDialog').close();};
  studioEl('librarySettingsDialog').addEventListener('close',function(){
    var home=STUDIO_LIBRARY.settingsHome;if(home){home.parent.insertBefore(studioEl('genSettings'),home.next);STUDIO_LIBRARY.settingsHome=null;}studioPaintRecipes();
  });
  studioEl('libraryViewerClose').onclick=function(){studioEl('libraryViewer').close();};
  studioEl('libraryViewer').addEventListener('close',function(){
    studioEl('libraryViewerContent').querySelectorAll('video,audio').forEach(function(el){el.pause();el.removeAttribute('src');el.load();});studioEl('libraryViewerContent').innerHTML='';
  });
  ['libraryViewer','librarySettingsDialog'].forEach(function(id){studioEl(id).addEventListener('click',function(e){if(e.target===this)this.close();});});
  studioEl('librarySource').value=localStorage.getItem('lh_library_source')||'';
  studioEl('recipeCategory').onchange=studioPaintRecipes;studioEl('recipeBatchSize').onchange=studioPaintRecipes;
  ['selImgFmt','selImgModel'].forEach(function(id){var el=studioEl(id);if(el)el.addEventListener('change',studioPaintRecipes);});
  studioEl('libraryPanel').addEventListener('toggle',function(){if(this.open&&!STUDIO_LIBRARY.running)studioGuard(studioLoadLibrary);});
  bind('studioPending',studioResume);bind('projectsLoad',studioOpenProjects);bind('buildScenePlan',studioBuildPlan);bind('generateMissing',studioGenerateMissing);bind('recipeGenerate',studioGenerateRecipe);bind('scriptSave',studioEditScript);bind('resumeRender',studioResumeRender);bind('audioRestoreES',function(){return studioRecoverAudio('es');});bind('audioRestoreEN',function(){return studioRecoverAudio('en');});
  bind('scriptRecheck',studioReviewScript);
  studioEl('librarySearch').onchange=function(){STUDIO_PAGE=0;studioGuard(studioPaintLibrary);};studioEl('libraryKind').onchange=studioEl('librarySearch').onchange;
  bind('libraryNext',function(){STUDIO_PAGE++;return studioPaintLibrary();});bind('libraryPrev',function(){STUDIO_PAGE=Math.max(0,STUDIO_PAGE-1);return studioPaintLibrary();});

}
document.addEventListener('DOMContentLoaded',studioInit);
