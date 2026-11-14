#!/usr/bin/env bash
# ============================================================================
# Instalador: muda la PUERTA de Legado De Hierro Studio de Vercel a
# Google Cloud Run (el almacén y el montador legado-unify NO se tocan).
# ----------------------------------------------------------------------------
# Se corre en Google Cloud Shell, dentro de la cuenta alixoncbp1@gmail.com.
# Es idempotente: se puede correr las veces que haga falta.
#
# Qué hace, en orden:
#   1. Activa las APIs de Google que Cloud Run necesita.
#   2. Prepara el contexto de construcción de la app desde este repositorio
#      (public/ + server/ + api/ + main.js + Dockerfile de esta carpeta).
#   3. Se conecta con Vercel (si pide inicio de sesión, muestra el enlace
#      para autorizar) y descarga las variables de PRODUCCIÓN a un archivo
#      temporal local. Los valores NUNCA se imprimen en pantalla: solo se
#      informa el NOMBRE de cada variable trasladada.
#   4. Despliega el servicio NUEVO «legado-studio» en el proyecto
#      drama-ai-studio-513501 (us-central1), público, con esas variables.
#      La clave de acceso de la app (APP_KEY) viaja con el mismo valor:
#      la contraseña personal del dueño no cambia.
#   5. Comprueba la salud: la portada responde 200 y /api/login rechaza
#      sin clave (401), lo que confirma que APP_KEY llegó y que las rutas
#      de API están vivas.
#
# Vercel queda intacto, solo como respaldo: este script no lo modifica.
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Valores por defecto (sobreescribibles por variables de entorno)
# ---------------------------------------------------------------------------
GCP_PROJECT="${GCP_PROJECT:-drama-ai-studio-513501}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-legado-studio}"
VERCEL_PROJECT="${VERCEL_PROJECT:-legado-de-hierro-final}"

# Carpeta de este script (cloudrun/studio) y raíz del repositorio.
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SRC_DIR}/../.." && pwd)"

# Carpeta temporal de trabajo (se borra sola al terminar, también si falla).
TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT
chmod 700 "$TMPD"

log()  { printf '\n==> %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

command -v gcloud  >/dev/null 2>&1 || fail "No encuentro gcloud. Este instalador se corre dentro de Google Cloud Shell."
command -v curl    >/dev/null 2>&1 || fail "No encuentro curl, que se usa para las comprobaciones."
command -v npx     >/dev/null 2>&1 || fail "No encuentro npx (Node.js), que se usa para hablar con Vercel."
command -v python3 >/dev/null 2>&1 || fail "No encuentro python3, que se usa para preparar las variables sin imprimirlas."

[ -f "${REPO_ROOT}/api/index.js" ] || fail "No veo la app en ${REPO_ROOT}. Corre el instalador desde el repositorio clonado."

# ---------------------------------------------------------------------------
# 1. Proyecto y APIs
# ---------------------------------------------------------------------------
log "Proyecto de Google: ${GCP_PROJECT} (región ${REGION})"
gcloud config set project "$GCP_PROJECT" >/dev/null

log "Activando las APIs necesarias (si ya están activas, no pasa nada)..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project "$GCP_PROJECT" >/dev/null
info "APIs listas."

# ---------------------------------------------------------------------------
# 2. Contexto de construcción de la app
# ---------------------------------------------------------------------------
log "Preparando la aplicación..."
APP_DIR="${TMPD}/app"
mkdir -p "$APP_DIR"
cp -r "${REPO_ROOT}/public" "${REPO_ROOT}/server" "${REPO_ROOT}/api" "$APP_DIR/"
cp "${REPO_ROOT}/package.json" "${REPO_ROOT}/package-lock.json" "$APP_DIR/"
cp "${SRC_DIR}/main.js" "${SRC_DIR}/Dockerfile" "$APP_DIR/"
printf 'node_modules\ntests\n.git\n' > "${APP_DIR}/.gcloudignore"
info "Contexto listo (estáticos + API + servidor)."

# ---------------------------------------------------------------------------
# 3. Variables de producción desde Vercel (sin imprimir valores)
# ---------------------------------------------------------------------------
log "Conectando con Vercel para traer las variables de producción..."
VERCEL_TMP="${TMPD}/vercel"
mkdir -p "$VERCEL_TMP"
cd "$VERCEL_TMP"
if ! npx --yes vercel@latest whoami >/dev/null 2>&1; then
  info "Vercel pide iniciar sesión: sigue el enlace que aparece y autoriza."
  npx --yes vercel@latest login
fi
npx --yes vercel@latest link --project "$VERCEL_PROJECT" --yes >/dev/null
npx --yes vercel@latest env pull --environment=production "${TMPD}/produccion.env" >/dev/null
[ -s "${TMPD}/produccion.env" ] || fail "La descarga de variables de Vercel quedó vacía."

# Convierte el .env a un archivo de variables para Cloud Run. Solo se
# imprimen los NOMBRES; los valores jamás salen a pantalla ni a registros.
log "Preparando las variables para Cloud Run..."
python3 - "$TMPD" <<'PYEOF'
import json, sys
tmpd = sys.argv[1]
src = open(tmpd + "/produccion.env", encoding="utf-8").read()

def parse_env(text):
    out = {}
    i, n = 0, len(text)
    while i < n:
        # saltar líneas vacías y comentarios
        while i < n and text[i] in " \t\r\n":
            i += 1
        if i < n and text[i] == "#":
            while i < n and text[i] != "\n":
                i += 1
            continue
        if i >= n:
            break
        start = i
        while i < n and (text[i].isalnum() or text[i] in "_-."):
            i += 1
        key = text[start:i]
        while i < n and text[i] in " \t":
            i += 1
        if i >= n or text[i] != "=":
            while i < n and text[i] != "\n":
                i += 1
            continue
        i += 1
        while i < n and text[i] in " \t":
            i += 1
        if i < n and text[i] == '"':
            i += 1
            buf = []
            while i < n and text[i] != '"':
                if text[i] == "\\" and i + 1 < n:
                    esc = text[i + 1]
                    buf.append({"n": "\n", "r": "\r", "t": "\t", '"': '"', "\\": "\\", "$": "$"}.get(esc, "\\" + esc))
                    i += 2
                else:
                    buf.append(text[i])
                    i += 1
            i += 1  # comilla de cierre
            value = "".join(buf)
        elif i < n and text[i] == "'":
            j = text.find("'", i + 1)
            value = text[i + 1:(j if j != -1 else n)]
            i = (j + 1) if j != -1 else n
        else:
            start = i
            while i < n and text[i] != "\n":
                i += 1
            value = text[start:i].strip()
        if key:
            out[key] = value
    return out

env = parse_env(src)
# Las variables del sistema de Vercel (VERCEL_*) no se trasladan: en
# Cloud Run VERCEL_ENV lo fija el Dockerfile y el resto no aplica.
env = {k: v for k, v in env.items() if not k.startswith("VERCEL")}

required = ["APP_KEY", "CLOUD_RUN_UNIFY_URL", "GCP_PROJECT_ID",
            "GCP_SERVICE_ACCOUNT", "GCS_OUTPUT_BUCKET", "UNIFY_KEY",
            "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"]
missing = [k for k in required if k not in env or env[k] == ""]
if missing:
    print("FALTAN variables de producción en Vercel: " + ", ".join(missing), file=sys.stderr)
    sys.exit(1)

with open(tmpd + "/env.yaml", "w", encoding="utf-8") as f:
    for k in sorted(env):
        f.write(k + ": " + json.dumps(env[k], ensure_ascii=False) + "\n")
with open(tmpd + "/nombres.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(sorted(env)) + "\n")
print("Variables trasladadas (" + str(len(env)) + "):")
for k in sorted(env):
    print("  - " + k)
PYEOF
info "Variables listas (nombres arriba; los valores no se mostraron)."

# ---------------------------------------------------------------------------
# 4. Despliegue del servicio nuevo en Cloud Run
# ---------------------------------------------------------------------------
log "Desplegando el servicio «${SERVICE_NAME}» en Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source "$APP_DIR" \
  --project "$GCP_PROJECT" \
  --region "$REGION" \
  --allow-unauthenticated \
  --timeout 300s \
  --cpu 1 \
  --memory 1Gi \
  --max-instances 5 \
  --env-vars-file "${TMPD}/env.yaml" \
  --quiet >/dev/null

SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" \
  --project "$GCP_PROJECT" --region "$REGION" \
  --format='value(status.url)')"
[ -n "$SERVICE_URL" ] || fail "El servicio se desplegó pero no devolvió dirección."
info "Dirección nueva: ${SERVICE_URL}"

# ---------------------------------------------------------------------------
# 5. Comprobación de salud
# ---------------------------------------------------------------------------
log "Comprobando que la aplicación responde..."
CODE_HOME="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "${SERVICE_URL}/")"
[ "$CODE_HOME" = "200" ] || fail "La portada no respondió 200 (respondió ${CODE_HOME})."
info "Portada: OK (200)."

CODE_APPJS="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "${SERVICE_URL}/app.js")"
[ "$CODE_APPJS" = "200" ] || fail "/app.js no respondió 200 (respondió ${CODE_APPJS})."
info "Archivos de la app: OK."

# Sin clave, /api/login debe rechazar con 401: confirma a la vez que las
# rutas de API viven y que APP_KEY llegó con su valor (si faltara, la API
# quedaría abierta y esto devolvería 200).
CODE_LOGIN="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 -X POST "${SERVICE_URL}/api/login")"
[ "$CODE_LOGIN" = "401" ] || fail "/api/login respondió ${CODE_LOGIN} en vez de 401: APP_KEY podría no haber llegado."
info "API y clave de acceso: OK (sin clave, 401)."

log "Migración de la puerta completada."
info "Servicio: ${SERVICE_NAME} (${REGION}, proyecto ${GCP_PROJECT})"
info "Dirección: ${SERVICE_URL}"
info "Vercel quedó intacto como respaldo; el almacén y legado-unify no se tocaron."
