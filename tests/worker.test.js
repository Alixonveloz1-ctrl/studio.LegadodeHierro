const {test}=require('node:test'),assert=require('node:assert/strict');
const {Storage}=require('../cloudrun/unify/node_modules/@google-cloud/storage');
const {GoogleAuth}=require('../cloudrun/unify/node_modules/google-auth-library');
process.env.BUCKET='test-only-bucket';process.env.RENDER_JOB_RESOURCE='projects/test/locations/test/jobs/legado-render';
const memory=new Map(),requests=[];let generation=0;
const missing=()=>Object.assign(new Error('missing'),{code:404});
Storage.prototype.bucket=function(){return {file(name){return {
  async download(){if(!memory.has(name))throw missing();return [Buffer.from(JSON.stringify(memory.get(name).data))];},
  async save(bytes,opts){const old=memory.get(name),g=opts?.preconditionOpts?.ifGenerationMatch;if(g!==undefined&&String(g)!==String(old?old.generation:0))throw Object.assign(new Error('conflict'),{code:412});memory.set(name,{data:JSON.parse(bytes),generation:String(++generation)});},
  async getMetadata(){if(!memory.has(name))throw missing();return [{generation:memory.get(name).generation}];},
  async delete(){memory.delete(name);}
};}};};
GoogleAuth.prototype.getClient=async()=>({request:async args=>{requests.push(args);return {data:{name:'operations/test'}};}});
const {startJob,runWorker}=require('../cloudrun/unify');
const payload={shots:[{kind:'image',object:'legado-studio/media/image.png',duration:8}],audioObjects:['legado-studio/media/narration.wav'],aspect:'9:16'};
test('render starts one durable execution for repeated requests and stores only file references',async()=>{
  const before=requests.length,id=await startJob(payload);assert.equal(await startJob(payload),id);assert.equal(requests.length,before+1);
  assert.equal(requests.at(-1).data.overrides.containerOverrides[0].env[0].value,id);
  assert.deepEqual(memory.get('unify/requests/'+id+'.json').data,payload);
  memory.get('unify/'+id+'.json').data={status:'done',object:'unify/'+id+'.mp4'};
  assert.equal(await startJob(payload),id);assert.equal(requests.length,before+1);
});
test('a stale execution can be restarted and its deterministic ID preserves render checkpoints',async()=>{
  const data={...payload,srt:'1\n00:00:00,000 --> 00:00:02,000\nPrueba\n'},id=await startJob(data),before=requests.length;
  memory.get('unify/'+id+'.json').data={status:'running',updatedAt:new Date(Date.now()-3800000).toISOString()};
  assert.equal(await startJob(data),id);assert.equal(requests.length,before+1);
});
test('another active worker lease prevents overlapping processing of the same montage',async()=>{
  const id='job-'+('a'.repeat(24));memory.set('unify/locks/'+id+'.json',{data:{execution:'another-worker',until:Date.now()+30000},generation:'99'});
  await runWorker(id);assert.ok(memory.has('unify/locks/'+id+'.json'),'the other worker owns its lock');
});
test('missing durable runner configuration fails clearly before scheduling anything',async()=>{
  const resource=process.env.RENDER_JOB_RESOURCE;delete process.env.RENDER_JOB_RESOURCE;const before=requests.length;
  try{await assert.rejects(startJob(payload),/Falta instalar/);assert.equal(requests.length,before);}finally{process.env.RENDER_JOB_RESOURCE=resource;}
});
