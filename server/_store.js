// Durable personal storage; conditional writes protect retries and concurrent tabs.
const {createSign, createHash, randomUUID} = require('crypto');
let cachedToken = null;
function failure(message, status) { const e = new Error(message); e.status = status || 500; return e; }
function config() {
  if (!process.env.GCP_SERVICE_ACCOUNT || !process.env.GCS_OUTPUT_BUCKET) throw failure('Falta configurar GCP_SERVICE_ACCOUNT o GCS_OUTPUT_BUCKET.');
  return {sa:JSON.parse(process.env.GCP_SERVICE_ACCOUNT),bucket:process.env.GCS_OUTPUT_BUCKET.replace(/^gs:\/\//,'').replace(/\/.*$/,'')};
}
async function token(signal) {
  const {sa} = config();
  if (cachedToken && cachedToken.email === sa.client_email && cachedToken.until > Date.now()) return cachedToken.value;
  const now = Math.floor(Date.now()/1000), enc = x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  const input = enc({alg:'RS256',typ:'JWT'})+'.'+enc({iss:sa.client_email,scope:'https://www.googleapis.com/auth/cloud-platform',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const sig = createSign('RSA-SHA256').update(input).sign(sa.private_key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token',{method:'POST',signal:signal || AbortSignal.timeout(10000),headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:input+'.'+sig}).toString()});
  const d = await r.json();
  if (!r.ok || !d.access_token) throw failure('No se pudo autenticar el almacenamiento de Google.',502);
  cachedToken = {email:sa.client_email,value:d.access_token,until:Date.now()+3000000}; return d.access_token;
}
function signedUrl(object, method, mime) {
  const {sa,bucket} = config(), now = new Date(), stamp = now.toISOString().slice(0,10).replace(/-/g,''), time = now.toISOString().slice(0,19).replace(/[-:]/g,'')+'Z';
  const scope = stamp+'/auto/storage/goog4_request', uri = '/'+bucket+'/'+object.split('/').map(encodeURIComponent).join('/');
  const headers = method === 'PUT' ? 'content-type;host' : 'host';
  const q = {'X-Goog-Algorithm':'GOOG4-RSA-SHA256','X-Goog-Credential':sa.client_email+'/'+scope,'X-Goog-Date':time,'X-Goog-Expires':'21600','X-Goog-SignedHeaders':headers};
  const query = Object.keys(q).sort().map(k=>encodeURIComponent(k)+'='+encodeURIComponent(q[k])).join('&');
  const canonical = [method || 'GET',uri,query,(method === 'PUT' ? 'content-type:'+mime+'\n' : '')+'host:storage.googleapis.com\n',headers,'UNSIGNED-PAYLOAD'].join('\n');
  const sig = createSign('RSA-SHA256').update(['GOOG4-RSA-SHA256',time,scope,createHash('sha256').update(canonical).digest('hex')].join('\n')).sign(sa.private_key).toString('hex');
  return 'https://storage.googleapis.com'+uri+'?'+query+'&X-Goog-Signature='+sig;
}
function makeStore(signal) {
  const {bucket} = config(); signal = signal || AbortSignal.timeout(50000);
  async function call(path, options) {
    const t = await token(signal);
    const r = await fetch('https://storage.googleapis.com'+path,{...options,signal,headers:{Authorization:'Bearer '+t,...(options && options.headers)}});
    if (!r.ok && r.status !== 404) throw failure(r.status === 412 ? 'El trabajo está siendo actualizado. Vuelve a consultar.' : 'Almacenamiento: HTTP '+r.status,r.status);
    return r;
  }
  const route = (obj,b=bucket)=>'/storage/v1/b/'+encodeURIComponent(b)+'/o/'+encodeURIComponent(obj);
  return {
    bucket,
    async read(object) {
      const meta = await call(route(object)); if (meta.status === 404) return null;
      const m = await meta.json();
      const r = await call(route(object)+'?alt=media&generation='+m.generation);
      if (r.status === 404) throw failure('El archivo cambió durante la lectura. Reintenta.',409);
      return {data:await r.json(),generation:m.generation};
    },
    async put(object,data,generation,catalog) {
      const boundary = 'lh-'+randomUUID(), metadata = {name:object,contentType:'application/json',cacheControl:'no-store'};
      if (catalog) {
        const record=JSON.stringify(data);if(Buffer.byteLength(record,'utf8')>7500)throw failure('La ficha contiene demasiado texto. Acorta la descripción o las etiquetas.',400);
        metadata.metadata = {record};
      }
      const body = '--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)
        +'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(data)+'\r\n--'+boundary+'--';
      const r = await call('/upload/storage/v1/b/'+bucket+'/o?uploadType=multipart'+(generation !== undefined ? '&ifGenerationMatch='+generation : ''),
        {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body}); return r.json();
    },
    async bytes(object,bytes,mime) {
      const r = await call('/upload/storage/v1/b/'+bucket+'/o?uploadType=media&name='+encodeURIComponent(object)+'&ifGenerationMatch=0',
        {method:'POST',headers:{'Content-Type':mime},body:bytes}); return r.json();
    },
    async readBytes(object, limit) {
      const meta = await call(route(object));
      if (meta.status === 404) throw failure('Un archivo del montaje ya no está disponible.',404);
      const m = await meta.json();
      if (!Number.isFinite(Number(m.size)) || Number(m.size) > limit) throw failure('Este montaje necesita actualizar el servidor de Google Cloud por el tamaño de los archivos.',409);
      const r = await call(route(object)+'?alt=media&generation='+m.generation);
      if (r.status === 404) throw failure('El archivo cambió durante la lectura. Reintenta.',409);
      const chunks = []; let size = 0;
      for await (const chunk of r.body) {
        size += chunk.length;
        if (size > limit) throw failure('El archivo supera el límite del montaje anterior. Actualiza Google Cloud.',409);
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    },
    async info(object) { const r = await call(route(object)); return r.status === 404 ? null : r.json(); },
    async sourceInfo(source,object) { const r=await call(route(object,source));return r.status===404?null:r.json(); },
    async sourceJSON(source,object,limit=1048576) {
      const meta=await call(route(object,source));if(meta.status===404)return null;
      const m=await meta.json();if(Number(m.size)>limit)return null;
      const r=await call(route(object,source)+'?alt=media&generation='+m.generation);if(r.status===404)return null;
      let size=0;const chunks=[];
      for await(const chunk of r.body){size+=chunk.length;if(size>limit)return null;chunks.push(chunk);}
      try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch(e){return null;}
    },
    async sourceList(source,prefix,cursor,size=100) {
      const r=await call('/storage/v1/b/'+encodeURIComponent(source)+'/o?prefix='+encodeURIComponent(prefix)+'&maxResults='+size
        +'&fields=items(name,size,contentType,generation,crc32c),nextPageToken'+(cursor?'&pageToken='+encodeURIComponent(cursor):''));
      if(r.status===404)throw failure('No se encontró el bucket de origen.',404);return r.json();
    },
    async rewriteFrom(source,object,rewriteToken) {
      const q=new URLSearchParams({ifGenerationMatch:'0',ifSourceGenerationMatch:String(source.generation),maxBytesRewrittenPerCall:String(64*1024*1024)});
      if(rewriteToken)q.set('rewriteToken',rewriteToken);
      const r=await call(route(source.object,source.bucket)+'/rewriteTo/b/'+encodeURIComponent(bucket)+'/o/'+encodeURIComponent(object)+'?'+q,{method:'POST'});
      if(r.status===404)throw failure('El archivo de origen ya no está disponible.',404);return r.json();
    },
    async list(prefix,cursor,size) {
      const r = await call('/storage/v1/b/'+bucket+'/o?prefix='+encodeURIComponent(prefix)+'&maxResults='+(size || 100)
        +'&fields=items(name,size,contentType,timeCreated,metadata),nextPageToken'+(cursor ? '&pageToken='+encodeURIComponent(cursor) : '')); return r.json();
    }
  };
}
function jsonHandler(handler) {
  return async (req,res) => {
    res.setHeader('Cache-Control','no-store');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!require('./_auth').checkAuth(req,res)) return;
    if (req.method !== 'POST') return res.status(405).json({error:'Usa POST.'});
    try {
      if (typeof req.body === 'string') req.body = JSON.parse(req.body);
      return await handler(req.body || {},res);
    } catch(e) {
      return res.status(e.status === 412 ? 409 : (e.status && e.status < 600 ? e.status : 500)).json({error:/Timeout|Abort/.test(e.name) ? 'Esta etapa tardó demasiado. Lo ya guardado se conserva; puedes reanudar.' : e.message,
        retryable:[409,412,429,502,503,504].includes(e.status) || /Timeout|Abort/.test(e.name)});
    }
  };
}
module.exports = {makeStore,token,signedUrl,jsonHandler,failure,config};
