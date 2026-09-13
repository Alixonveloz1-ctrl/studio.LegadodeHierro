'use strict';
function validateShots(shots) {
  if (!Array.isArray(shots) || !shots.length || shots.length > 600) throw new Error('El montaje necesita entre 1 y 600 tomas.');
  for (const s of shots) {
    if (!s || !['image','video'].includes(s.kind) || typeof s.object !== 'string' || !s.object || s.object.includes('..') || /[\x00-\x1f\\]/.test(s.object)) throw new Error('Referencia de toma inválida.');
    if (!Number.isFinite(Number(s.duration)) || Number(s.duration) < 0.1 || Number(s.duration) > 120) throw new Error('Duración de toma inválida.');
  }
}
function fitTimeline(shots,audioSeconds,fps) {
  validateShots(shots);fps=fps||30;
  if (!(audioSeconds>0) || audioSeconds>7200) throw new Error('Duración de narración inválida.');
  const total=shots.reduce((n,s)=>n+Number(s.duration),0),frames=Math.round(audioSeconds*fps);
  if(frames<shots.length)throw new Error('Hay más tomas que fotogramas disponibles.');
  let acc=0,previous=0;
  return shots.map((s,i)=>{
    acc+=Number(s.duration);
    const end=i===shots.length-1?frames:Math.max(previous+1,Math.min(frames-(shots.length-i-1),Math.round(acc/total*frames)));
    const result={...s,start:previous/fps,duration:(end-previous)/fps,frames:end-previous};previous=end;return result;
  });
}
module.exports={validateShots,fitTimeline};
