const {makeStore,jsonHandler,failure} = require('./_store');
const {createJob,advanceJob,publicJob,BASE} = require('./_jobs');
const {generateText} = require('./_text');
const {generateAudioChunk} = require('./_voice');
module.exports = jsonHandler(async (b,res)=> {
  const store = makeStore();
  if (b.action === 'create') return res.json({success:true,...await createJob(store,b.config,b.requestId)});
  if (!/^task-[a-f0-9]{32}$/.test(b.id || '')) throw failure('Trabajo inválido.',400);
  if (b.action === 'advance') return res.json({success:true,...await advanceJob(store,b.id,{text:(prompt,options)=>generateText(prompt,{...options,timeoutMs:240000}),voice:generateAudioChunk})});
  const job = await store.read(BASE+b.id+'.json');
  if (!job) throw failure('No se encontró este trabajo.',404);
  return res.json({success:true,...publicJob(job.data)});
});
