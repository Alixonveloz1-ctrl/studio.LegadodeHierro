// Servidor de prueba: sirve public/ y simula /api/* para probar la UI sin gastar APIs reales.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUB = '/home/user/studio.LegadodeHierro/public';
const PORT = 8321;

const TINY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

let genCount = 0;
// Medidor de concurrencia: cuántas peticiones de generación corren a la vez.
let inFlight = 0, maxConcurrent = 0;
let lastAppKey = null;
let lastAudioBody = null;
let lastUnifyBody = null;
let musicTracks = [{ object: 'musica/epica-1.mp3', name: 'epica-1.mp3', size: 2000000 }];

const SCRIPT_TEXT = (n, concepto) => `BLOQUE A
${concepto || ('¿Cuántos años más vas a cambiar tu vida por un sueldo? (variante ' + n + ')')}

Cada mañana repites la misma rutina y el reloj no perdona. Lo que no construyes hoy, lo pagas mañana con años que no vuelven.

Legado de Hierro.

BLOQUE C
PROMPT 1: hombre firmando un documento en una oficina moderna, ángulo bajo, luz cálida lateral
PROMPT 2: hombre caminando por una calle comercial al amanecer, plano medio, luz dorada
PROMPT 3: hombre revisando gráficos en una pantalla, plano cerrado, luz fría de monitor
PROMPT 4: hombre en una azotea mirando la ciudad, contrapicado, atardecer
PROMPT 5: hombre cerrando un trato con un apretón de manos, plano medio, luz de ventana
BLOQUE F
How many more years will you trade your life for a paycheck? (variant ${n})

Every morning you repeat the same routine and the clock forgives nothing.

Iron Legacy.`;

const CAPTION_TEXT = `CAPTION:
Deja de esperar el momento perfecto. Construye lo tuyo hoy.

HASHTAGS:
#LegadoDeHierro #LibertadFinanciera #Disciplina #Mentalidad #Dinero #Exito #Negocios #Inversion #Emprendimiento #Finanzas #Motivacion #Riqueza #Habitos #Enfoque

TIKTOK:
#LegadoDeHierro #LibertadFinanciera #Disciplina #Dinero #Exito

YOUTUBE:
#LegadoDeHierro Deja de esperar y construye lo tuyo`;

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  if (req.url === '/__genlog') return json(res, 200, { maxConcurrent });
  if (req.url === '/__audiolog') return json(res, 200, lastAudioBody || {});
  if (req.url === '/__authlog') return json(res, 200, { lastKey: lastAppKey });
  // Puerta de seguridad simulada: modo abierto (sin APP_KEY) => siempre 200.
  if (req.method === 'POST' && req.url === '/api/login') return json(res, 200, { ok: true, open: true });
  if (req.url.split('?')[0].indexOf('/api/') === 0 && req.headers['x-app-key']) lastAppKey = req.headers['x-app-key'];
  if (req.method === 'POST' && req.url === '/api/videos') {
    let b2=''; req.on('data',c=>b2+=c);
    req.on('end',()=>{
      let d={}; try{ d=JSON.parse(b2); }catch(e){}
      if(d.action==='link'){
        return json(res,200,{success:true,urls:(d.objects||[]).map(o=>'https://signed.example/'+encodeURIComponent(o))});
      }
      const mk=(pfx,n,tag)=>{const a=[];for(let i=1;i<=n;i++)a.push({object:pfx+'op'+i+'/sample_0.mp4',name:'sample_0.mp4',carpeta:pfx+'op'+i,size:2000000,fecha:'2026-07-2'+(9-Math.min(i,8))+'T10:0'+i+':00Z',url:'/fake-clip.mp4?'+tag+i});return a;};
      // 4 en la carpeta del canal, 3 sueltos en la raiz (de "otro proyecto")
      const propios=mk('legado-videos/',20,'p'), otros=mk('',3,'o');
      const clips = d.todos===true ? propios.concat(otros) : propios;
      json(res,200,{success:true,clips,total:clips.length,todos:d.todos===true});
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/api/audio') {
    let body=''; req.on('data',c=>body+=c);
    req.on('end',()=>{
      let d={}; try{ d=JSON.parse(body); }catch(e){}
      lastAudioBody = d;
      // WAV valido de silencio (24kHz mono 16-bit), como el de Gemini-TTS
      const n=24000*2, h=Buffer.alloc(44), data=Buffer.alloc(n);
      h.write('RIFF',0); h.writeUInt32LE(36+n,4); h.write('WAVE',8); h.write('fmt ',12);
      h.writeUInt32LE(16,16); h.writeUInt16LE(1,20); h.writeUInt16LE(1,22);
      h.writeUInt32LE(24000,24); h.writeUInt32LE(48000,28); h.writeUInt16LE(2,32);
      h.writeUInt16LE(16,34); h.write('data',36); h.writeUInt32LE(n,40);
      const wav=Buffer.concat([h,data]).toString('base64');
      if(d.engine==='eleven'){
        return json(res,200,{success:true,engine:'eleven',parts:[wav],alignments:[null],format:'mp3'});
      }
      json(res,200,{success:true,engine:'gemini',parts:[wav],alignments:[null],format:'wav',voice:(d.voice&&d.voice.voz)||'?',model:(d.voice&&d.voice.model)||'?'});
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/api/generate') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      let prompt = '';
      try { prompt = JSON.parse(body).prompt || ''; } catch (e) {}
      if (prompt.indexOf('CAPTION:') > -1) return json(res, 200, { success: true, text: CAPTION_TEXT });
      inFlight++; maxConcurrent = Math.max(maxConcurrent, inFlight);
      genCount++;
      const n = genCount;
      const m = prompt.match(/CONCEPTO: ([^\n]+)/);
      // Responde con una pequeña demora para que dos peticiones simultáneas se pisen y se detecten.
      setTimeout(() => {
        inFlight--;
        json(res, 200, { success: true, text: SCRIPT_TEXT(n, m ? m[1].trim() : '') });
      }, 400);
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/api/image') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => json(res, 200, { success: true, image: TINY_PNG }));
    return;
  }
  if (req.url.split('?')[0] === '/api/refs') {
    const set = (req.url.split('set=')[1] || 'post').split('&')[0];
    const n = set === 'personaje' ? 4 : 3;
    return json(res, 200, { refs: Array(n).fill(TINY_PNG), set, total: n });
  }
  if (req.method === 'POST' && req.url === '/api/trends') {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => json(res, 200, {
      success: true,
      text: 'GANCHOS QUE ESTÁN FUNCIONANDO\n- Pregunta directa sobre el sueldo en los primeros 2 segundos\n- Cifra cruda de cuánto pierde al año quien no invierte\n\nFORMATOS QUE RETIENEN\n- 30-45s narrados con imágenes que siguen el guion\n\nTEMAS EN SUBIDA\n- Ingresos pasivos con poco capital\n- El costo de quedarse empleado\n\nPARA REPLICAR ESTA SEMANA\n- Tres reels de impacto de 30s con dato crudo\n\nCONCEPTOS PARA GENERAR\nlibertad|dato|El precio real de cada año que sigues esperando para empezar\nmentalidad|pregunta|¿Por qué sigues llamando seguridad a lo que te tiene preso?\ninversion|pasos|Tres movimientos para que tu primer millón empiece con poco\nnegocio|afirmacion|Tu servicio no escala porque lo cobras por horas\nmillonario|historia|El día que entendí que el apalancamiento vence al esfuerzo',
      sources: [{ title: 'Fuente demo', uri: 'https://example.com/x' }],
    }));
    return;
  }
  if (req.method === 'POST' && req.url === '/api/unify') {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      let d = {};
      try { d = JSON.parse(b); } catch (e) {}
      if (!d.videos || !d.videos.length) return json(res, 400, { error: 'faltan videos' });
      if (!d.audioParts || !d.audioParts.length) return json(res, 400, { error: 'falta audio' });
      lastUnifyBody = d;
      return json(res, 200, { success: true, jobId: 'job-test123456' });
    });
    return;
  }
  if (req.url === '/__unifylog') return json(res, 200, { music: lastUnifyBody && lastUnifyBody.music });
  if (req.method === 'POST' && req.url === '/api/music-gen') {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      const t = { object: 'musica/ia-generada-0720.wav', name: 'ia-generada-0720.wav', size: 5000000 };
      musicTracks.push(t);
      setTimeout(() => json(res, 200, { success: true, object: t.object, name: t.name }), 300);
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/api/music') {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => {
      let d = {};
      try { d = JSON.parse(b); } catch (e) {}
      if (d.action === 'link') {
        return json(res, 200, { success: true, url: '/fake-music.wav' });
      }
      if (d.action === 'upload') {
        musicTracks.push({ object: 'musica/' + (d.name || 'pista.mp3').toLowerCase().replace(/[^a-z0-9._-]+/g, '-'), name: (d.name || 'pista.mp3').toLowerCase(), size: 1000 });
        return json(res, 200, { success: true, object: musicTracks[musicTracks.length - 1].object, name: musicTracks[musicTracks.length - 1].name });
      }
      return json(res, 200, { success: true, tracks: musicTracks });
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/api/unify-status') {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => json(res, 200, { done: true, videoUrl: '/fake-final.mp4' }));
    return;
  }
  if (req.url === '/fake-music.wav') {
    // WAV valido de ~0.5s de silencio (8kHz mono 16-bit)
    const sr = 8000, n = 4000, dataLen = n * 2;
    const buf = Buffer.alloc(44 + dataLen);
    buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataLen, 4); buf.write('WAVE', 8);
    buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
    buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28);
    buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36);
    buf.writeUInt32LE(dataLen, 40);
    res.writeHead(200, { 'Content-Type': 'audio/wav' });
    return res.end(buf);
  }
  if (req.url === '/fake-final.mp4') {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    return res.end(Buffer.alloc(4096, 7));
  }
  if (req.method === 'OPTIONS') { res.writeHead(200); return res.end(); }

  // estáticos
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const file = path.join(PUB, p);
  if (!file.startsWith(PUB) || !fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
  const ext = path.extname(file);
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8' });
  res.end(fs.readFileSync(file));
});

server.listen(PORT, () => console.log('mock server on ' + PORT));
