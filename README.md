# Legado de Hierro — Sistema de Producción Facebook Reels

Sistema de generación automatizada de guiones, audio e imágenes para Facebook Reels.

## Stack

- **Frontend**: HTML + JavaScript vanilla (sin frameworks)
- **Backend**: Vercel Serverless Functions (Node.js 18)
- **IA Texto**: Anthropic Claude 3.5 Sonnet (con fallback a Vertex AI Gemini)
- **IA Imagen**: Google Vertex AI Gemini 2.5 Flash Image Preview
- **IA Audio**: ElevenLabs Multilingual v2 (voz clonada)

## Estructura

```
.
├── api/
│   ├── generate.js      # Anthropic + Vertex AI fallback
│   ├── image.js         # Vertex AI Gemini imágenes
│   └── audio.js         # ElevenLabs TTS
├── public/
│   ├── index.html       # UI
│   └── app.js           # Lógica completa
├── package.json         # Node 18.x forzado
├── vercel.json          # Rutas + builds
└── README.md
```

## Variables de Entorno en Vercel

Configurar en Settings → Environment Variables:

- `ANTHROPIC_API_KEY` — API key de Anthropic
- `ELEVENLABS_API_KEY` — API key de ElevenLabs
- `ELEVENLABS_VOICE_ID` — `IRHApOXLvnW57QJPQH2P` (voz clonada)
- `GCP_SERVICE_ACCOUNT` — JSON completo del service account
- `GCP_PROJECT_ID` — `anime-ai-studio-497502`
- `ACCESS_CODE` — `LEGADO2025` (código para registrar usuarios)

## Despliegue

1. Crear repo en GitHub
1. Subir estos archivos
1. Conectar repo a Vercel
1. Agregar variables de entorno
1. Asignar dominio `studio.legadodehierro.com`

## Notas Críticas

- **Node 18.x está forzado** en `package.json` para evitar el bug de Node 6 con optional chaining
- El código de los endpoints NO usa optional chaining (`?.`) ni template literals con `${}` en lógica crítica
- El archivo `app.js` usa solo ES5 puro para máxima compatibilidad con iOS WebKit
- El SP (system prompt) tiene reglas estrictas sobre acentos en español
- 8 imágenes por reel, con 4 segundos de delay entre cada una (rate limit Vertex)

## Acceso

- URL producción: `studio.legadodehierro.com`
- Para registrar nuevo usuario: usar código `LEGADO2025`
- Las cuentas se guardan en `localStorage` del navegador (cada navegador es independiente)

⚔ Legado de Hierro · Ejecuta. Calla. Domina.

Versión estable 1.0
