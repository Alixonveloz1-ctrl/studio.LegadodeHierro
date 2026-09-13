// Local browser fixture. Real studio API handlers and persistent job state;
// provider outputs and cloud storage are simulated. Never calls paid services.
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const {execFileSync}=require('child_process');
const PORT=Number(process.env.PORT)||4173,root=path.join(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'legado-preview-'));
const memory=new Map();let generation=0;
function wave(){const b=Buffer.alloc(44+24000*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVE',8);b.write('fmt ',12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(b.length-44,40);for(let i=0;i<24000;i++)b.writeInt16LE(Math.sin(i*2*Math.PI*220/24000)*4000,44+i*2);return b;}
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jA1kAAAAASUVORK5CYII=','base64');
const clip=path.join(temp,'clip.mp4');execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','color=c=0x203040:s=180x320:r=30','-f','lavfi','-i','sine=frequency=220','-t','2','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac',clip]);
const store={
  async read(p){const r=memory.get(p);return r?{data:JSON.parse(r.bytes.toString()),generation:r.generation}:null;},
  async put(p,d,g,catalog){const old=memory.get(p);if(g!==undefined&&String(g)!==String(old?old.generation:0)){const e=new Error('conflict');e.status=412;throw e;}const gen=String(++generation);memory.set(p,{bytes:Buffer.from(JSON.stringify(d)),generation:gen,mime:'application/json',record:catalog?d:null});return {generation:gen};},
  async bytes(p,b,mime){memory.set(p,{bytes:b,generation:String(++generation),mime});return {generation:String(generation)};},
  async info(p){return memory.has(p)?{name:p,size:memory.get(p).bytes.length}:null;},
  async list(prefix,cursor,size){const all=[...memory].filter(([k])=>k.startsWith(prefix)).sort(([a],[b])=>a.localeCompare(b));const start=Number(cursor)||0;return {items:all.slice(start,start+(size||100)).map(([name,v])=>({name,size:v.bytes.length,contentType:v.mime,metadata:{record:JSON.stringify(v.record)}})),nextPageToken:start+(size||100)<all.length?String(start+(size||100)):''};}
};
const base=require('../api/_store');base.makeStore=()=>store;base.signedUrl=(object)=>'http://127.0.0.1:'+PORT+'/media/'+encodeURIComponent(object);
const paragraph='Imagina que quieres ofrecer un servicio. Antes de comprar herramientas, habla con una persona que tenga ese problema. Pregunta qué necesita, propone una prueba pequeña y anota lo que cuesta hacerla. Así puedes tomar una decisión con información concreta.';
const scenes=['Calcular presupuesto en la oficina con una calculadora y manos en primer plano','Caminar solo por una calle tranquila, plano general, determinación y luz sobria'];
require('../api/_text').generateText=async(prompt)=>{
  if(prompt.includes('ESTA LLAMADA SOLO PLANIFICA'))return {text:JSON.stringify({sections:Array.from({length:Number((/EXACTAMENTE (\d+) sections/.exec(prompt)||[])[1])||6},(_,i)=>({title:'Parte '+i,beat:'Decisión nueva, ejemplo y consecuencia observable '+i})),scenes:Array.from({length:prompt.includes('EXACTAMENTE 8 scenes')?8:10},(_,i)=>scenes[i%2]),set:'Estudio con pizarra, luz cálida, un mismo traje'})};
  if(prompt.includes('ENCARGO DE ESTA ETAPA'))return {text:Array(5).fill(paragraph).join('\n\n')};
  if(prompt.startsWith('Adapt the following'))return {text:'You can start with a small test and a concrete decision. '.repeat(20)};
  if(prompt.includes('CAPTION_EN:'))return {text:'CAPTION:\nPrueba tu idea antes de gastar.\nHASHTAGS:\n#LegadoDeHierro #Disciplina\nTIKTOK:\n#Disciplina\nYOUTUBE:\nPrueba tu idea con una pregunta\nCAPTION_EN:\nTest your idea before spending.\nHASHTAGS_EN:\n#IronLegacy\nTIKTOK_EN:\n#Discipline\nYOUTUBE_EN:\nTest your idea first'};
  const n=Number((/exactamente (\d+) líneas PROMPT/.exec(prompt)||[])[1])||5;
  return {text:'BLOQUE A\n'+Array(n).fill(paragraph).join('\n\n')+'\nLegado de Hierro.\n\nBLOQUE C\n'+Array.from({length:n},(_,i)=>'PROMPT '+(i+1)+': '+scenes[i%2]).join('\n'),finishReason:'STOP'};
};
require('../api/_voice').generateAudioChunk=async()=>({parts:[wave().toString('base64')],alignments:[null],format:'wav'});
const handlers={studio:require('../api/studio'),'studio-job':require('../api/studio-job'),generate:require('../api/generate')};
const {register}=require('../api/_assets');
async function seed(){for(let i=0;i<4;i++){const object='legado-studio/media/fixture-'+i+(i%2?'.png':'.mp4');await store.bytes(object,i%2?png:fs.readFileSync(clip),i%2?'image/png':'video/mp4');await register(store,{kind:i%2?'image':'video',title:'Toma de prueba '+(i+1),description:scenes[i%2],aspect:'9:16',favorite:i===0},object);}}
const json=(res,d,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(d));};
seed().then(()=>http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname.startsWith('/media/')){const name=decodeURIComponent(u.pathname.slice(7)),v=memory.get(name);if(req.method==='PUT'){const parts=[];for await(const c of req)parts.push(c);await store.bytes(name,Buffer.concat(parts),req.headers['content-type']);res.end();return;}if(!v){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':v.mime});return res.end(v.bytes);}
  if(u.pathname==='/fixture.mp4'){res.writeHead(200,{'Content-Type':'video/mp4'});return res.end(fs.readFileSync(clip));}
  if(u.pathname.startsWith('/api/')){
    let body=[];for await(const c of req)body.push(c);let b={};try{b=JSON.parse(Buffer.concat(body).toString());}catch(e){}
    const name=u.pathname.slice(5);
    if(handlers[name]){req.body=b;res.status=n=>{res.statusCode=n;return res;};res.json=d=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(d));return res;};return handlers[name](req,res);}
    if(name==='login')return json(res,{success:true,ok:true,abierto:true});
    if(name==='refs')return json(res,{success:true,refs:Array(4).fill(png.toString('base64')),personajes:[]});
    if(name==='music')return json(res,{success:true,tracks:[]});
    if(name==='unify'&&req.method==='GET')return json(res,{estado:'al-dia',actual:'2026-09-13.1',esperada:'2026-09-13.1'});
    if(name==='unify')return json(res,{success:true,jobId:'job-111111111111111111111111'});
    if(name==='unify-status')return json(res,{done:true,videoUrl:'/fixture.mp4',duracion:2,avisos:[]});
    if(name==='image')return json(res,{success:true,image:png.toString('base64')});
    return json(res,{success:true,personajes:[],refs:[]});
  }
  const name=u.pathname==='/'?'index.html':u.pathname.slice(1),file=path.resolve(root,'public',name);
  if(!file.startsWith(path.join(root,'public')+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript','.css':'text/css'}[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(fs.readFileSync(file));
}).listen(PORT,'0.0.0.0',()=>console.log('Local studio fixture http://127.0.0.1:'+PORT)));
