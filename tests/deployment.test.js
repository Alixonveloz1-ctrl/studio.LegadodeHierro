const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const config=require('../vercel.json');
const router=require('../api/index');
process.env.APP_KEY='deployment-test-only';
const base=require('../server/_store');
base.signedUrl=object=>'https://storage.example.test/'+object;
const {legacyPayload}=require('../server/_legacy-render');

function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(body){this.body=body;return this;},end(){return this;}};}
test('every public Node route is packaged in one function and keeps its authentication',async()=>{
  const endpoints=fs.readdirSync(path.join(__dirname,'../server')).filter(p=>!p.startsWith('_')).map(p=>p.replace(/\.js$/,''));
  assert.equal(config.rewrites.length,endpoints.length);
  for(const endpoint of endpoints){
    assert.deepEqual(config.rewrites.find(r=>r.source==='/api/'+endpoint),{source:'/api/'+endpoint,destination:'/api/index?endpoint='+endpoint});
    const res=response();
    await router({method:'POST',headers:{},query:{endpoint},body:{}},res);
    assert.equal(res.statusCode,401,endpoint);
  }
  assert.deepEqual(fs.readdirSync(path.join(__dirname,'../api')).sort(),['index.js','video-status.js']);
  assert.equal(config.functions['api/index.js'].maxDuration,300);
  assert.equal(config.fluid,true);
});
test('routing does not expose helpers or inherited object properties',async()=>{
  for(const endpoint of ['_store','constructor','__proto__','../server/_store',['studio','login'],undefined]){
    const res=response();await router({query:{endpoint},headers:{},method:'POST'},res);assert.equal(res.statusCode,404);
  }
});
test('legacy montage preserves image order and all narration parts with bounded downloads',async()=>{
  const reads=[];
  const store={async readBytes(object,max){reads.push({object,max});return Buffer.from(object);}};
  const body={shots:[{kind:'image',object:'image-a',duration:5},{kind:'image',object:'image-b',duration:5},{kind:'image',object:'image-a',duration:5}],audioObjects:['audio-1','audio-2'],srt:'subtitles',music:{object:'musica/test.mp3',volume:0.2},targetSeconds:15};
  const result=await legacyPayload(body,store);
  assert.deepEqual(result.imagenes.map(s=>Buffer.from(s,'base64').toString()),['image-a','image-b','image-a']);
  assert.deepEqual(result.audioParts.map(s=>Buffer.from(s,'base64').toString()),body.audioObjects);
  assert.equal(reads.filter(r=>r.object==='image-a').length,1);
  assert.ok(reads.every(r=>r.max>0&&r.max<35*1024*1024));
  assert.equal(result.srt,'subtitles');assert.deepEqual(result.music,body.music);
});
test('legacy montage does not discard mixed material, excessive duration or custom image timing',async()=>{
  const store={async readBytes(){assert.fail('unsupported montage must not download media');}};
  for(const shots of [
    [{kind:'image',object:'a',duration:5},{kind:'video',object:'b',duration:5}],
    [{kind:'image',object:'a',duration:480}],
    [{kind:'image',object:'a',duration:3},{kind:'image',object:'b',duration:7}],
    Array.from({length:61},()=>({kind:'video',object:'a',duration:8}))
  ])await assert.rejects(legacyPayload({shots,audioObjects:['audio']},store),e=>e.status===409);
});
test('legacy video montage signs references while preserving repeated clips',async()=>{
  const result=await legacyPayload({shots:[{kind:'video',object:'a.mp4',duration:5},{kind:'video',object:'a.mp4',duration:5}],audioObjects:['audio'],targetSeconds:10},{async readBytes(){return Buffer.from('audio');}});
  assert.deepEqual(result.videos,['https://storage.example.test/a.mp4','https://storage.example.test/a.mp4']);assert.equal(result.imagenes.length,0);
});

test('montage endpoint negotiates both deployed contracts and rejects an incomplete new runner',async()=>{
  const savedFetch=global.fetch,savedStore=base.makeStore;
  const object='legado-studio/media/scene.png',audio='legado-studio/media/voice.wav';
  base.makeStore=()=>({async read(){return {data:{object,kind:'image'}};},async readBytes(name){return Buffer.from(name);}});
  process.env.CLOUD_RUN_UNIFY_URL='https://renderer.example.test';process.env.UNIFY_KEY='test-render-key';
  const body={shots:[{object,kind:'image',duration:8}],audioObjects:[audio],aspect:'9:16'};
  try{
    for(const capability of [
      {service:'legado-unify',version:'2026-08-08.1'},
      {service:'legado-unify',version:'2026-09-13.1',durable:true},
      {service:'legado-unify',version:'2026-09-13.1',durable:false}
    ]){
      const sent=[];
      global.fetch=async(url,options)=>{
        if(url.endsWith('/start')){sent.push(JSON.parse(options.body));return Response.json({jobId:'job-'+('a'.repeat(24))});}
        return Response.json(capability);
      };
      const res=response();await router({method:'POST',headers:{'x-app-key':process.env.APP_KEY},query:{endpoint:'unify'},body},res);
      if(capability.durable===false){assert.equal(res.statusCode,409);assert.equal(sent.length,0);continue;}
      assert.equal(res.statusCode,200);assert.equal(sent.length,1);
      if(capability.durable){assert.deepEqual(sent[0].shots,body.shots);assert.deepEqual(sent[0].audioObjects,[audio]);assert.equal(sent[0].audioParts,undefined);}
      else{assert.equal(res.body.legacy,true);assert.equal(Buffer.from(sent[0].audioParts[0],'base64').toString(),audio);assert.equal(sent[0].shots,undefined);}
    }
  }finally{global.fetch=savedFetch;base.makeStore=savedStore;delete process.env.CLOUD_RUN_UNIFY_URL;delete process.env.UNIFY_KEY;}
});
