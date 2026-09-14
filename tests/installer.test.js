const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const source=fs.readFileSync(path.join(__dirname,'../public/u.sh'),'utf8');
// Execute the real shell installer with a simulated gcloud. No cloud account,
// builds or deployments are used by these tests.
const mock=`#!/usr/bin/env python3
import json,os,sys,pathlib
a=sys.argv[1:]
with open(os.environ['LH_INSTALL_LOG'],'a') as f: f.write(json.dumps(a)+'\\n')
if a[:4]==['run','services','describe','legado-unify']:
    if '--format=json' in a:
        print(json.dumps({'spec':{'template':{'spec':{'containers':[{'env':[{'name':'BUCKET','value':'fixture-bucket'},{'name':'UNIFY_KEY','value':'fixture-secret-do-not-upload'}]}]}}},'status':{'traffic':[{'revisionName':'old-revision','percent':100}]}}))
    elif '--format=value(spec.template.spec.serviceAccountName)' in a: print('fixture@example.iam.gserviceaccount.com')
    # Reproduce the real failure: this service field still names the old revision.
    elif '--format=value(status.latestReadyRevisionName)' in a: print('old-revision')
    elif '--format=value(status.url)' in a: print('https://renderer.example.test')
    else: sys.exit(2)
elif a[:3]==['storage','buckets','describe']:
    print(json.dumps({'cors_config':[{'origin':['https://other-app.example'],'method':['GET'],'maxAgeSeconds':600}]}))
elif a[:3]==['storage','buckets','update']:
    p=next(x.split('=',1)[1] for x in a if x.startswith('--cors-file='))
    rules=json.load(open(p)); assert len(rules)==2 and rules[0]['origin']==['https://other-app.example']
elif a[:2]==['run','deploy']:
    assert '--no-traffic' in a and '--source' in a
    suffix=a[a.index('--revision-suffix')+1] if '--revision-suffix' in a else '00010-fixture'
    pathlib.Path(os.environ['LH_INSTALL_REVISION']).write_text('legado-unify-'+suffix)
    assert sorted(os.listdir('.'))==['Dockerfile','index.js','package-lock.json','package.json','timeline.js']
    assert all('fixture-secret-do-not-upload' not in p.read_text() for p in pathlib.Path('.').iterdir())
elif a[:3]==['run','revisions','describe']:
    current=pathlib.Path(os.environ['LH_INSTALL_REVISION']).read_text()
    image='us-docker.pkg.dev/fixture/renderer@sha256:'+('a' if a[3]==current else 'b')*64
    if '--format=value(status.imageDigest)' in a: print(image)
    else:
        fail=os.environ.get('LH_INSTALL_FAIL','')
        countfile=pathlib.Path(os.environ['LH_INSTALL_REVISION']+'.reads')
        count=int(countfile.read_text())+1 if countfile.exists() else 1
        countfile.write_text(str(count))
        ready=fail!='revision' and not (fail=='propagation' and count==1)
        env=[{'name':'UNIFY_KEY','value':'fixture-secret-do-not-upload'}]
        if fail!='runner': env.append({'name':'RENDER_JOB_RESOURCE','value':'projects/fixture/locations/us-central1/jobs/legado-render'})
        print(json.dumps({'metadata':{'name':a[3]},'spec':{'containers':[{'env':env}]},'status':{'imageDigest':image if fail!='image' else '', 'conditions':[{'type':'Ready','status':'True' if ready else 'False'}]}}))
elif a[:3]==['run','jobs','deploy']:
    assert '--execute-now' not in a
    assert a[a.index('--image')+1]=='us-docker.pkg.dev/fixture/renderer@sha256:'+'a'*64
    if os.environ.get('LH_INSTALL_FAIL')=='job': sys.exit('Error simulado al crear el job')
elif a[:3]==['run','jobs','add-iam-policy-binding']: pass
elif a[:3]==['run','services','update-traffic']: pass
else: sys.exit('Comando inesperado: '+str(a))
`;
function runInstaller(failure,script=source){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'legado-installer-test-')),bin=path.join(dir,'bin'),log=path.join(dir,'calls.jsonl');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin,'gcloud'),mock,{mode:0o755});
  fs.writeFileSync(path.join(bin,'sleep'),'#!/bin/sh\nexit 0\n',{mode:0o755});
  const health={service:'legado-unify',version:'2026-09-14.1',durable:failure!=='health'};
  fs.writeFileSync(path.join(bin,'curl'),'#!/usr/bin/env python3\nimport sys\nopen(sys.argv[sys.argv.index("-o")+1],"w").write('+JSON.stringify(JSON.stringify(health))+')\n',{mode:0o755});
  try{
    const result=spawnSync('bash',[],{input:script,encoding:'utf8',cwd:dir,timeout:20000,env:{...process.env,PATH:bin+path.delimiter+process.env.PATH,LH_INSTALL_LOG:log,LH_INSTALL_REVISION:path.join(dir,'revision'),LH_INSTALL_FAIL:failure||'',LEGADO_PROJECT_ID:'fixture',LEGADO_REGION:'us-central1'}});
    return {...result,calls:fs.existsSync(log)?fs.readFileSync(log,'utf8').trim().split('\n').map(JSON.parse):[]};
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
test('installer uses the created revision despite a stale latestReady pointer, with the same image in its job',()=>{
  const r=runInstaller();assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/LISTO: montaje actualizado/);assert.doesNotMatch(r.stdout+r.stderr,/fixture-secret-do-not-upload/);
  const index=prefix=>r.calls.findIndex(a=>a.slice(0,prefix.length).join(' ')===prefix.join(' '));
  assert.ok(index(['run','deploy'])<index(['run','jobs','deploy']));
  assert.ok(index(['run','jobs','add-iam-policy-binding'])<index(['run','services','update-traffic']));
  const deploy=r.calls.find(a=>a.slice(0,2).join(' ')==='run deploy'),suffix=deploy[deploy.indexOf('--revision-suffix')+1];
  assert.match(suffix,/^lh-[a-f0-9]{16}$/);
  const activate=r.calls.filter(a=>a.slice(0,3).join(' ')==='run services update-traffic');assert.equal(activate.length,1);assert.ok(activate[0].includes('legado-unify-'+suffix+'=100'));
});
test('an unready or incomplete candidate never replaces the serving revision or updates its job',()=>{
  for(const failure of ['revision','image','runner']){
    const r=runInstaller(failure);assert.notEqual(r.status,0);assert.doesNotMatch(r.stdout,/LISTO:/);assert.match(r.stderr,/montador anterior sigue activo/);
    assert.equal(r.calls.filter(a=>a.slice(0,3).join(' ')==='run services update-traffic'||a.slice(0,3).join(' ')==='run jobs deploy').length,0);
  }
});
test('revision readiness propagation is retried without rebuilding or selecting another revision',()=>{
  const r=runInstaller('propagation');assert.equal(r.status,0,r.stderr);
  const revisions=r.calls.filter(a=>a.slice(0,3).join(' ')==='run revisions describe');assert.equal(revisions.length,2);assert.equal(revisions[0][3],revisions[1][3]);
  assert.equal(r.calls.filter(a=>a.slice(0,2).join(' ')==='run deploy').length,1);
});
test('failed job installation leaves the serving revision unchanged and reports the failed step',()=>{
  const r=runInstaller('job');assert.notEqual(r.status,0);assert.doesNotMatch(r.stdout,/LISTO:/);assert.match(r.stderr,/instalar el ejecutor/);
  assert.equal(r.calls.filter(a=>a.slice(0,3).join(' ')==='run services update-traffic').length,0);
});
test('failed health verification restores the previous serving revision',()=>{
  const r=runInstaller('health');assert.notEqual(r.status,0);assert.doesNotMatch(r.stdout,/LISTO:/);
  const traffic=r.calls.filter(a=>a.slice(0,3).join(' ')==='run services update-traffic');assert.equal(traffic.length,2);assert.ok(traffic[1].includes('old-revision=100'));
});
test('an interrupted installer download performs no cloud operations',()=>{
  const r=runInstaller('',source.slice(0,source.indexOf("cat > package.json <<'ARCHIVO_FIN'")));
  assert.notEqual(r.status,0);assert.equal(r.calls.length,0);
});
