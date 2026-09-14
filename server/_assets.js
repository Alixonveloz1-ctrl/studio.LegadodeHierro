const {createHash} = require('crypto');
const {failure,signedUrl} = require('./_store');
const PREFIX = 'legado-studio/assets/';
const idFor = object=>createHash('sha256').update(object).digest('hex').slice(0,32);
function safeObject(object,legacy) {
  return typeof object === 'string' && object.length < 900 && !object.includes('..') && !/[\x00-\x1f\\]/.test(object)
    && (/^(legado-videos\/|legado-studio\/media\/|musica\/)/.test(object) || (legacy && !/^(unify|refs|personajes|legado-studio)\//.test(object)));
}
function channelAsset(a){
  return /^(legado-videos\/|legado-studio\/media\/)/.test(a.object||'') || !!a.importedFrom || a.catalogSource==='manual' || (a.kind==='music'&&a.catalogSource!=='gemini');
}
function cleanAsset(input, object, previous) {
  const inferred=require('../public/studio-core').continuity(input.description);
  input={...inferred,...input};
  const r = {...previous,id:idFor(object),object,updatedAt:new Date().toISOString()};
  for (const k of ['title','description','action','location','mood','shot','character','setId','collection','recipeId','sourceProject','sourceImageId','catalogSource']) {
    if (typeof input[k] === 'string') r[k] = input[k].trim().slice(0,k === 'description' ? 1600 : 180);
  }
  r.kind = ['image','video','music'].includes(input.kind) ? input.kind : (r.kind || (/\.(mp4|mov|webm)$/i.test(object) ? 'video' : /\.(wav|mp3|m4a|ogg)$/i.test(object) ? 'music' : 'image'));
  if (input.aspect !== undefined) r.aspect = ['9:16','16:9','1:1','4:5','3:4','4:3','2:3','3:2','5:4','21:9'].includes(input.aspect) ? input.aspect : '';
  if (input.duration !== undefined) r.duration = Math.max(0,Math.min(7200,Number(input.duration) || 0));
  if (Array.isArray(input.tags)) r.tags = [...new Set(input.tags.map(x=>String(x).trim().slice(0,40)).filter(Boolean))].slice(0,24);
  if (typeof input.containsMinors === 'boolean') r.containsMinors=input.containsMinors;
  if (typeof input.favorite === 'boolean') r.favorite = input.favorite;
  if (typeof input.archived === 'boolean') r.archived = input.archived;
  if (input.analysis && typeof input.analysis === 'object') {
    r.analysis={};for(const k of ['version','generation','model','at'])if(input.analysis[k]!==undefined)r.analysis[k]=String(input.analysis[k]).slice(0,100);
  }
  if (input.importedFrom && typeof input.importedFrom === 'object') {
    r.importedFrom={};for(const k of ['bucket','object','generation'])if(typeof input.importedFrom[k]==='string')r.importedFrom[k]=input.importedFrom[k].slice(0,900);
  }
  r.createdAt = r.createdAt || new Date().toISOString(); r.version = (r.version || 0)+1;
  return r;
}
async function register(store,input,object,legacy) {
  if (!safeObject(object,legacy)) throw failure('Archivo fuera de la biblioteca del canal.',400);
  const file = PREFIX+idFor(object)+'.json', old = await store.read(file);
  if (old && input.version !== undefined && Number(input.version) !== old.data.version) throw failure('La ficha cambió. Recárgala antes de guardar.',409);
  if (!old) {
    const info = await store.info(object);
    if (!info) throw failure('El archivo no terminó de subir. Reintenta la subida.',400);
  }
  const data = cleanAsset(input,object,old && old.data);
  await store.put(file,data,old ? old.generation : 0,true); return data;
}
async function listAssets(store,cursor) {
  const d = await store.list(PREFIX,cursor,100);
  return {items:(d.items || []).map(it=>{try{return JSON.parse(it.metadata.record);}catch(e){return null;}}).filter(a=>a&&channelAsset(a)),cursor:d.nextPageToken || ''};
}
async function links(store,ids) {
  if (!Array.isArray(ids) || ids.length > 100) throw failure('Máximo 100 materiales por consulta.',400);
  const out = [];
  const unique=[...new Set(ids)];
  for(let offset=0;offset<unique.length;offset+=8){
    await Promise.all(unique.slice(offset,offset+8).map(async id=>{
    if (!/^[a-f0-9]{32}$/.test(id)) throw failure('Identificador de material inválido.',400);
    const r = await store.read(PREFIX+id+'.json');
    if (r) out.push({...r.data,url:signedUrl(r.data.object)});
    }));
  }
  return out.sort((a,b)=>unique.indexOf(a.id)-unique.indexOf(b.id));
}
module.exports = {PREFIX,idFor,channelAsset,safeObject,cleanAsset,register,listAssets,links};
