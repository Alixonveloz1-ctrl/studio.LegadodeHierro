#!/usr/bin/env bash
# Update the existing personal service and install its durable render job.
# This script never prints or changes UNIFY_KEY; Cloud Run preserves it.
set -euo pipefail
umask 077
LEGADO_PROJECT_ID="${LEGADO_PROJECT_ID:-creaciondecontenido1}"
LEGADO_REGION="${LEGADO_REGION:-us-central1}"
LEGADO_STUDIO_ORIGIN="${LEGADO_STUDIO_ORIGIN:-https://studio.legadodehierro.com}"
LEGADO_WORK_DIR=$(mktemp -d)
trap 'rm -rf "$LEGADO_WORK_DIR"' EXIT
gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format=json > "$LEGADO_WORK_DIR/service.json"
LEGADO_BUCKET=$(python3 - "$LEGADO_WORK_DIR/service.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
env=d['spec']['template']['spec']['containers'][0].get('env',[])
bucket=next((e.get('value','') for e in env if e['name']=='BUCKET'),'')
if not bucket: sys.exit('Falta BUCKET en el servicio existente.')
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
cd "$LEGADO_WORK_DIR"
# EMBED_FILES
gcloud run deploy legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --source . \
  --memory 2Gi --cpu 2 --timeout 300 --cpu-throttling --min-instances 0 --max-instances 1 --quiet
LEGADO_REVISION=$(gcloud run services describe legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(status.latestReadyRevisionName)')
LEGADO_IMAGE=$(gcloud run revisions describe "$LEGADO_REVISION" --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --format='value(status.imageDigest)')
gcloud run jobs deploy legado-render --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" --image "$LEGADO_IMAGE" \
  --service-account "$LEGADO_SERVICE_ACCOUNT" --memory 2Gi --cpu 2 --tasks 1 --parallelism 1 \
  --task-timeout 3600s --max-retries 1 --set-env-vars "BUCKET=$LEGADO_BUCKET" --quiet
gcloud run jobs add-iam-policy-binding legado-render --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" \
  --member "serviceAccount:$LEGADO_SERVICE_ACCOUNT" --role roles/run.jobsExecutorWithOverrides --quiet >/dev/null
gcloud run services update legado-unify --project "$LEGADO_PROJECT_ID" --region "$LEGADO_REGION" \
  --update-env-vars "RENDER_JOB_RESOURCE=projects/$LEGADO_PROJECT_ID/locations/$LEGADO_REGION/jobs/legado-render" --quiet
printf '\nMontaje actualizado. El ejecutor se ha instalado sin iniciar ninguna generación.\n'
