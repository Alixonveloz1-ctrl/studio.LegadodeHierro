// One resumable library operation for the personal studio. Each request completes
// at most one provider call or one Storage rewrite chunk, then saves its position.
const {createHash,randomUUID}=require('crypto');
const {failure}=require('./_store');
const assets=require('./_assets'),core=require('../public/studio-core'),models=require('./_library-model');
const ACTIVE='legado-studio/library/active.json',BASE='legado-studio/library/';
const CHANNEL_PREFIXES=['legado-videos/','legado-studio/media/'];
const SCOPE_VERSION=2;
const hash=s=>createHash('sha256').update(s).digest('hex');
const imageObject=(id,aspect)=>'legado-studio/media/library-'+hash('v1|'+id+'|'+aspect)+'.png';
function sourceConfig(value){
  const raw=String(value||'').trim().replace(/^gs:\/\//,''),slash=raw.indexOf('/');
  const bucket=slash<0?raw:raw.slice(0,slash),prefix=slash<0?'':raw.slice(slash+1);
  if(!/^[a-z0-9][a-z0-9._-]{1,220}[a-z0-9]$/.test(bucket)||bucket.split('.').some(s=>s.length>63)||/[?#\x00-\x1f\\]/.test(prefix)||prefix.includes('..')||prefix.length>800)throw failure('Escribe el nombre del bucket o gs://bucket/carpeta/.',400);
  return {bucket,prefix:prefix&&!prefix.endsWith('/')?prefix+'/':prefix};
}
function eligible(info,foreign=false){
  const name=String(info.name||'');
  return !!models.MIME[name.split('.').pop().toLowerCase()]&&assets.safeObject(name,true)
    &&!/(^|\/)(refs|personajes|biblia|unify|\.git|node_modules)\//i.test(name)
    &&!(name.startsWith('legado-studio/media/')&&/\/audio-/.test(name))
    &&(foreign||!/^legado-studio\/media\/.+\.(wav|mp3|m4a|ogg)$/i.test(name));
}
function publicJob(j){
  if(!j)return null;
  return {id:j.id,type:j.type,status:j.status,stage:j.stage,completed:j.completed,failed:j.failed,skipped:j.skipped,total:j.total,
    discovering:j.type!=='generate'&&!j.exhausted,error:j.error||'',failures:(j.failures||[]).slice(-8),lastAsset:j.lastAsset&&assets.channelAsset(j.lastAsset)?j.lastAsset:null,
    // Keep the original selection visible after items leave the processing queue.
    recipeIds:j.type==='generate'?(j.recipeIds||[...new Set([j.lastAsset?.recipeId,...j.queue.map(r=>r.recipeId)].filter(Boolean))]):[],
    pendingRecipeIds:j.type==='generate'?j.queue.map(r=>r.recipeId):[],recipeResults:j.recipeResults||{},
    settings:j.type==='generate'?j.settings:null,stopped:!!j.stopped};
}
function importedMetadata(info,record){
  const meta=info.metadata||{};let embedded={};try{embedded=JSON.parse(meta.record||meta.catalog||'{}');}catch(e){}
  const d={...meta,...embedded,...(record&&typeof record==='object'?record:{})},out={};
  const aliases={title:['title','titulo','nombre','name'],description:['description','descripcion','prompt'],tags:['tags','etiquetas'],action:['action','accion'],location:['location','lugar'],mood:['mood','emocion'],shot:['shot','plano'],aspect:['aspect','aspectRatio','formato'],collection:['collection','coleccion'],character:['character','personaje'],setId:['setId'],recipeId:['recipeId'],duration:['duration','duracion'],favorite:['favorite','favorito']};
  for(const [field,keys] of Object.entries(aliases)){const key=keys.find(k=>d[k]!==undefined&&d[k]!==null&&d[k]!=='');if(key)out[field]=d[key];}
  if(typeof out.tags==='string'){try{out.tags=JSON.parse(out.tags);}catch(e){out.tags=out.tags.split(',').map(s=>s.trim());}}
  if(out.favorite!==undefined)out.favorite=out.favorite===true||out.favorite==='true';
  if(out.aspect&&!['9:16','16:9','1:1','4:5','3:4','4:3','2:3','3:2','5:4','21:9'].includes(out.aspect))out.aspect='';
  return out;
}
async function sourceMetadata(store,bucket,info){
  let d=importedMetadata(info);
  const candidates=[assets.PREFIX+assets.idFor(info.name)+'.json',info.name+'.json',info.name.replace(/\.[^.]+$/,'.json')];
  for(const path of candidates){
    const record=await store.sourceJSON(bucket,path,65536);
    if(record){d={...d,...importedMetadata(info,record.asset||record)};if(d.title&&d.description)break;}
  }
  return d;
}
async function start(store,c,requestId){
  if(!/^[a-zA-Z0-9_-]{8,100}$/.test(String(requestId)))throw failure('Falta identificar este lote.',400);
  if(!['catalog','generate','import'].includes(c?.type))throw failure('Operación de biblioteca inválida.',400);
  const existing=await store.read(ACTIVE);
  if(existing&&existing.data.status!=='done')return {...publicJob(existing.data),existing:existing.data.requestId!==requestId};
  if(existing?.data.requestId===requestId)return publicJob(existing.data);
  const job={id:randomUUID(),requestId,type:c.type,status:'ready',stage:'Preparando la biblioteca',completed:0,failed:0,skipped:0,total:0,queue:[],cursor:'',exhausted:false,failures:[],leaseUntil:0};
  if(c.type==='import'){
    job.source=sourceConfig(c.source);if(job.source.bucket===store.bucket)throw failure('Ese es el bucket actual. Usa Organizar mi material.',400);
    // Validate access before saving a job or copying any file.
    const page=await store.sourceList(job.source.bucket,job.source.prefix,'',100);
    job.queue=(page.items||[]).filter(it=>eligible(it,true));job.cursor=page.nextPageToken||'';job.exhausted=!job.cursor;job.total=job.queue.length;
  }
  if(c.type==='catalog'){job.scopeVersion=SCOPE_VERSION;job.prefixIndex=0;}
  if(c.type==='catalog'&&Array.isArray(c.objects)){
    if(c.objects.length>1000||!c.objects.every(object=>eligible({name:object},true)))throw failure('La selección contiene archivos que no se pueden catalogar.',400);
    job.queue=[...new Set(c.objects)].map(name=>({name}));job.exhausted=true;job.total=job.queue.length;
  }
  if(c.type==='generate'){
    if(!Array.isArray(c.recipeIds))throw failure('Elige las tomas del lote.',400);
    const recipes=core.recipes(),ids=[...new Set(c.recipeIds)];
    if(!ids.length||ids.length>recipes.length||!ids.every(id=>recipes.some(r=>r.id===id)))throw failure('Elige un lote de tomas preparadas.',400);
    if(!['gemini-2.5-flash-image','gemini-3.1-flash-image','gemini-3-pro-image'].includes(c.model)||!['9:16','16:9','1:1','4:5','3:4','2:3','21:9'].includes(c.aspect))throw failure('Modelo o formato de imagen inválido.',400);
    job.settings={model:c.model,aspect:c.aspect};job.recipeIds=ids;job.recipeResults={};job.queue=ids.map(recipeId=>({recipeId}));job.exhausted=true;job.total=ids.length;
  }
  await store.put(ACTIVE,job,existing?existing.generation:0);return publicJob(job);
}
async function catalog(store,info,previous,deps,defaults={}){
  if(previous?.archived)return {asset:previous,skipped:true};
  if(previous?.analysis?.version===models.VERSION&&previous.analysis.generation===String(info.generation))return {asset:previous,skipped:true};
  if(previous?.catalogSource==='imported'&&previous.description&&previous.tags?.length&&(previous.aspect||previous.kind==='music'))return {asset:previous,skipped:true};
  const path=BASE+'analysis/'+hash(info.name+'|'+info.generation+'|'+models.VERSION)+'.json';
  let cached=await store.read(path),data=cached?.data;
  if(!data){data=await deps.analyze(store,info);try{await store.put(path,data,0);}catch(e){if(e.status!==412)throw e;}}
  // A manual correction and imported labels take priority over machine suggestions.
  const keep=previous?.catalogSource==='manual'?{title:previous.title,description:previous.description,tags:previous.tags}:{};
  const input={...defaults,...data,...keep};
  if(previous?.aspect)input.aspect=previous.aspect;
  if(previous?.catalogSource==='manual')input.catalogSource='manual';
  const asset=await assets.register(store,input,info.name,true);return {asset};
}
async function generateItem(store,job,item,deps){
  const recipe=core.recipes().find(r=>r.id===item.recipeId),object=imageObject(recipe.id,job.settings.aspect),saved=await store.read(assets.PREFIX+assets.idFor(object)+'.json');
  const info=await store.info(object);
  if(info){
    const base=saved?.data||await assets.register(store,{...recipe,kind:'image',recipeId:recipe.id,aspect:job.settings.aspect,character:'insignia',catalogSource:'prompt',collection:'Tomas reutilizables'},object);
    return catalog(store,{...info,name:object},base,deps);
  }
  const anchorObject=recipe.id.endsWith('-2')?'':imageObject(recipe.id.replace(/-\d+$/,'-2'),job.settings.aspect);
  const meta=await deps.generate(store,recipe,{...job.settings,anchorObject},object);
  const asset=await assets.register(store,meta,object);
  // Catalog in the next request: generating and describing never share a deadline.
  job.lastAsset=asset;job.stage='Imagen guardada; preparando su descripción automática';return {pending:true};
}
async function importItem(store,job,item,deps){
  if(!item.copy){
    const info=await store.sourceInfo(job.source.bucket,item.name);if(!info)throw failure('El archivo de origen ya no existe.',404);
    const metadata=await sourceMetadata(store,job.source.bucket,info);
    const object=(models.mimeFor(info)?.startsWith('audio/')?'musica/':'legado-studio/media/')+'import-'+hash(job.source.bucket+'|'+info.name+'|'+info.generation)+'.'+info.name.split('.').pop().toLowerCase();
    item.copy={source:{bucket:job.source.bucket,object:info.name,generation:String(info.generation)},object,metadata,size:info.size,crc32c:info.crc32c};
    return {pending:true};
  }
  const c=item.copy,old=await store.info(c.object);
  if(!old){
    const rewritten=await store.rewriteFrom(c.source,c.object,c.rewriteToken);
    if(!rewritten.done){c.rewriteToken=rewritten.rewriteToken;if(!c.rewriteToken)throw failure('Google no entregó el avance de la copia.',502);return {pending:true};}
    return {pending:true};
  }
  if(String(old.size)!==String(c.size)||(c.crc32c&&old.crc32c!==c.crc32c))throw failure('La copia no coincide con el archivo original.',409);
  const previous=(await store.read(assets.PREFIX+assets.idFor(c.object)+'.json'))?.data;
  if(previous?.importedFrom?.generation===c.source.generation&&previous.importedFrom.bucket===c.source.bucket)return {asset:previous,skipped:true};
  const kind=models.mimeFor({name:c.object})?.startsWith('audio/')?'music':/\.(mp4|mov|webm)$/i.test(c.object)?'video':'image';
  const base={...c.metadata,kind,importedFrom:c.source,catalogSource:'imported'};
  if(base.title&&base.description&&base.tags?.length&&(base.aspect||kind==='music'))return {asset:await assets.register(store,base,c.object)};
  const described=await catalog(store,{...old,name:c.object},previous,deps);
  const kept={...described.asset,...base};
  for(const k of ['title','description','tags','aspect'])if(!base[k])kept[k]=described.asset[k];
  return {asset:await assets.register(store,kept,c.object)};
}
async function advance(store,id,deps=models){
  const old=await store.read(ACTIVE);if(!old||old.data.id!==id)throw failure('Este lote ya no está activo.',409);
  const job=old.data;if(job.status==='done')return publicJob(job);
  // Never resume an old bucket-wide scan after the channel scope changed.
  if(job.type==='catalog'&&job.scopeVersion!==SCOPE_VERSION){
    if(job.leaseUntil>Date.now())return {...publicJob(job),busy:true};
    Object.assign(job,{scopeVersion:SCOPE_VERSION,prefixIndex:0,queue:[],cursor:'',exhausted:false,total:0,completed:0,skipped:0,failed:0,lastAsset:null});
  }
  if(job.leaseUntil>Date.now())return {...publicJob(job),busy:true};
  job.leaseOwner=randomUUID();job.leaseUntil=Date.now()+65000;job.status='running';job.error='';
  let claim;try{claim=await store.put(ACTIVE,job,old.generation);}catch(e){if(e.status===412)return {...publicJob(job),busy:true};throw e;}
  try{
    if(!job.exhausted&&(job.type==='catalog'||!job.queue.length)){
      const source=job.source||{bucket:store.bucket,prefix:CHANNEL_PREFIXES[job.prefixIndex||0]};
      const page=await store.sourceList(source.bucket,source.prefix,job.cursor,100);
      const found=(page.items||[]).filter(it=>eligible(it,job.type==='import'));
      job.queue=job.queue.concat(found);job.total=job.type==='catalog'?job.queue.length:job.total+found.length;job.cursor=page.nextPageToken||'';
      if(job.type==='catalog'&&!job.cursor){job.prefixIndex++;job.exhausted=job.prefixIndex>=CHANNEL_PREFIXES.length;}
      else job.exhausted=!job.cursor;
      job.stage=job.exhausted?'Preparación lista · '+job.total+' archivos por revisar':'Buscando material de Legado de Hierro · '+job.total+' archivos encontrados';
    }else if(job.queue.length){
      const item=job.queue[0],key=BASE+'steps/'+job.id+'/'+hash(item.name||item.recipeId)+'.json';
      let result=(await store.read(key))?.data;
      if(!result){
        try{
        if(job.type==='generate')result=await generateItem(store,job,item,deps);
        else if(job.type==='import')result=await importItem(store,job,item,deps);
        else{
          const info=await store.info(item.name);if(!info)throw failure('El archivo ya no existe.',404);
          const prev=(await store.read(assets.PREFIX+assets.idFor(item.name)+'.json'))?.data;
          result=await catalog(store,{...info,name:item.name},prev,deps,importedMetadata(info));
        }
        }catch(e){
          if(e.provider||![404,413,422].includes(e.status))throw e;
          result={error:String(e.message).slice(0,400),name:item.name||item.recipeId};
        }
        if(!result.pending)await store.put(key,result,0);
      }
      if(!result.pending){
        if(job.type==='generate')job.recipeResults={...job.recipeResults,[item.recipeId]:result.error?'failed':'ready'};
        job.queue.shift();if(result.error){job.failed++;job.failures=job.failures.concat({name:result.name,error:result.error}).slice(-20);}else if(result.skipped)job.skipped++;else job.completed++;job.lastAsset=result.asset||job.lastAsset;job.stage=(job.type==='import'?'Copiando y organizando':'Organizando la biblioteca')+' · '+(job.completed+job.skipped+job.failed)+' de '+job.total;
      }
    }
    job.status=!job.queue.length&&job.exhausted?'done':'ready';job.leaseUntil=0;
    if(job.status==='done')job.stage=job.completed+' materiales organizados · '+job.skipped+' ya estaban listos'+(job.failed?' · '+job.failed+' no se pudieron completar. Puedes volver a organizar o generar las tomas pendientes.':'. Biblioteca lista.');
    await store.put(ACTIVE,job,claim.generation);return publicJob(job);
  }catch(e){
    const current=await store.read(ACTIVE).catch(()=>null);
    if(current?.data.leaseOwner===job.leaseOwner){
      await store.put(ACTIVE,{...current.data,status:'paused',leaseUntil:0,error:e.message},current.generation).catch(()=>{});
    }
    throw e;
  }
}
async function stop(store,id){
  const old=await store.read(ACTIVE);if(!old||old.data.id!==id)throw failure('El lote cambió.',409);
  if(old.data.leaseUntil>Date.now())throw failure('La toma actual está terminando. Espera unos segundos.',409);
  const job={...old.data,status:'done',stopped:true,stage:'Creación detenida. Todo el material terminado sigue guardado.',queue:[],leaseUntil:0};
  await store.put(ACTIVE,job,old.generation);return publicJob(job);
}
module.exports={ACTIVE,BASE,imageObject,sourceConfig,eligible,importedMetadata,sourceMetadata,publicJob,start,advance,stop,catalog};
