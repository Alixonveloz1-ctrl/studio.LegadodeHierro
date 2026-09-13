// Public research and cached video analysis, using the existing project credentials.
const {createHash}=require('crypto');
const {token,makeStore,jsonHandler,failure}=require('./_store');
const {MODEL}=require('./_text');
const research=require('./_research');
async function callModel(parts,search,signal){
  const project=process.env.GCP_PROJECT_ID;
  if(!project)throw failure('Falta configurar el proyecto de generación.');
  const access=await token(signal);
  const r=await fetch('https://aiplatform.googleapis.com/v1/projects/'+encodeURIComponent(project)+'/locations/global/publishers/google/models/'+MODEL+':generateContent',{
    method:'POST',signal,headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{role:'user',parts}],...(search?{tools:[{googleSearch:{}}]}:{}),
      generationConfig:{maxOutputTokens:6000,temperature:search?0.9:0.3,thinkingConfig:{thinkingLevel:'LOW'}}})
  });
  const d=await r.json();
  if(!r.ok)throw failure(search?'La búsqueda no respondió. Tus ideas anteriores se conservan.':'No se pudo analizar este video público.',r.status===429?429:502);
  return d;
}
module.exports=jsonHandler(async(b,res)=>{
  const signal=AbortSignal.timeout(50000);
  if(b.action==='analyze'){
    const url=research.youtubeURL(b.videoUrl);
    if(!url)throw failure('La referencia no es un video público de YouTube válido.',400);
    const store=makeStore(signal),key='legado-studio/research/videos/'+createHash('sha256').update('v1:'+url).digest('hex')+'.json';
    const saved=await store.read(key);
    if(saved)return res.json({success:true,analysis:saved.data,reused:true});
    const d=await callModel([{fileData:{mimeType:'video/mp4',fileUri:url},videoMetadata:{startOffset:'0s',endOffset:'180s',fps:1}},{text:research.analysisPrompt()}],false,signal);
    const analysis={...research.parseAnalysis(d),videoUrl:url};
    await store.put(key,analysis,0).catch(e=>{if(e.status!==412)throw e;});
    return res.json({success:true,analysis,reused:false});
  }
  if(b.action&&b.action!=='search')throw failure('Operación de investigación desconocida.',400);
  const d=await callModel([{text:research.searchPrompt(b.avoid,b.mode,b.seconds)}],true,signal);
  return res.json({success:true,...research.parseResearch(d)});
});
