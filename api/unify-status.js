const {makeStore,signedUrl,jsonHandler,failure} = require('./_store');
module.exports = jsonHandler(async(b,res)=>{
  if(!/^job-[a-f0-9]{20,24}$/.test(b.jobId||''))throw failure('Trabajo de montaje inválido.',400);
  const r=await makeStore(AbortSignal.timeout(20000)).read('unify/'+b.jobId+'.json');
  if(!r)return res.json({done:false,stage:'Esperando confirmación del montaje'});
  const d=r.data;
  if(d.status==='error')return res.json({done:true,error:d.message||'No se pudo completar el montaje.'});
  if(d.status==='running'&&Date.now()-Date.parse(d.updatedAt)>3700000)return res.json({done:true,error:'El ejecutor dejó de actualizar el estado. Pulsa Unificar de nuevo para recuperar los segmentos terminados.'});
  if(d.status==='queued'&&Date.now()-Date.parse(d.updatedAt)>300000)return res.json({done:true,error:'El montaje no arrancó. Pulsa Unificar otra vez; el trabajo guardado se conserva.'});
  if(d.status!=='done')return res.json({done:false,stage:d.stage||'Montaje en proceso',updatedAt:d.updatedAt});
  if(!new RegExp('^unify/'+b.jobId+'\\.mp4$').test(d.object||''))throw failure('El resultado del montaje es inválido.');
  return res.json({done:true,videoUrl:signedUrl(d.object),duracion:d.duracion,ancho:d.ancho,alto:d.alto,subtitulos:d.subtitulos,avisos:d.avisos||[],audioSeconds:d.audioSeconds});
});
