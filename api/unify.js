// api/unify.js
// Punto 4 del plan: arranca la unificacion de video + audio en el servicio de
// Cloud Run (legado-unify). Este endpoint NO procesa nada: reenvia el trabajo y
// devuelve un jobId de inmediato; el frontend consulta /api/unify-status.
//
// Todo error del servicio pasa por aqui y se registra con console.error, para
// que quede visible en los registros de Vercel (el punto ciego de Cloud Run
// deja de importar: el error siempre se puede leer desde Vercel).
//
// Variables de entorno necesarias en Vercel:
//   CLOUD_RUN_UNIFY_URL  p.ej. https://legado-unify-xxxxx-uc.a.run.app
//   UNIFY_KEY            la misma clave secreta configurada en el servicio

const { checkAuth } = require('./_auth');

// La version de cloudrun/unify/index.js que espera ESTA copia del repositorio.
// Si el Cloud Run desplegado devuelve otra, es que le falta la actualizacion.
// comprobar.sh vigila que las dos vayan siempre a la par.
const VERSION_ESPERADA = '2026-09-13.1';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;

  // GET = comprobar que version del servicio hay corriendo. Asi la herramienta
  // sabe SOLA si el Cloud Run esta al dia y no hay que preguntarselo a nadie.
  if (req.method === 'GET') {
    const url = process.env.CLOUD_RUN_UNIFY_URL;
    if (!url) return res.json({ estado: 'sin-configurar', esperada: VERSION_ESPERADA });
    try {
      const ctrl = new AbortController();
      const corta = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(url.replace(/\/+$/, '') + '/', { signal: ctrl.signal });
      clearTimeout(corta);
      const d = await r.json().catch(() => ({}));
      // Un servicio anterior a este cambio no devuelve version: eso YA significa
      // que esta desactualizado, no que no se pueda saber.
      const actual = d.version || null;
      return res.json({
        estado: actual === VERSION_ESPERADA && d.durable ? 'al-dia' : 'desactualizado',
        actual: actual, esperada: VERSION_ESPERADA,
      });
    } catch (e) {
      return res.json({ estado: 'sin-respuesta', esperada: VERSION_ESPERADA, error: String(e.message || e) });
    }
  }

  if(req.method!=='POST')return res.status(405).json({error:'Usa POST.'});
  try {
    const {makeStore,failure}=require('./_store');
    const {validateShots}=require('../cloudrun/unify/timeline');
    const {idFor,PREFIX}=require('./_assets');
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body || {};
    validateShots(body.shots);
    if(!Array.isArray(body.audioObjects)||!body.audioObjects.length||body.audioObjects.length>200||!body.audioObjects.every(o=>typeof o==='string'&&/^legado-studio\/media\//.test(o)&&!o.includes('..')&&/\.(wav|mp3|m4a|ogg)$/.test(o)))throw failure('Faltan referencias válidas de la narración. Recarga la aplicación para usar el montaje nuevo.',400);
    if(!['9:16','16:9','1:1','4:5'].includes(body.aspect))throw failure('Formato de salida inválido.',400);
    if(body.srt&&(typeof body.srt!=='string'||body.srt.length>200000))throw failure('Subtítulos inválidos.',400);
    let music=null;
    if(body.music){
      const m=body.music;
      if(typeof m.object!=='string'||!/^musica\//.test(m.object)||m.object.includes('..')||!Number.isFinite(Number(m.volume))||m.volume<0||m.volume>1)throw failure('Música inválida.',400);
      music={object:m.object,volume:Number(m.volume)};
    }
    // An object must have a catalog entry. A crafted browser request cannot ask
    // the render worker to download credentials or unrelated bucket objects.
    const store=makeStore(AbortSignal.timeout(25000));
    const unique=[...new Set(body.shots.map(s=>s.object))];
    for(let offset=0;offset<unique.length;offset+=8){
      await Promise.all(unique.slice(offset,offset+8).map(async object=>{
      const entry=await store.read(PREFIX+idFor(object)+'.json');
      if(!entry||entry.data.object!==object||!['image','video'].includes(entry.data.kind))throw failure('Hay un material sin catalogar. Guárdalo en la biblioteca primero.',400);
      if(body.shots.some(s=>s.object===object&&s.kind!==entry.data.kind))throw failure('El tipo de una toma no coincide con el archivo.',400);
      }));
    }
    const url=process.env.CLOUD_RUN_UNIFY_URL,key=process.env.UNIFY_KEY;
    if(!url||!key)throw failure('Falta configurar el servicio de montaje.');
    const r=await fetch(url.replace(/\/+$/,'')+'/start',{method:'POST',signal:AbortSignal.timeout(22000),headers:{'Content-Type':'application/json','X-Unify-Key':key},
      body:JSON.stringify({shots:body.shots,audioObjects:body.audioObjects,music:music,srt:body.srt||'',targetSeconds:Number(body.targetSeconds)||0,aspect:body.aspect})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.jobId)throw failure(d.error||'No se pudo iniciar el montaje.',502);
    return res.json({success:true,jobId:d.jobId});
  }catch(e){return res.status(e.status&&e.status<600?e.status:500).json({error:e.message});}
};
