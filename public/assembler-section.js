// ============================================================
// ENSAMBLADOR DE REELS — SECCIÓN NUEVA (no modifica código existente)
// Sube archivos a GCS directamente (URLs firmadas), luego dispara el ensamblaje.
// Esto evita enviar JSON gigante en un fetch (que rompe Chrome iOS).
// ============================================================

function imgSrcToBase64(src) {
  return src.split(',')[1];
}

// Convierte base64 a Blob (para subir a GCS)
function base64ToBlob(b64, contentType) {
  var chars = atob(b64);
  var bytes = new Uint8Array(chars.length);
  for (var i = 0; i < chars.length; i++) bytes[i] = chars.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}

async function assembleReel(lang) {
  var isEN = lang === 'en';

  var audObj = isEN ? audEN : audES;
  if (!audObj || !audObj.b64) {
    alert(isEN ? 'Genera primero el Audio EN.' : 'Genera primero el Audio ES.');
    return;
  }
  if (!imgs || imgs.length === 0) {
    alert('Genera primero las imágenes.');
    return;
  }

  var btnId = isEN ? 'reel-btn-en' : 'reel-btn-es';
  var btn = document.getElementById(btnId);
  var statusEl = document.getElementById('reel-status');
  var resultEl = document.getElementById('reel-result');

  btn.disabled = true;
  btn.textContent = '⏳ Ensamblando...';
  statusEl.style.display = 'block';
  statusEl.textContent = 'Preparando archivos...';
  resultEl.style.display = 'none';

  try {
    // 1. Recopilar imágenes válidas
    var validImgs = [];
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i] && imgs[i].src) validImgs.push(imgSrcToBase64(imgs[i].src));
    }
    if (validImgs.length === 0) throw new Error('No hay imágenes válidas para ensamblar.');

    // 2. Generar SRT
    var srtContent = audObj.alignment
      ? makeSRTFromAlignment(audObj.alignment)
      : makeSRT(isEN ? (lastRes && lastRes.f) : (lastRes && lastRes.a));
    if (!srtContent) throw new Error('No se pudieron generar los subtítulos.');

    // 3. Carpeta única para esta sesión de ensamblaje
    var folder = 'reel-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

    // 4. Preparar lista de archivos a subir
    var fileList = [];
    for (var i = 0; i < validImgs.length; i++) {
      fileList.push({ name: 'img' + String(i).padStart(2, '0') + '.png', contentType: 'image/png' });
    }
    fileList.push({ name: 'voice.mp3', contentType: 'audio/mpeg' });
    fileList.push({ name: 'subtitles.srt', contentType: 'text/plain' });

    // 5. Pedir URLs firmadas de subida
    statusEl.textContent = 'Solicitando acceso de subida...';
    var urlResp = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: folder, files: fileList }),
    });
    var urlData = await urlResp.json();
    if (!urlResp.ok) throw new Error(urlData.error || 'Error obteniendo URLs de subida');
    var uploads = urlData.uploads;

    // Mapa nombre -> url firmada
    var urlMap = {};
    for (var i = 0; i < uploads.length; i++) urlMap[uploads[i].name] = uploads[i].url;

    // 6. Subir cada archivo directamente a GCS
    statusEl.textContent = 'Subiendo imágenes...';
    for (var i = 0; i < validImgs.length; i++) {
      var imgName = 'img' + String(i).padStart(2, '0') + '.png';
      var imgBlob = base64ToBlob(validImgs[i], 'image/png');
      var put = await fetch(urlMap[imgName], {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: imgBlob,
      });
      if (!put.ok) throw new Error('Error subiendo ' + imgName);
      statusEl.textContent = 'Subiendo imágenes... (' + (i + 1) + '/' + validImgs.length + ')';
    }

    // Subir audio (desde el blob ya existente)
    statusEl.textContent = 'Subiendo audio...';
    var audioBlob = audObj.blob ? audObj.blob : base64ToBlob(audObj.b64, 'audio/mpeg');
    var putAudio = await fetch(urlMap['voice.mp3'], {
      method: 'PUT',
      headers: { 'Content-Type': 'audio/mpeg' },
      body: audioBlob,
    });
    if (!putAudio.ok) throw new Error('Error subiendo el audio');

    // Subir SRT
    statusEl.textContent = 'Subiendo subtítulos...';
    var srtBlob = new Blob([srtContent], { type: 'text/plain' });
    var putSrt = await fetch(urlMap['subtitles.srt'], {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: srtBlob,
    });
    if (!putSrt.ok) throw new Error('Error subiendo los subtítulos');

    // 7. Disparar ensamblaje (solo metadatos ligeros)
    var slug = (lastRes && lastRes.topic ? lastRes.topic : 'reel')
      .slice(0, 25).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    statusEl.textContent = 'Ensamblando en Google Cloud... (puede tomar 2-5 minutos)';
    var response = await fetch('/api/assemble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folder: folder,
        imageCount: validImgs.length,
        lang: lang,
        slug: slug,
      }),
    });

    var data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en el servidor');

    statusEl.textContent = '✅ Reel listo.';
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<a href="' + data.url + '" download="legado-reel-' + lang + '.mp4" '
      + 'style="display:inline-block;background:linear-gradient(135deg,#b8975a,#d4b47a);color:#fff;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;margin-top:8px">'
      + '⬇ Descargar Reel ' + lang.toUpperCase() + ' (MP4)</a>';

  } catch (err) {
    statusEl.textContent = '❌ Error: ' + (err.message || 'Error desconocido');
    console.error('Error ensamblando reel:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = isEN ? '🎬 Reel EN' : '🎬 Reel ES';
  }
}

function initAssembler() {
  if (document.getElementById('reel-assembler')) return;

  var section = document.createElement('div');
  section.id = 'reel-assembler';
  section.style.cssText = 'margin-top:20px;display:none';
  section.innerHTML = ''
    + '<div class="slbl">🎬 Ensamblar Reel Final</div>'
    + '<div style="background:#fff;border:1.5px solid #7a9ec444;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px var(--sh)">'
    +   '<div style="background:#e8f0f8;padding:11px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">'
    +     '<div>'
    +       '<div style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7a9ec4">🎬 Ensamblador — Google Cloud</div>'
    +       '<div style="font-size:11px;color:var(--tx3);margin-top:2px">Imágenes + Audio + Subtítulos + Música → MP4 listo</div>'
    +     '</div>'
    +     '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    +       '<button id="reel-btn-es" onclick="assembleReel(\'es\')" style="background:linear-gradient(135deg,#b8975a,#d4b47a);color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">🎬 Reel ES</button>'
    +       '<button id="reel-btn-en" onclick="assembleReel(\'en\')" style="background:linear-gradient(135deg,#c4897a,#d4a090);color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">🎬 Reel EN</button>'
    +     '</div>'
    +   '</div>'
    +   '<div style="padding:16px">'
    +     '<div id="reel-status" style="display:none;font-size:12px;color:var(--tx3);margin-bottom:10px;font-style:italic"></div>'
    +     '<div id="reel-result" style="display:none"></div>'
    +     '<div style="font-size:11px;color:var(--tx3);line-height:1.6">Requiere: Audio ES o EN generado + 8 imágenes generadas. La música se selecciona aleatoriamente. El proceso toma 2-5 minutos en Google Cloud.</div>'
    +   '</div>'
    + '</div>';

  var expBtn = document.getElementById('expbtn');
  if (expBtn && expBtn.parentNode) {
    expBtn.parentNode.insertBefore(section, expBtn.nextSibling);
  }
}

window.addEventListener('load', function() {
  initAssembler();

  if (typeof chkExport === 'function') {
    var _origChkExport = chkExport;
    chkExport = function() {
      _origChkExport();
      var section = document.getElementById('reel-assembler');
      if (!section) {
        initAssembler();
        section = document.getElementById('reel-assembler');
      }
      if (section && typeof imgs !== 'undefined' && imgs && imgs.length > 0 && (typeof audES !== 'undefined' && audES || typeof audEN !== 'undefined' && audEN)) {
        section.style.display = 'block';
      }
    };
  }
});
