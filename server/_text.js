const {token,failure} = require('./_store');
const MODEL = 'gemini-3-flash-preview';
async function generateText(prompt,options) {
  const o = options || {}, signal = o.signal || AbortSignal.timeout(43000);
  if (!process.env.GCP_PROJECT_ID) throw failure('GCP_PROJECT_ID no configurado.');
  const access = await token(signal);
  const r = await fetch('https://aiplatform.googleapis.com/v1/projects/'+encodeURIComponent(process.env.GCP_PROJECT_ID)+'/locations/global/publishers/google/models/'+MODEL+':generateContent',
    {method:'POST',signal,headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify({
      system_instruction:{parts:[{text:'Escribe exactamente el formato solicitado. No inventes datos, biografías ni resultados. Sin preámbulo ni markdown.'}]},
      contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:Math.min(65536,Math.max(16384,(o.maxTokens || 8192)+8192)),...(o.json?{responseMimeType:'application/json'}:{}),temperature:1,thinkingConfig:{thinkingLevel:'LOW'}}
    })});
  const d = await r.json();
  if (!r.ok) throw failure((d.error && d.error.message) || 'El modelo no respondió (HTTP '+r.status+').',r.status >= 500 ? 502 : r.status);
  const c = d.candidates && d.candidates[0];
  const text = ((c && c.content && c.content.parts) || []).filter(p=>!p.thought && typeof p.text === 'string').map(p=>p.text).join('\n').trim();
  const finishReason = c && c.finishReason;
  if (!text || finishReason !== 'STOP') console.error('[text-incomplete]',JSON.stringify({model:MODEL,finishReason,usage:d.usageMetadata,stage:o.stage||'text'}));
  if (!text || finishReason !== 'STOP') throw failure('Respuesta incompleta del modelo ('+(finishReason || 'sin texto')+'). La etapa no se dio por terminada.',502);
  if (o.blocks && !/^\s*BLOQUE\s+A\s*$/mi.test(text)) throw failure('La respuesta no incluye el guion solicitado.',502);
  return {text,model:MODEL,finishReason,chars:text.length};
}
module.exports = {generateText,MODEL};
