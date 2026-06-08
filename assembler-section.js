// ============================================================
// ENSAMBLADOR DE REELS — SECCIÓN NUEVA (no modifica código existente)
// Se agrega después del botón de exportar ZIP
// ============================================================

// Convierte blob a base64
function blobToBase64(blob) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onloadend = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Convierte src base64 de imagen a base64 puro
function imgSrcToBase64(src) {
  return src.split(',')[1];
}

async function assembleReel(lang) {
  var isEN = lang === 'en';

  // Validar que tenemos los elementos necesarios
  var audObj = isEN ? audEN : audES;
  if (!audObj || !audObj.blob) {
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
    // 1. Convertir audio a base64
    statusEl.textContent = 'Procesando audio...';
    var audioB64 = await blobToBase64(audObj.blob);

    // 2. Recopilar imágenes como base64
    statusEl.textContent = 'Procesando imágenes...';
    var imagesB64 = [];
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i] && imgs[i].src) {
        imagesB64.push(imgSrcToBase64(imgs[i].src));
      }
    }
    if (imagesB64.length === 0) {
      throw new Error('No hay imágenes válidas para ensamblar.');
    }

    // 3. Generar SRT con los timestamps reales
    var srtContent = audObj.alignment
      ? makeSRTFromAlignment(audObj.alignment)
      : makeSRT(isEN ? (lastRes && lastRes.f) : (lastRes && lastRes.a));

    if (!srtContent) {
      throw new Error('No se pudieron generar los subtítulos.');
    }

    // 4. Preparar slug
    var slug = (lastRes && lastRes.topic ? lastRes.topic : 'reel')
      .slice(0, 25)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();

    // 5. Llamar al endpoint de ensamblaje
    statusEl.textContent = 'Enviando a Google Cloud... (puede tomar 2-5 minutos)';

    var response = await fetch('/api/assemble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: imagesB64,
        audio: audioB64,
        srt: srtContent,
        lang: lang,
        slug: slug,
      }),
    });

    var data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en el servidor');

    // 6. Mostrar link de descarga
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

// Función para inicializar los botones del ensamblador
function initAssembler() {
  // Verificar si ya existe la sección para no duplicar
  if (document.getElementById('reel-assembler')) return;

  // Crear sección del ensamblador
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

  // Insertar DESPUÉS del botón de exportar ZIP
  var expBtn = document.getElementById('expbtn');
  if (expBtn && expBtn.parentNode) {
    expBtn.parentNode.insertBefore(section, expBtn.nextSibling);
  }
}

// Modificar chkExport para también mostrar el ensamblador cuando haya audio e imágenes
var _origChkExport = chkExport;
chkExport = function() {
  _origChkExport();
  var section = document.getElementById('reel-assembler');
  if (!section) {
    initAssembler();
    section = document.getElementById('reel-assembler');
  }
  if (section && imgs && imgs.length > 0 && (audES || audEN)) {
    section.style.display = 'block';
  }
};
