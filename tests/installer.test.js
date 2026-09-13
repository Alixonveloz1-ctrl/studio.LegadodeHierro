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
    elif '--format=value(status.latestReadyRevisionName)' in a: print('new-revision')
    elif '--format=value(status.url)' in a: print('https://renderer.example.test')
    else: sys.exit(2)
elif a[:3]==['storage','buckets','describe']:
    print(json.dumps({'cors_config':[{'origin':['https://other-app.example'],'method':['GET'],'maxAgeSeconds':600}]}))
elif a[:3]==['storage','buckets','update']:
    p=next(x.split('=',1)[1] for x in a if x.startswith('--cors-file='))
    rules=json.load(open(p)); assert len(rules)==2 and rules[0]['origin']==['https://other-app.example']
elif a[:2]==['run','deploy']:
    assert '--no-traffic' in a and '--source' in a
    assert sorted(os.listdir('.'))==['Dockerfile','index.js','package-lock.json','package.json','timeline.js']
    assert all('fixture-secret-do-not-upload' not in p.read_text() for p in pathlib.Path('.').iterdir())
elif a[:3]==['run','revisions','describe']:
    print('us-docker.pkg.dev/fixture/renderer@sha256:'+'a'*64)
elif a[:3]==['run','jobs','deploy']:
    assert '--execute-now' not in a
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
  const health={service:'legado-unify',version:'2026-09-13.1',durable:failure!=='health'};
  fs.writeFileSync(path.join(bin,'curl'),'#!/usr/bin/env python3\nimport sys\nopen(sys.argv[sys.argv.index("-o")+1],"w").write('+JSON.stringify(JSON.stringify(health))+')\n',{mode:0o755});
  try{
    const result=spawnSync('bash',[],{input:script,encoding:'utf8',cwd:dir,timeout:20000,env:{...process.env,PATH:bin+path.delimiter+process.env.PATH,LH_INSTALL_LOG:log,LH_INSTALL_FAIL:failure||'',LEGADO_PROJECT_ID:'fixture',LEGADO_REGION:'us-central1'}});
    return {...result,calls:fs.existsSync(log)?fs.readFileSync(log,'utf8').trim().split('\n').map(JSON.parse):[]};
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
test('one-command installer builds without credentials and activates only after the job and its permission exist',()=>{
  const r=runInstaller();assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/LISTO: montaje actualizado/);assert.doesNotMatch(r.stdout+r.stderr,/fixture-secret-do-not-upload/);
  const index=prefix=>r.calls.findIndex(a=>a.slice(0,prefix.length).join(' ')===prefix.join(' '));
  assert.ok(index(['run','deploy'])<index(['run','jobs','deploy']));
  assert.ok(index(['run','jobs','add-iam-policy-binding'])<index(['run','services','update-traffic']));
  const activate=r.calls.filter(a=>a.slice(0,3).join(' ')==='run services update-traffic');assert.equal(activate.length,1);assert.ok(activate[0].includes('new-revision=100'));
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
