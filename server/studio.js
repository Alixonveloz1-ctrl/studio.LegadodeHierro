const {randomUUID,createHash} = require('crypto');
const {makeStore,jsonHandler,signedUrl,failure} = require('./_store');
const assets = require('./_assets');
const core = require('../public/studio-core');
const idOK = x=>typeof x === 'string' && /^[a-zA-Z0-9_-]{8,100}$/.test(x);
module.exports = jsonHandler(async (b,res) => {
  const action=b.action,store = makeStore(action?.startsWith('library-')?AbortSignal.timeout(54000):undefined);
  if(action?.startsWith('library-')){
    const library=require('./_library');
    if(action==='library-start')return res.json({success:true,job:await library.start(store,b.config,b.requestId)});
    if(action==='library-advance')return res.json({success:true,job:await library.advance(store,b.id)});
    if(action==='library-stop')return res.json({success:true,job:await library.stop(store,b.id)});
    if(action==='library-status')return res.json({success:true,job:library.publicJob((await store.read(library.ACTIVE))?.data)});
    throw failure('Operación de biblioteca desconocida.',400);
  }
  if (action === 'select-videos') return res.json({success:true,plan:await require('./_selection').selectVideos(store,b)});
  if (action === 'assets') return res.json({success:true,...await assets.listAssets(store,b.cursor)});
  if (action === 'asset-save') return res.json({success:true,asset:await assets.register(store,b.asset || {},b.object,b.legacy === true)});
  if (action === 'links') return res.json({success:true,items:await assets.links(store,b.ids)});
  if (action === 'upload') {
    const mime = String(b.mime || '');
    const extensions = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp','video/mp4':'mp4','video/quicktime':'mov','video/webm':'webm','audio/mpeg':'mp3','audio/wav':'wav','audio/x-wav':'wav','audio/mp4':'m4a','audio/ogg':'ogg'};
    if (!extensions[mime] || !(b.size > 0) || b.size > 300*1024*1024) throw failure('Usa una imagen, un video o audio de hasta 300 MB.',400);
    const object = (mime.startsWith('audio/') && !b.narration ? 'musica/' : 'legado-studio/media/')+randomUUID()+'.'+extensions[mime];
    return res.json({success:true,object,url:signedUrl(object,'PUT',mime),mime});
  }
  if (action === 'discover') {
    const d = await store.list(b.legacy === true ? '' : 'legado-videos/',b.cursor,100);
    const items = (d.items || []).filter(it=>assets.safeObject(it.name,b.legacy === true) && /\.(mp4|mov|webm|png|jpg|jpeg|wav|mp3|m4a)$/i.test(it.name));
    return res.json({success:true,items:items.map(it=>({object:it.name,title:it.name.split('/').pop(),url:signedUrl(it.name),size:Number(it.size),kind:/\.(mp4|mov|webm)$/i.test(it.name)?'video':/\.(mp3|wav|m4a)$/i.test(it.name)?'music':'image'})),cursor:d.nextPageToken || ''});
  }
  if (action === 'narration-link') {
    if (!idOK(b.id) || !['es','en'].includes(b.lang)) throw failure('Proyecto o idioma inválido.',400);
    const saved=await store.read('legado-studio/projects/'+b.id+'.json');
    const audio=saved && saved.data.uploadedAudio && saved.data.uploadedAudio[b.lang];
    if (!audio || !/^legado-studio\/media\/[a-zA-Z0-9_.-]+\.(wav|mp3|m4a|ogg)$/.test(audio.object)) throw failure('No hay narración importada en este proyecto.',404);
    return res.json({url:signedUrl(audio.object)});
  }
  if (action === 'project-save' || action === 'project-get') {
    if (!idOK(b.id)) throw failure('Proyecto inválido.',400);
    const path = 'legado-studio/projects/'+b.id+'.json', old = await store.read(path);
    if (action === 'project-get') return res.json({success:true,project:old && old.data});
    if (b.version !== undefined && old && Number(b.version) !== old.data.version) throw failure('Este proyecto cambió en otra pestaña. Recárgalo.',409);
    const patch = b.project || {};
    if (JSON.stringify(patch).length > 900000 || /"(?:blob|partsB64|base64)"\s*:|data:(?:image|audio|video)\//.test(JSON.stringify(patch))) throw failure('Guarda referencias de archivos, no archivos completos en el proyecto.',400);
    const project = {...(old && old.data),...patch,id:b.id,version:((old && old.data.version)||0)+1,updatedAt:new Date().toISOString()};
    const catalog = {id:b.id,topic:String(project.topic || '').slice(0,180),updatedAt:project.updatedAt};
    await store.put(path,project,old ? old.generation : 0);
    await store.put('legado-studio/project-index/'+b.id+'.json',catalog,undefined,true);
    return res.json({success:true,version:project.version});
  }
  if (action === 'projects') {
    const d = await store.list('legado-studio/project-index/',b.cursor,100);
    return res.json({success:true,items:(d.items || []).map(it=>JSON.parse(it.metadata.record)),cursor:d.nextPageToken || ''});
  }
  if (action === 'metrics') {
    const d = await store.list('legado-studio/metrics/',b.cursor,100);
    return res.json({success:true,items:(d.items || []).map(it=>JSON.parse(it.metadata.record)),cursor:d.nextPageToken || ''});
  }
  if (action === 'metric-save') {
    let row;try { row = core.validateMetric(b.metric || {}); } catch(e) { throw failure(e.message,400); }
    if (!row.url && !idOK(row.projectId)) throw failure('Enlaza la publicación o un proyecto.',400);
    if (row.url) {
      let u;try { u=new URL(row.url); } catch(e) { throw failure('Enlace de publicación inválido.',400); }
      const domain=row.platform==='facebook'?/(^|\.)(facebook\.com|fb\.watch)$/:/(^|\.)(youtube\.com|youtu\.be)$/;
      if (u.protocol!=='https:' || !domain.test(u.hostname)) throw failure('El enlace no corresponde a la plataforma elegida.',400);
      ['si','mibextid','utm_source','utm_medium','utm_campaign','fbclid'].forEach(k=>u.searchParams.delete(k));u.hash='';row.url=u.toString();
    }
    row.id = createHash('sha256').update([row.platform,row.url || row.projectId,row.window].join('|')).digest('hex').slice(0,32);
    const path = 'legado-studio/metrics/'+row.id+'.json', old = await store.read(path);
    // Same publication/window updates its measurement instead of adding duplicate evidence.
    await store.put(path,row,old ? old.generation : 0,true); return res.json({success:true,metric:row});
  }
  throw failure('Acción desconocida.',400);
});
