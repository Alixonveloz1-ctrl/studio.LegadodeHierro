#!/usr/bin/env bash
# ============================================================================
# Instalador de Legado de Hierro (montador legado-unify + variables de Vercel)
# ----------------------------------------------------------------------------
# Se corre en Google Cloud Shell, dentro de la cuenta codigodinero7@gmail.com.
# Hace todo de una vez y es idempotente: si algo ya existe, lo reconoce,
# lo actualiza sin duplicar y sigue. Se puede correr las veces que haga falta.
#
# Qué hace, en orden:
#   1. Activa las APIs de Google que el montador necesita.
#   2. Crea el almacén (bucket) propio de Legado, privado, con su regla CORS.
#   3. Da los permisos exactos a la cuenta de servicio y a la cuenta de
#      cómputo del proyecto (nada más que lo necesario).
#   4. Prepara la llave de la cuenta de servicio y la clave del montador
#      en archivos locales de Cloud Shell (nunca se imprimen en pantalla).
#   5. Despliega el servicio legado-unify y el trabajo legado-render.
#   6. Comprueba que el montador responde sano (ok y durable).
#   7. Se conecta con Vercel y coloca automáticamente las 5 variables de
#      Google/montador (producción y vista previa), sin tocar la clave de
#      acceso de la aplicación ni las de ElevenLabs, y republica la app.
#
# Todos los valores se pueden cambiar con variables de entorno antes de
# correrlo; si no se cambia nada, usa los de Legado ya confirmados.
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Valores por defecto (sobreescribibles por variables de entorno)
# ---------------------------------------------------------------------------
GCP_PROJECT="${GCP_PROJECT:-civic-genre-507713-m2}"
REGION="${REGION:-us-central1}"
BUCKET="${BUCKET:-civic-genre-507713-m2-legado-de-hierro}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-la-mirada-que-el-mundo-temera@civic-genre-507713-m2.iam.gserviceaccount.com}"
SA_KEY_FILE="${SA_KEY_FILE:-/tmp/gcp-service-account-legado.json}"
UNIFY_KEY_FILE="${UNIFY_KEY_FILE:-/tmp/unify-key.txt}"
VERCEL_PROJECT="${VERCEL_PROJECT:-legado-de-hierro-final}"

SERVICE_NAME="legado-unify"
JOB_NAME="legado-render"
APP_ORIGIN="https://studio.legadodehierro.com"
RENDER_JOB_RESOURCE="projects/${GCP_PROJECT}/locations/${REGION}/jobs/${JOB_NAME}"

# Carpeta de este script: ahí viven los 5 archivos fuente del montador.
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Carpeta temporal de trabajo (se borra sola al terminar, también si falla).
TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT
chmod 700 "$TMPD"

# ---------------------------------------------------------------------------
# Mensajes
# ---------------------------------------------------------------------------
log()  { printf '\n==> %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

command -v gcloud >/dev/null 2>&1 || fail "No encuentro gcloud. Este instalador se corre dentro de Google Cloud Shell."
command -v curl   >/dev/null 2>&1 || fail "No encuentro curl, que se usa para la comprobación final del montador."
command -v npx    >/dev/null 2>&1 || fail "No encuentro npx (Node.js), que se usa para hablar con Vercel."

# ---------------------------------------------------------------------------
# 1. Proyecto y APIs
# ---------------------------------------------------------------------------
log "Proyecto de Google: ${GCP_PROJECT} (región ${REGION})"
gcloud config set project "$GCP_PROJECT" >/dev/null

log "Activando las APIs necesarias (si ya están activas, no pasa nada)..."
gcloud services enable \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project "$GCP_PROJECT" >/dev/null
info "APIs listas."

# ---------------------------------------------------------------------------
# 2. Almacén (bucket) propio de Legado + CORS
# ---------------------------------------------------------------------------
log "Almacén de Legado: ${BUCKET}"
if gcloud storage buckets describe "gs://${BUCKET}" >/dev/null 2>&1; then
  info "El almacén ya existe; no se duplica."
else
  gcloud storage buckets create "gs://${BUCKET}" \
    --project "$GCP_PROJECT" \
    --location "$REGION" \
    --uniform-bucket-level-access \
    --public-access-prevention >/dev/null
  info "Almacén creado: privado, con acceso uniforme y prevención de acceso público."
fi

# Regla CORS: permite que la aplicación (studio.legadodehierro.com) suba y
# lea archivos. Si la regla ya está puesta, no se toca.
EXISTING_CORS="$(gsutil cors get "gs://${BUCKET}" 2>/dev/null || echo '[]')"
if printf '%s' "$EXISTING_CORS" | grep -q "$APP_ORIGIN"; then
  info "La regla CORS de la aplicación ya estaba puesta."
else
  cat > "${TMPD}/cors.json" <<EOF
[{"origin": ["${APP_ORIGIN}"], "method": ["GET", "HEAD", "PUT"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]
EOF
  gsutil cors set "${TMPD}/cors.json" "gs://${BUCKET}" >/dev/null
  info "Regla CORS aplicada para ${APP_ORIGIN}."
fi

# ---------------------------------------------------------------------------
# 3. Permisos de la cuenta de servicio
#    - Vertex AI en el proyecto (genera texto, imágenes y videos).
#    - Administrar objetos SOLO dentro del almacén nuevo de Legado.
#    Dar el mismo permiso dos veces no duplica nada: es seguro repetirlo.
# ---------------------------------------------------------------------------
log "Permisos de la cuenta de servicio..."
gcloud projects add-iam-policy-binding "$GCP_PROJECT" \
  --member "serviceAccount:${SERVICE_ACCOUNT}" \
  --role "roles/aiplatform.user" >/dev/null
gcloud storage buckets add-iam-policy-binding "gs://${BUCKET}" \
  --member "serviceAccount:${SERVICE_ACCOUNT}" \
  --role "roles/storage.objectAdmin" >/dev/null
info "Permisos de la cuenta de servicio listos."

# ---------------------------------------------------------------------------
# 4. Secretos locales (nunca se imprimen)
#    - Llave JSON de la cuenta de servicio: se crea solo si el archivo no
#      existe ya en esta Cloud Shell.
#    - Clave del montador: se lee del archivo si existe; si no, se genera
#      una nueva y se guarda ahí. Su valor jamas sale en pantalla.
# ---------------------------------------------------------------------------
log "Preparando las llaves (sin mostrar ningún valor)..."
if [[ -f "$SA_KEY_FILE" ]]; then
  info "La llave de la cuenta de servicio ya existe en este equipo; se reutiliza."
else
  gcloud iam service-accounts keys create "$SA_KEY_FILE" \
    --iam-account "$SERVICE_ACCOUNT" \
    --project "$GCP_PROJECT" >/dev/null 2>&1
  info "Llave de la cuenta de servicio creada y guardada en archivo local."
fi
chmod 600 "$SA_KEY_FILE"

if [[ -s "$UNIFY_KEY_FILE" ]]; then
  info "La clave del montador ya existe en este equipo; se reutiliza."
else
  command -v openssl >/dev/null 2>&1 || fail "No encuentro openssl para generar la clave del montador."
  openssl rand -hex 32 > "$UNIFY_KEY_FILE"
  info "Clave del montador generada y guardada en archivo local."
fi
chmod 600 "$UNIFY_KEY_FILE"
UNIFY_KEY_VALUE="$(cat "$UNIFY_KEY_FILE")"

# ---------------------------------------------------------------------------
# 5. Servicio legado-unify (el montador)
#    Las variables van en un archivo aparte, no en la línea de comandos,
#    para que la clave nunca quede visible en ningún listado.
# ---------------------------------------------------------------------------
log "Desplegando el servicio ${SERVICE_NAME}..."
cat > "${TMPD}/env.yaml" <<EOF
BUCKET: "${BUCKET}"
UNIFY_KEY: "${UNIFY_KEY_VALUE}"
RENDER_JOB_RESOURCE: "${RENDER_JOB_RESOURCE}"
EOF
chmod 600 "${TMPD}/env.yaml"

gcloud run deploy "$SERVICE_NAME" \
  --source "$SRC_DIR" \
  --project "$GCP_PROJECT" \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 600 \
  --no-cpu-throttling \
  --min-instances 0 \
  --max-instances 2 \
  --env-vars-file "${TMPD}/env.yaml" >/dev/null
info "Servicio ${SERVICE_NAME} desplegado."

SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" \
  --project "$GCP_PROJECT" --region "$REGION" \
  --format 'value(status.url)')"
[[ -n "$SERVICE_URL" ]] || fail "El servicio se desplegó pero no devolvió su dirección."
info "Dirección del montador: ${SERVICE_URL}"

SERVICE_IMAGE="$(gcloud run services describe "$SERVICE_NAME" \
  --project "$GCP_PROJECT" --region "$REGION" \
  --format 'value(spec.template.spec.containers[0].image)')"
[[ -n "$SERVICE_IMAGE" ]] || fail "No pude leer la imagen del servicio para crear el trabajo de render."

# ---------------------------------------------------------------------------
# 6. Trabajo legado-render (quien arma los videos completos)
#    Usa la misma imagen que el servicio. Si ya existe, se actualiza.
# ---------------------------------------------------------------------------
log "Trabajo ${JOB_NAME}..."
if gcloud run jobs describe "$JOB_NAME" --project "$GCP_PROJECT" --region "$REGION" >/dev/null 2>&1; then
  gcloud run jobs update "$JOB_NAME" \
    --project "$GCP_PROJECT" --region "$REGION" \
    --image "$SERVICE_IMAGE" \
    --set-env-vars "BUCKET=${BUCKET}" \
    --memory 2Gi --cpu 2 \
    --tasks 1 --max-retries 1 --task-timeout 3600 >/dev/null
  info "El trabajo ya existía; quedó actualizado con la imagen nueva."
else
  gcloud run jobs create "$JOB_NAME" \
    --project "$GCP_PROJECT" --region "$REGION" \
    --image "$SERVICE_IMAGE" \
    --set-env-vars "BUCKET=${BUCKET}" \
    --memory 2Gi --cpu 2 \
    --tasks 1 --max-retries 1 --task-timeout 3600 >/dev/null
  info "Trabajo ${JOB_NAME} creado."
fi

# La cuenta de cómputo por defecto es la que corre el servicio y el trabajo:
# necesita guardar en el almacén de Legado y poder lanzar el trabajo.
PROJECT_NUMBER="$(gcloud projects describe "$GCP_PROJECT" --format 'value(projectNumber)')"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
gcloud storage buckets add-iam-policy-binding "gs://${BUCKET}" \
  --member "serviceAccount:${COMPUTE_SA}" \
  --role "roles/storage.objectAdmin" >/dev/null
gcloud run jobs add-iam-policy-binding "$JOB_NAME" \
  --project "$GCP_PROJECT" --region "$REGION" \
  --member "serviceAccount:${COMPUTE_SA}" \
  --role "roles/run.jobsExecutorWithOverrides" >/dev/null
info "Permisos de la cuenta de cómputo listos."

# ---------------------------------------------------------------------------
# 7. Comprobación del montador: debe responder ok:true y durable:true.
#    durable:true confirma que el trabajo de render quedó enlazado;
#    sin eso, el servicio responde pero NO puede armar videos completos.
# ---------------------------------------------------------------------------
log "Comprobando que el montador responde bien..."
HEALTH=""
for _ in 1 2 3 4 5 6 7 8 9 10; do
  HEALTH="$(curl -s "$SERVICE_URL" || true)"
  CLEAN="$(printf '%s' "$HEALTH" | tr -d ' \t\r\n')"
  if printf '%s' "$CLEAN" | grep -q '"ok":true'; then
    break
  fi
  sleep 6
done
CLEAN="$(printf '%s' "$HEALTH" | tr -d ' \t\r\n')"
printf '%s' "$CLEAN" | grep -q '"ok":true' \
  || fail "El montador no respondió bien en ${SERVICE_URL}. Revisa el servicio ${SERVICE_NAME} en Cloud Run."
if ! printf '%s' "$CLEAN" | grep -q '"durable":true'; then
  fail "El montador responde, pero durable salió false: el trabajo ${JOB_NAME} no quedó enlazado y los videos completos no se podrían armar. Hay que revisar el trabajo en Cloud Run y volver a correr este instalador."
fi
info "Montador sano: responde y tiene su trabajo de render enlazado."

# ---------------------------------------------------------------------------
# 8. Vercel: colocar las 5 variables y republicar
#    - Se usa la CLI oficial de Vercel (npx vercel).
#    - Si no hay sesión iniciada, la propia CLI abre la pantalla de entrada:
#      el usuario solo toca el botón de entrar con GitHub en el navegador,
#      sin escribir correo ni contraseña.
#    - Cada variable se quita y se vuelve a poner leyendo el valor desde un
#      archivo, nunca escrito en la línea de comandos ni en pantalla.
#    - NO se toca APP_KEY ni las variables de ElevenLabs.
# ---------------------------------------------------------------------------
log "Conectando con Vercel (proyecto ${VERCEL_PROJECT})..."
VERCEL_TMP="${TMPD}/vercel"
mkdir -p "$VERCEL_TMP"
cd "$VERCEL_TMP"

if ! npx --yes vercel@latest whoami >/dev/null 2>&1; then
  info "Todavía no hay sesión de Vercel en esta terminal."
  info "Se va a abrir la pantalla de entrada de Vercel en el navegador:"
  info "toca solamente el botón de entrar con GitHub (sin escribir nada)."
  npx --yes vercel@latest login
fi

npx --yes vercel@latest link --project "$VERCEL_PROJECT" --yes >/dev/null
info "Proyecto de Vercel enlazado."

# Valores en archivos temporales (los secretos vienen de sus archivos,
# tal cual; jamás pasan por la línea de comandos ni por la pantalla).
printf '%s' "$GCP_PROJECT"  > "${TMPD}/v_gcp_project_id"
printf '%s' "$BUCKET"       > "${TMPD}/v_bucket"
printf '%s' "$SERVICE_URL"  > "${TMPD}/v_unify_url"
printf '%s' "$UNIFY_KEY_VALUE" > "${TMPD}/v_unify_key"
chmod 600 "${TMPD}/v_"*

set_vercel_var() {
  local name="$1" file="$2" target
  for target in production preview; do
    # Quitar el valor anterior (si no existe, no pasa nada).
    npx --yes vercel@latest env rm "$name" "$target" --yes >/dev/null 2>&1 || true
    # Poner el valor nuevo leyéndolo desde el archivo.
    npx --yes vercel@latest env add "$name" "$target" < "$file" >/dev/null
    info "Variable ${name} actualizada (${target})."
  done
}

log "Colocando las variables de Vercel..."
set_vercel_var "GCP_PROJECT_ID"      "${TMPD}/v_gcp_project_id"
set_vercel_var "GCS_OUTPUT_BUCKET"   "${TMPD}/v_bucket"
set_vercel_var "GCP_SERVICE_ACCOUNT" "$SA_KEY_FILE"
set_vercel_var "CLOUD_RUN_UNIFY_URL" "${TMPD}/v_unify_url"
set_vercel_var "UNIFY_KEY"           "${TMPD}/v_unify_key"
info "Variables colocadas. La clave de acceso y ElevenLabs no se tocaron."

# Republicar la aplicación para que tome las variables nuevas, y esperar
# a que el despliegue quede listo.
log "Republicando la aplicación..."
LATEST_URL="$(npx --yes vercel@latest ls "$VERCEL_PROJECT" --prod 2>/dev/null \
  | grep -oE 'https://[a-zA-Z0-9.-]+' | head -n 1 || true)"
[[ -n "$LATEST_URL" ]] || fail "No pude encontrar el despliegue actual de producción en Vercel para republicarlo."

REDEPLOY_OUT="$(npx --yes vercel@latest redeploy "$LATEST_URL" 2>&1 || true)"
NEW_URL="$(printf '%s' "$REDEPLOY_OUT" | grep -oE 'https://[a-zA-Z0-9.-]+' | tail -n 1 || true)"
[[ -n "$NEW_URL" ]] || NEW_URL="$LATEST_URL"

READY=""
for _ in $(seq 1 30); do
  INSPECT="$(npx --yes vercel@latest inspect "$NEW_URL" 2>/dev/null || true)"
  if printf '%s' "$INSPECT" | grep -qi 'ready'; then
    READY="si"
    break
  fi
  if printf '%s' "$INSPECT" | grep -qi 'error'; then
    fail "El nuevo despliegue de Vercel salió con error. Revisa el despliegue en el proyecto ${VERCEL_PROJECT}."
  fi
  sleep 10
done
[[ "$READY" == "si" ]] || fail "El despliegue de Vercel no llegó a estar listo a tiempo. Revisa el proyecto ${VERCEL_PROJECT} en Vercel."
info "Aplicación republicada y lista."

# ---------------------------------------------------------------------------
# Listo
# ---------------------------------------------------------------------------
log "Instalación de Legado de Hierro terminada."
info "Cuenta de Google: proyecto ${GCP_PROJECT}, almacén ${BUCKET}."
info "Montador: ${SERVICE_URL} (sano, con render enlazado)."
info "Vercel: proyecto ${VERCEL_PROJECT} con las variables nuevas y la aplicación republicada."
info "Ya puedes abrir la aplicación y empezar a generar contenido."
