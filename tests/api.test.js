const {test}=require('node:test'),assert=require('node:assert/strict');
const base=require('../api/_store');
const memory=new Map();let generation=0;
const store={
  async read(p){return memory.has(p)?structuredClone(memory.get(p)):null;},
  async put(p,data,g){const old=memory.get(p);if(g!==undefined&&String(g)!==String(old?old.generation:0)){const e=new Error('conflict');e.status=412;throw e;}const next=String(++generation);memory.set(p,{data:structuredClone(data),generation:next});return {generation:next};},
  async info(p){return p.startsWith('legado-studio/media/')?{name:p}:null;},
  async list(prefix){return {items:[...memory].filter(([k])=>k.startsWith(prefix)).map(([name,r])=>({name,metadata:{record:JSON.stringify(r.data)}}))};}
};
base.makeStore=()=>store;base.signedUrl=(o,method)=>'https://storage.example.test/'+encodeURIComponent(o)+(method?'?method='+method:'');
process.env.APP_KEY='test-only-personal-key';
const handler=require('../api/studio'),jobHandler=require('../api/studio-job');
async function request(body,authorized=true,fn=handler){
  const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(d){this.body=d;return this;},end(){return this;}};
  await fn({method:'POST',headers:authorized?{'x-app-key':process.env.APP_KEY}:{},body},res);return res;
}
test('studio and job operations require the existing personal key before accessing storage',async()=>{
  const before=memory.size;
  for(const fn of [handler,jobHandler]){const r=await request({action:'assets'},false,fn);assert.equal(r.statusCode,401);assert.equal(r.body.code,'APP_AUTH');}
  assert.equal(memory.size,before);
});
test('project writes preserve independent captions/materials and reject stale versions and embedded media',async()=>{
  const id='project-api-001';let r=await request({action:'project-save',id,project:{topic:'Prueba',a:'Un guion completo.'}});assert.equal(r.body.version,1);
  r=await request({action:'project-save',id,version:1,project:{caption:'Texto para publicar'}});assert.equal(r.body.version,2);
  r=await request({action:'project-save',id,version:1,project:{a:'Texto obsoleto'}});assert.equal(r.statusCode,409);
  r=await request({action:'project-get',id});assert.equal(r.body.project.a,'Un guion completo.');assert.equal(r.body.project.caption,'Texto para publicar');
  r=await request({action:'project-save',id,project:{images:['data:image/png;base64,AAAA']}});assert.equal(r.statusCode,400);
});
test('signed uploads validate type/size and narration links only resolve the saved project reference',async()=>{
  let r=await request({action:'upload',size:10,mime:'text/html'});assert.equal(r.statusCode,400);
  r=await request({action:'upload',size:301*1024*1024,mime:'video/mp4'});assert.equal(r.statusCode,400);
  r=await request({action:'upload',size:200,mime:'audio/wav',narration:true});assert.match(r.body.object,/^legado-studio\/media\/.+\.wav$/);assert.match(r.body.url,/method=PUT/);
  const object=r.body.object;
  await request({action:'project-save',id:'project-api-002',project:{uploadedAudio:{es:{object}}}});
  r=await request({action:'narration-link',id:'project-api-002',lang:'es'});assert.match(r.body.url,/storage.example.test/);
  r=await request({action:'narration-link',id:'project-api-002',lang:'en'});assert.equal(r.statusCode,404);
});
test('publication measurements canonicalize share parameters, reject mismatched platforms and update one observation',async()=>{
  const metric={topic:'Un método concreto',hook:'Antes de gastar',family:'metodo',platform:'facebook',window:'7d',publishedAt:'2026-08-01T12:00:00Z',measuredAt:'2026-08-08T12:00:00Z',url:'https://www.facebook.com/reel/123?mibextid=tracking',duration:90,views:500,avgWatch:35,revenue:'',bonus:0};
  let r=await request({action:'metric-save',metric});assert.equal(r.statusCode,200);const id=r.body.metric.id;assert.equal(r.body.metric.revenue,null);
  r=await request({action:'metric-save',metric:{...metric,url:'https://www.facebook.com/reel/123',views:650}});assert.equal(r.body.metric.id,id);
  r=await request({action:'metrics'});assert.equal(r.body.items.length,1);assert.equal(r.body.items[0].views,650);
  r=await request({action:'metric-save',metric:{...metric,platform:'youtube'}});assert.equal(r.statusCode,400);
  r=await request({action:'metric-save',metric:{...metric,measuredAt:'2026-09-01'}});assert.equal(r.statusCode,400);
});
