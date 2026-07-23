// api/video-status.js
// Consulta el estado de UNA operacion de Veo (polling). Corre en Edge Runtime
// porque el polling se llama repetidamente durante varios minutos y Edge no
// tiene el limite de duracion corta de las funciones serverless normales.
// Edge NO soporta el modulo "crypto" de Node, por eso la autenticacion aqui
// usa Web Crypto API (crypto.subtle) en vez de google-auth-library.

export const config = { runtime: 'edge' };

function base64UrlEncode(bytes) {
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function strToBase64Url(str) {
  return base64UrlEncode(new TextEncoder().encode(str));
}

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAccessToken(serviceAccount) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: serviceAccount.token_uri,
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  };

  const headerB64 = strToBase64Url(JSON.stringify(header));
  const payloadB64 = strToBase64Url(JSON.stringify(payload));
  const unsigned = headerB64 + '.' + payloadB64;

  const keyData = pemToArrayBuffer(serviceAccount.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsigned)
  );

  const jwt = unsigned + '.' + base64UrlEncode(new Uint8Array(signature));

  const tokenResponse = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt,
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error('No se pudo obtener access_token: ' + errText);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-app-key',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  // Puerta de seguridad (runtime edge): si APP_KEY esta configurada, exige la
  // cabecera x-app-key. Sin APP_KEY, queda abierto (nunca te bloquea por accidente).
  const APP_KEY = process.env.APP_KEY || '';
  if (APP_KEY && req.headers.get('x-app-key') !== APP_KEY) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const operationName = body.operationName;
    if (!operationName) {
      return new Response(JSON.stringify({ error: 'Falta operationName' }), { status: 400, headers: corsHeaders });
    }

    const GCP_SERVICE_ACCOUNT = process.env.GCP_SERVICE_ACCOUNT;
    // Sin nombres de respaldo: el proyecto SIEMPRE viene de la configuracion de Vercel.
    const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
    if (!GCP_PROJECT_ID) {
      return new Response(JSON.stringify({ error: 'GCP_PROJECT_ID no configurado en Vercel' }), { status: 500, headers: corsHeaders });
    }

    if (!GCP_SERVICE_ACCOUNT) {
      return new Response(JSON.stringify({ error: 'GCP_SERVICE_ACCOUNT no configurado' }), { status: 500, headers: corsHeaders });
    }

    // El operationName tiene la forma:
    //   projects/{p}/locations/{region}/publishers/google/models/{model}/operations/{id}
    // Derivamos region y ruta-del-modelo de ahi para que el polling funcione con
    // CUALQUIER modelo de Veo elegido (no solo veo-3.1-lite). Si no se puede
    // parsear, usamos el modelo enviado por el frontend o el valor por defecto.
    let REGION = 'us-central1';
    let modelResource = null;
    const opIdx = operationName.indexOf('/operations/');
    if (operationName.indexOf('projects/') === 0 && opIdx > -1) {
      modelResource = operationName.slice(0, opIdx); // projects/.../models/{model}
      const lm = operationName.match(/\/locations\/([^/]+)\//);
      if (lm && lm[1]) REGION = lm[1];
    } else {
      const fallbackModel = (body.model && String(body.model)) || 'veo-3.1-lite-generate-001';
      modelResource = `projects/${GCP_PROJECT_ID}/locations/${REGION}/publishers/google/models/${fallbackModel}`;
    }

    const serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT);
    const accessToken = await getAccessToken(serviceAccount);

    const url = `https://${REGION}-aiplatform.googleapis.com/v1/${modelResource}:fetchPredictOperation`;

    const opResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': GCP_PROJECT_ID,
      },
      body: JSON.stringify({ operationName: operationName }),
    });

    if (!opResponse.ok) {
      const errText = await opResponse.text();
      return new Response(JSON.stringify({ error: 'Error ' + opResponse.status + ': ' + errText }), { status: opResponse.status, headers: corsHeaders });
    }

    const opData = await opResponse.json();

    if (!opData.done) {
      return new Response(JSON.stringify({ done: false }), { status: 200, headers: corsHeaders });
    }

    // Operacion terminada -- revisar si vino video o fue bloqueado por filtros
    const videos = opData.response && opData.response.videos ? opData.response.videos : [];
    const raiFiltered = opData.response && opData.response.raiMediaFilteredCount ? opData.response.raiMediaFilteredCount : 0;

    if (videos.length === 0) {
      if (raiFiltered > 0) {
        return new Response(JSON.stringify({
          done: true,
          error: 'Contenido bloqueado por los filtros de seguridad de Google. Reformula el prompt de esta escena e intenta de nuevo.',
        }), { status: 200, headers: corsHeaders });
      }
      return new Response(JSON.stringify({ done: true, error: 'La operacion termino sin generar video.' }), { status: 200, headers: corsHeaders });
    }

    const gcsUri = videos[0].gcsUri;

    // Generar URL firmada (1 hora) para que el navegador pueda descargar el MP4.
    // gcsUri tiene forma: gs://bucket/ruta/archivo.mp4
    const withoutScheme = gcsUri.replace('gs://', '');
    const firstSlash = withoutScheme.indexOf('/');
    const bucketName = withoutScheme.slice(0, firstSlash);
    const objectPath = withoutScheme.slice(firstSlash + 1);

    const signedUrl = await getSignedUrl(serviceAccount, bucketName, objectPath);

    return new Response(JSON.stringify({ done: true, videoUrl: signedUrl }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Error interno' }), { status: 500, headers: corsHeaders });
  }
}

// Genera una URL firmada V4 de lectura para un objeto de GCS, usando Web Crypto API
// (firma manual del string-to-sign, igual de espiritu a getSignedUrl de @google-cloud/storage
// pero sin depender de esa libreria, que no corre en Edge Runtime).
async function getSignedUrl(serviceAccount, bucketName, objectPath) {
  const method = 'GET';
  const expiresInSeconds = 3600; // 1 hora
  const now = new Date();
  const datestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';

  const credentialScope = `${datestamp}/auto/storage/goog4_request`;
  const credential = `${serviceAccount.client_email}/${credentialScope}`;

  const host = 'storage.googleapis.com';
  const canonicalUri = `/${bucketName}/${objectPath.split('/').map(encodeURIComponent).join('/')}`;

  const queryParams = {
    'X-Goog-Algorithm': 'GOOG4-RSA-SHA256',
    'X-Goog-Credential': credential,
    'X-Goog-Date': timestamp,
    'X-Goog-Expires': String(expiresInSeconds),
    'X-Goog-SignedHeaders': 'host',
  };

  const sortedKeys = Object.keys(queryParams).sort();
  const canonicalQueryString = sortedKeys
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]))
    .join('&');

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = 'host';
  const payloadHash = 'UNSIGNED-PAYLOAD';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const canonicalRequestHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
  const canonicalRequestHash = bufferToHex(canonicalRequestHashBuffer);

  const stringToSign = [
    'GOOG4-RSA-SHA256',
    timestamp,
    credentialScope,
    canonicalRequestHash,
  ].join('\n');

  const keyData = pemToArrayBuffer(serviceAccount.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(stringToSign)
  );
  const signatureHex = bufferToHex(signatureBuffer);

  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Goog-Signature=${signatureHex}`;
}

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}
