# Cómo desplegar el servicio de unificación (legado-unify)

Este servicio une los clips de Veo, les ajusta la velocidad para que encajen con
la narración de ElevenLabs, pega el audio y entrega UN solo video final.
Se despliega UNA sola vez; después la herramienta lo usa sola.

Todo se hace en **Cloud Shell** (el botón `>_` arriba a la derecha en
console.cloud.google.com), igual que se hizo con el CORS y la cuenta de servicio.

## Paso 1 — Traer el código a Cloud Shell

```bash
git clone https://github.com/Alixonveloz1-ctrl/studio.LegadodeHierro.git
cd studio.LegadodeHierro/cloudrun/unify
```

(Si ya lo habías clonado antes: `cd studio.LegadodeHierro && git pull && cd cloudrun/unify`)

## Paso 2 — Inventar la clave secreta

Una contraseña cualquiera, larga, que solo conocen Vercel y este servicio.
Genera una y GUÁRDALA (la vas a usar en el paso 3 y en Vercel):

```bash
openssl rand -hex 24
```

## Paso 3 — Desplegar (reemplaza TU_CLAVE por la del paso 2)

```bash
gcloud run deploy legado-unify \
  --source . \
  --project creacion-de-contenido1 \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi --cpu 2 \
  --timeout 600 \
  --no-cpu-throttling \
  --min-instances 0 --max-instances 2 \
  --set-env-vars BUCKET=legado-hierro,UNIFY_KEY=TU_CLAVE
```

- Si pregunta por habilitar APIs (Artifact Registry, Cloud Build, Run): responde `y`.
- `--no-cpu-throttling` es OBLIGATORIO: el servicio responde de inmediato y sigue
  trabajando en segundo plano; sin esto, Google le apaga el procesador a mitad del video.
- Al terminar imprime la URL del servicio, algo como
  `https://legado-unify-xxxxxxxx-uc.a.run.app` — CÓPIALA.

## Paso 4 — Darle permiso de escribir en el bucket

El servicio necesita guardar el video final en el bucket `legado-hierro`:

```bash
PROJECT_NUMBER=$(gcloud projects describe creacion-de-contenido1 --format='value(projectNumber)')
gcloud storage buckets add-iam-policy-binding gs://legado-hierro \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

## Paso 5 — Conectar Vercel

En vercel.com → tu proyecto → Settings → Environment Variables, agrega DOS variables
(en Production, Preview y Development):

| Nombre                | Valor                                    |
|-----------------------|------------------------------------------|
| `CLOUD_RUN_UNIFY_URL` | la URL del paso 3                        |
| `UNIFY_KEY`           | la clave del paso 2                      |

Después: Deployments → los tres puntos del último deployment → **Redeploy**
(para que tome las variables nuevas).

## Paso 6 — Probar

1. En la herramienta: genera un reel → imágenes → TODOS los videos → Audio ES.
2. Aparece la tarjeta **🎞 Video Final — Unificación**; cuando diga
   "Todo listo", toca **Unificar video + audio**.
3. En 1–3 minutos entrega el MP4 final con la narración pegada.
   En CapCut solo queda agregar la música de fondo.

## Si algo falla

Los errores del servicio NO se quedan escondidos en Cloud Run: viajan de vuelta
y quedan registrados en los logs de **Vercel** (el error aparece también en
pantalla, en la tarjeta de unificación). Con pegar aquí lo que dice la pantalla
es suficiente para diagnosticar.

## Costo

Sale del crédito de $300 de Google Cloud. Cloud Run cobra solo mientras trabaja
(1–3 minutos por reel); con 5 reels diarios lo normal es quedar dentro de la
franja gratis mensual o muy cerca de ella.
