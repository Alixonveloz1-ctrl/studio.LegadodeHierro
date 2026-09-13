const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../public/studio-core');
const {createJob,advanceJob,BASE}=require('../server/_jobs');
const {parsePlan,parseReview}=require('../server/_editorial');
class MemoryStore {
  constructor(){this.rows=new Map();this.seq=0;this.failState=false;}
  async read(p){return structuredClone(this.rows.get(p)||null);}
  async put(p,data,g){
    const old=this.rows.get(p);if(g!==undefined&&String(g)!==String(old?old.generation:0)){const e=new Error('conflict');e.status=412;throw e;}
    if(this.failState&&data.status==='ready'){this.failState=false;throw new Error('lost state response');}
    const generation=String(++this.seq);this.rows.set(p,{data:structuredClone(data),generation});return {generation};
  }
}
function config(seconds=30){return {type:'script',editorialVersion:2,seconds,sceneCount:seconds>=180?10:3,mode:seconds>=180?'relato':'reel',prompt:core.editorial({family:'metodo',seconds})+'\nTema: probar un servicio antes de gastar.'};}
function plan(n){return {audienceMoment:'Una persona que dispone de poco tiempo después del trabajo.',promise:'Mostrar una prueba pequeña antes de gastar dinero.',payoff:'Una conversación permite decidir qué probar al día siguiente.',hooks:[{text:'Tu primera venta empieza con una pregunta concreta.',why:'Conecta el tema con una acción posible.'},{text:'Imagina que compras herramientas antes de escuchar al cliente.',why:'Una escena anticipa el coste de la decisión.'},{text:'¿Qué problema pagarían por resolver tus vecinos?',why:'Abre una pregunta que la demostración responderá.'}],selectedHook:0,sections:Array.from({length:n},(_,i)=>({title:'Decisión '+i,beat:'La parte '+i+' añade un obstáculo diferente y una consecuencia verificable.'}))};}
function checks(parts,revise=false){return {summary:'El ejemplo conecta con el problema; se ha revisado la promesa y el cierre.',checks:Object.keys(core.CRITERIA).map((criterion,i)=>({criterion,status:revise&&i===3?'revise':'ok',section:1,evidence:parts[0].text.slice(0,70),reason:revise&&i===3?'El ejemplo requiere una acción que se pueda observar.':'El pasaje aporta una función coherente con el encargo.',fix:revise&&i===3?'Añadir una pregunta específica al cliente y la decisión que permite tomar.':''}))};}
function prose(n,label){return Array.from({length:n},(_,i)=>i===0?label:'palabra'+i).join(' ')+'.';}
async function runStep(store,j,text){return advanceJob(store,j.id,{text});}

test('editorial review rejects invented quotations, duplicated criteria and incomplete plans',()=>{
  assert.throws(()=>parsePlan(JSON.stringify(plan(1)),2),/Falta/);
  const parts=[{text:'Una pregunta concreta permite decidir qué servicio probar primero.'}],r=checks(parts);
  assert.equal(parseReview(JSON.stringify(r),parts).checks.length,7);
  r.checks[0].evidence='El narrador nunca dijo estas palabras.';
  assert.throws(()=>parseReview(JSON.stringify(r),parts),/fragmento inexistente/);
  r.checks[0]={...r.checks[1]};assert.throws(()=>parseReview(JSON.stringify(r),parts),/siete criterios/);
});

test('short scripts get one bounded repair cycle and scenes from the revised text, even if final criticism remains',async()=>{
  for(const finalNeedsWork of [false,true]){
    const store=new MemoryStore(),c=config();let j=await createJob(store,c,'short-editorial-001'),calls=0;
    const text=async prompt=>{
      calls++;
      if(prompt.includes('SOLO PLAN EDITORIAL'))return {text:JSON.stringify(plan(1))};
      if(prompt.includes('ESCRIBIR SOLO'))return {text:prose(71,'Borrador')};
      if(prompt.startsWith('Actúa como editor')){
        const parts=JSON.parse(prompt.split('PARTES DEL TEXTO A EVALUAR: ')[1]);
        return {text:JSON.stringify(checks(parts,parts[0].text.startsWith('Borrador')||finalNeedsWork))};
      }
      if(prompt.includes('CORREGIR SOLO'))return {text:prose(71,'Revisado')};
      assert.match(prompt,/SOLO PLAN VISUAL/);assert.match(prompt,/GUION DEFINITIVO: Revisado/);
      return {text:JSON.stringify({scenes:Array.from({length:3},(_,i)=>'Un cliente y el protagonista conversan en el taller, plano '+i)})};
    };
    while(j.status!=='done'){
      const before=calls;j=await runStep(store,j,text);assert.equal(calls-before,1,'each request calls the model at most once');assert.ok(calls<=6,'there is no endless rewrite loop');
    }
    assert.equal(calls,6);assert.equal(j.progress,100);assert.equal(j.result.c.length,3);
    assert.match(j.result.a,/^Revisado/);assert.match(j.result.draftA,/^Borrador/);
    assert.deepEqual(j.result.quality.rewrittenSections,[1]);assert.equal(j.result.quality.status,finalNeedsWork?'needs_revision':'reviewed');
    assert.equal(j.result.quality.scriptFingerprint,core.fingerprint(j.result.a));
    const repeated=await runStep(store,j,text);assert.equal(calls,6);assert.deepEqual(repeated.result.quality,j.result.quality);
  }
});

test('an eight-minute story keeps all parts when the saved review response is lost and resumes without a second model call',async()=>{
  const store=new MemoryStore(),c=config(480);let j=await createJob(store,c,'long-editorial-001'),calls=0,writes=0,reviewCalls=0;
  const n=Math.ceil(c.seconds*2.35/220),target=Math.round(c.seconds*2.35/n);
  const text=async prompt=>{
    calls++;
    if(prompt.includes('SOLO PLAN EDITORIAL'))return {text:JSON.stringify(plan(n))};
    if(prompt.includes('ESCRIBIR SOLO'))return {text:prose(target,'Parte'+(++writes))};
    if(prompt.startsWith('Actúa como editor')){
      reviewCalls++;const parts=JSON.parse(prompt.split('PARTES DEL TEXTO A EVALUAR: ')[1]);assert.equal(parts.length,n);
      store.failState=true;return {text:JSON.stringify(checks(parts))};
    }
    return {text:JSON.stringify({scenes:Array.from({length:10},(_,i)=>'Protagonista sostiene una conversación distinta en el taller, plano '+i)})};
  };
  for(let i=0;i<n+1;i++)j=await runStep(store,j,text);
  await assert.rejects(runStep(store,j,text),/lost state response/);
  const failed=await store.read(BASE+j.id+'.json');assert.equal(failed.data.parts.length,n);assert.equal(failed.data.status,'paused');
  const before=calls;j=await runStep(store,j,text);assert.equal(calls,before);assert.equal(reviewCalls,1);
  j=await runStep(store,j,text);assert.equal(j.status,'done');assert.equal(writes,n);
  assert.equal(j.result.c.length,10);assert.equal(j.result.quality.status,'reviewed');assert.equal(core.words(j.result.a).length,n*target);
});

test('manual review is tied to exact text and repeated recovery reuses the persisted result',async()=>{
  const store=new MemoryStore();let calls=0;
  const c={type:'review',text:'Una pregunta concreta permite decidir qué servicio probar primero. Legado de Hierro.',prompt:core.editorial({family:'metodo'})};
  let j=await createJob(store,c,'manual-review-001');
  const text=async prompt=>{calls++;return {text:JSON.stringify(checks(JSON.parse(prompt.split('PARTES DEL TEXTO A EVALUAR: ')[1])))};};
  j=await runStep(store,j,text);assert.equal(j.status,'done');assert.equal(j.result.quality.scriptFingerprint,core.fingerprint(c.text));
  await createJob(store,c,'manual-review-001');await runStep(store,j,text);assert.equal(calls,1);
  const changed=await createJob(store,{...c,text:c.text+' Otra decisión.'},'manual-review-001');assert.notEqual(changed.id,j.id);
});

test('references retain evidence limits and the intended duration changes the writing architecture',()=>{
  const short=core.editorial({family:'identidad',seconds:45}),long=core.editorial({family:'relato',seconds:480});
  assert.match(short,/1368185258400051/);assert.match(short,/no transcripción completa/);assert.match(short,/FORMATO CORTO/);
  assert.match(long,/4ahkhdd5U2g/);assert.match(long,/FORMATO LARGO/);assert.match(long,/No estires un reel/);
  const privateData=/content\/insights|professional_dashboard|revenue|nonFollowers/;
  assert.equal(privateData.test(JSON.stringify(core.REFERENCES)),false);
});
