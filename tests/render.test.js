const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(),'legado-render-test-'));
const files = new Map(), saves = new Map();
function ff(args){return execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{timeout:180000});}
const {Storage} = require('../cloudrun/unify/node_modules/@google-cloud/storage');
const originalBucket = Storage.prototype.bucket;
Storage.prototype.bucket = function(){return {
  file(object){return {
    async exists(){return [files.has(object)];},
    async save(bytes){const f=path.join(root,'object-'+files.size+'-'+Date.now()+'.bin');fs.writeFileSync(f,bytes);files.set(object,f);saves.set(object,(saves.get(object)||0)+1);},
    async download({destination}={}){if(!files.has(object)){const e=new Error('not found');e.code=404;throw e;}if(destination){fs.copyFileSync(files.get(object),destination);return;}return [fs.readFileSync(files.get(object))];}
  };},
  async upload(file,{destination}){const f=path.join(root,'final.mp4');fs.copyFileSync(file,f);files.set(destination,f);}
};};
process.env.BUCKET='test-bucket';
const {processJob,probeDuration,probeSize}=require('../cloudrun/unify');
test('real 8-minute MP4: repeated video + moving images + two audio parts + short music loop + subtitles', {timeout:900000},async()=>{
  try{
    const image=path.join(root,'image.png'),clip=path.join(root,'clip.mp4'),voice=path.join(root,'voice.wav'),music=path.join(root,'music.wav');
    ff(['-f','lavfi','-i','color=c=0x101020:s=180x320','-frames:v','1',image]);
    ff(['-f','lavfi','-i','color=c=0x203040:s=180x320:r=30','-t','240','-c:v','libx264','-pix_fmt','yuv420p',clip]);
    ff(['-f','lavfi','-i','sine=frequency=440:sample_rate=24000','-t','240','-c:a','pcm_s16le',voice]);
    ff(['-f','lavfi','-i','sine=frequency=110:sample_rate=48000','-t','4','-c:a','pcm_s16le',music]);
    files.set('legado-studio/media/img.png',image);files.set('legado-videos/clip.mp4',clip);files.set('legado-studio/media/a.wav',voice);files.set('legado-studio/media/b.wav',voice);files.set('musica/loop.wav',music);
    const durations=[3,118,118,3,118,120];
    const shots=durations.map((duration,i)=>({kind:i===0||i===3?'image':'video',object:i===0||i===3?'legado-studio/media/img.png':'legado-videos/clip.mp4',duration}));
    const id='job-000000000000000000000001';
    await processJob(id,{shots,audioObjects:['legado-studio/media/a.wav','legado-studio/media/b.wav'],music:{object:'musica/loop.wav',volume:0.35},srt:'1\n00:00:00,300 --> 00:00:02,500\nEl comienzo.\n\n2\n00:04:00,000 --> 00:04:02,000\nLa mitad.\n\n3\n00:07:56,000 --> 00:07:59,000\nEl final completo.\n',targetSeconds:480,aspect:'9:16'});
    const status=JSON.parse(fs.readFileSync(files.get('unify/'+id+'.json'))),out=files.get('unify/'+id+'.mp4');
    assert.equal(status.status,'done');assert.equal(status.subtitulos,true);assert.deepEqual(status.avisos,[]);
    assert.ok(Math.abs(await probeDuration(out)-480)<0.15);assert.deepEqual(await probeSize(out),{w:720,h:1280});
    const audioDuration=Number(execFileSync('ffprobe',['-v','error','-select_streams','a:0','-show_entries','stream=duration','-of','csv=p=0',out],{encoding:'utf8'}));
    assert.ok(Math.abs(audioDuration-480)<0.15);
    assert.equal([...saves.keys()].filter(k=>k.startsWith('unify/parts/')).length,4);
    // The bed still has energy in its own frequency band after minute 7. This
    // specifically catches the previous 12-copy cap dropping music early.
    const bed=ff(['-ss','470','-i',out,'-t','2','-vn','-af','lowpass=f=180','-ar','8000','-ac','1','-f','f32le','pipe:1']);
    let energy=0;for(let i=0;i+3<bed.length;i+=4)energy+=bed.readFloatLE(i)**2;
    assert.ok(Math.sqrt(energy/(bed.length/4))>0.002,'music remains audible near the end');
    console.log('Measured MP4: '+status.duracion+' s, 720×1280, captions and music through the end.');
  }finally{Storage.prototype.bucket=originalBucket;fs.rmSync(root,{recursive:true,force:true});}
});
