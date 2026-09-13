#!/usr/bin/env bash
# Update the existing personal service and install its durable render job.
# This script never prints or changes UNIFY_KEY; Cloud Run preserves it.
set -euo pipefail
umask 077
# Bash reads this complete function before changing anything. A truncated
# download cannot start half an installation when invoked with curl | bash.
legado_actualizar() {
LEGADO_STEP='comprobar tu configuración'
trap 'LEGADO_EXIT=$?; printf "\nNo se completó el paso: %s.\nPuedes repetir el mismo comando. Si vuelve a fallar, envía una captura del último error.\n" "$LEGADO_STEP" >&2; exit "$LEGADO_EXIT"' ERR
LEGADO_PROJECT_ID="${LEGADO_PROJECT_ID:-creaciondecontenido1}"
LEGADO_REGION="${LEGADO_REGION:-us-central1}"
LEGADO_STUDIO_ORIGIN="${LEGADO_STUDIO_ORIGIN:-https://studio.legadodehierro.com}"
printf '\nLEGADO DE HIERRO — actualización del montaje\n1/6 Comprobando tu configuración...\n'
LEGADO_WORK_DIR=$(mktemp -d)
trap 'rm -rf "$LEGADO_WORK_DIR"' EXIT
gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format=json > "$LEGADO_WORK_DIR/service.json"
LEGADO_BUCKET=$(python3 - "$LEGADO_WORK_DIR/service.json" "$LEGADO_WORK_DIR/traffic.txt" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
env=d['spec']['template']['spec']['containers'][0].get('env',[])
bucket=next((e.get('value','') for e in env if e['name']=='BUCKET'),'')
if not bucket: sys.exit('Falta BUCKET en el servicio existente.')
key=next((e for e in env if e['name']=='UNIFY_KEY'),{})
if not (key.get('value') or key.get('valueFrom')): sys.exit('Falta UNIFY_KEY en el servicio existente.')
traffic={}
for t in d.get('status',{}).get('traffic',[]):
    if t.get('revisionName') and t.get('percent',0)>0:
        traffic[t['revisionName']]=traffic.get(t['revisionName'],0)+t['percent']
if sum(traffic.values())!=100: sys.exit('No se pudo guardar el montaje activo para recuperarlo si hace falta.')
open(sys.argv[2],'w').write(','.join(f'{name}={percent}' for name,percent in traffic.items()))
print(bucket)
PY
)
# The service description contains environment values. Never send it to builds.
rm "$LEGADO_WORK_DIR/service.json"
LEGADO_SERVICE_ACCOUNT=$(gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(spec.template.spec.serviceAccountName)')
if [ -z "$LEGADO_SERVICE_ACCOUNT" ]; then
  LEGADO_PROJECT_NUMBER=$(gcloud projects describe "$LEGADO_PROJECT_ID" --format='value(projectNumber)')
  LEGADO_SERVICE_ACCOUNT="${LEGADO_PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
fi
# Direct uploads need GET/PUT CORS for the studio. Keep the other apps' rules.
LEGADO_STEP='preparar las subidas desde el celular'
printf '\n2/6 Preparando las subidas desde el celular...\n'
gcloud storage buckets describe "gs://$LEGADO_BUCKET" --project "$LEGADO_PROJECT_ID" --format='json(cors_config)' > "$LEGADO_WORK_DIR/cors-old.json"
python3 - "$LEGADO_WORK_DIR/cors-old.json" "$LEGADO_WORK_DIR/cors.json" "$LEGADO_STUDIO_ORIGIN" <<'PYTHON_CORS'
import json,sys
from urllib.parse import urlsplit
origin=sys.argv[3]
u=urlsplit(origin)
if u.scheme not in ('https','http') or not u.netloc or u.path not in ('','/'):
    sys.exit('LEGADO_STUDIO_ORIGIN debe ser el origen de la aplicación, sin ruta.')
old=json.load(open(sys.argv[1])).get('cors_config',[]) or []
if not isinstance(old,list): sys.exit('No se pudo leer CORS; no se modificó el bucket.')
rule={'origin':[origin.rstrip('/')],'method':['GET','HEAD','PUT'],'responseHeader':['Content-Type','Content-Length','ETag'],'maxAgeSeconds':3600}
if rule not in old: old.append(rule)
json.dump(old,open(sys.argv[2],'w'))
PYTHON_CORS
gcloud storage buckets update "gs://$LEGADO_BUCKET" --project "$LEGADO_PROJECT_ID" --cors-file="$LEGADO_WORK_DIR/cors.json" --quiet
rm "$LEGADO_WORK_DIR/cors-old.json" "$LEGADO_WORK_DIR/cors.json"
# Only these five source files enter the build, never service configuration.
mkdir "$LEGADO_WORK_DIR/source"
cd "$LEGADO_WORK_DIR/source"
# EMBED_FILES
LEGADO_STEP='construir el nuevo montador'
printf '\n3/6 Construyendo el nuevo montador. Este paso puede tardar varios minutos...\n'
gcloud run deploy legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --source . \
  --memory 2Gi --cpu 2 --timeout 300 --cpu-throttling --min-instances 0 --max-instances 1 \
  --no-traffic --update-env-vars "RENDER_JOB_RESOURCE=projects/$LEGADO_PROJECT_ID/locations/$LEGADO_REGION/jobs/legado-render" --quiet
LEGADO_REVISION=$(gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(status.latestReadyRevisionName)')
LEGADO_IMAGE=$(gcloud run revisions describe "$LEGADO_REVISION" --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(status.imageDigest)')
if [ -z "$LEGADO_REVISION" ] || [ -z "$LEGADO_IMAGE" ]; then
  printf '\nNo se pudo identificar el montador construido.\n' >&2
  return 1
fi
LEGADO_STEP='instalar el ejecutor de videos largos'
printf '\n4/6 Instalando el ejecutor de videos largos...\n'
gcloud run jobs deploy legado-render --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --image "$LEGADO_IMAGE" \
  --service-account "$LEGADO_SERVICE_ACCOUNT" --memory 2Gi --cpu 2 --tasks 1 --parallelism 1 \
  --task-timeout 3600s --max-retries 1 --set-env-vars "BUCKET=$LEGADO_BUCKET" --quiet
gcloud run jobs add-iam-policy-binding legado-render --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" \
  --member "serviceAccount:$LEGADO_SERVICE_ACCOUNT" --role roles/run.jobsExecutorWithOverrides --quiet >/dev/null
LEGADO_STEP='activar el nuevo montador'
printf '\n5/6 Activando el nuevo montador...\n'
gcloud run services update-traffic legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" \
  --to-revisions "$LEGADO_REVISION=100" --quiet
LEGADO_STEP='comprobar que responde'
printf '\n6/6 Comprobando el resultado...\n'
LEGADO_SERVICE_URL=$(gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(status.url)')
LEGADO_OK=0
for LEGADO_ATTEMPT in 1 2 3 4 5; do
  if curl --fail --silent --show-error --connect-timeout 10 --max-time 20 "$LEGADO_SERVICE_URL/" -o "$LEGADO_WORK_DIR/health.json" && \
    python3 - "$LEGADO_WORK_DIR/health.json" <<'PY_HEALTH'
import json,sys
d=json.load(open(sys.argv[1]))
sys.exit(0 if d.get('service')=='legado-unify' and d.get('version')=='@RENDER_VERSION@' and d.get('durable') is True else 1)
PY_HEALTH
  then LEGADO_OK=1; break; fi
  sleep 2
done
if [ "$LEGADO_OK" != 1 ]; then
  printf '\nNo respondió correctamente. Recuperando el montador anterior...\n' >&2
  gcloud run services update-traffic legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" \
    --to-revisions "$(cat "$LEGADO_WORK_DIR/traffic.txt")" --quiet
  return 1
fi
printf '\nLISTO: montaje actualizado.\nVuelve a studio.legadodehierro.com y recarga la página.\nNo se ha generado ningún video durante la instalación.\n'
}
legado_actualizar
