#!/usr/bin/env bash
# comprobar.sh — revision rapida ANTES de desplegar.
#
# public/app.js son ~3.800 lineas de ES5 escritas a mano. Un error de sintaxis no
# rompe una pantalla: rompe TODA la aplicacion. Y borrar una funcion que parecia
# muerta pero no lo era rompe una seccion entera sin que la sintaxis se queje.
# Esto atrapa las dos cosas en dos segundos.
#
#   bash comprobar.sh
set -u
cd "$(dirname "$0")"
fallos=0

echo "== sintaxis =="
for f in api/*.js cloudrun/unify/*.js public/*.js tests/*.js; do
  if node --check "$f" >/dev/null 2>&1; then
    printf '  ok    %s\n' "$f"
  else
    printf '  ROTO  %s\n' "$f"; node --check "$f" 2>&1 | sed 's/^/        /'; fallos=$((fallos+1))
  fi
done

echo "== JSON =="
for f in vercel.json package.json; do
  [ -f "$f" ] || continue
  if node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null; then
    printf '  ok    %s\n' "$f"
  else
    printf '  ROTO  %s\n' "$f"; fallos=$((fallos+1))
  fi
done

echo "== referencias del frontend =="
node - <<'JS' || fallos=$((fallos+1))
const fs = require('fs');
const js = ['public/app.js','public/studio.js','public/studio-core.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n');
const html = fs.readFileSync('public/index.html', 'utf8');
let malo = 0;

// Funciones que se llaman pero no existen. Esto es lo que atrapa haber borrado
// una funcion "muerta" que en realidad seguia en uso.
// Cualquier nombre ligado en el archivo cuenta como definido: funciones, pero
// tambien variables, parametros y capturas de catch (una variable puede guardar
// una funcion y llamarse igual: `res(...)` dentro de un new Promise).
const defs = new Set();
const marcarLista = (txt) => String(txt || '').split(',')
  .map(x => x.trim().replace(/[=[\]{}.].*$/, '').trim())
  .filter(x => /^[A-Za-z_$][\w$]*$/.test(x)).forEach(x => defs.add(x));

// Nombres del entorno del navegador y del lenguaje que nunca se definen aqui.
const NATIVAS = new Set(('alert confirm prompt setTimeout setInterval clearTimeout clearInterval ' +
  'parseInt parseFloat isNaN isFinite Number String Boolean Array Object JSON Math Date RegExp Error ' +
  'Promise Map Set WeakMap Symbol BigInt encodeURIComponent decodeURIComponent encodeURI decodeURI ' +
  'fetch require atob btoa escape unescape structuredClone queueMicrotask reportError ' +
  'Blob File FileReader FormData Headers Request Response URL URLSearchParams AbortController ' +
  'Image Audio Video Event CustomEvent MutationObserver IntersectionObserver ResizeObserver ' +
  'AudioContext webkitAudioContext Notification Worker XMLHttpRequest TextEncoder TextDecoder ' +
  'Uint8Array Int16Array Float32Array ArrayBuffer DataView Intl Proxy Reflect ' +
  'if for while switch catch typeof return function this new delete void in of do else try await async ' +
  'console document window navigator localStorage sessionStorage location history screen ' +
  // Librerias externas que index.html carga por <script>: existen en tiempo de
  // ejecucion aunque no esten definidas en app.js.
  'JSZip Option AbortSignal OfflineAudioContext webkitOfflineAudioContext'
).split(/\s+/));

// Hay que mirar SOLO codigo: los comentarios y los textos de los prompts estan
// llenos de palabras seguidas de un parentesis y darian cientos de falsos avisos.
function soloCodigo(src) {
  let out = '', i = 0, n = src.length;
  // Para saber si un "/" abre una expresion regular o es una division, basta con
  // mirar el ultimo caracter significativo que salio.
  const abreRegex = () => {
    for (let k = out.length - 1; k >= 0; k--) {
      const ch = out[k];
      if (/\s/.test(ch)) continue;
      return /[(,=:[!&|?{};+\-*%~^<>]/.test(ch);
    }
    return true;
  };
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
    // Expresion regular: se salta entera. Sin esto, un /["']/ dentro de un regex
    // abria una cadena falsa y se tragaba medio archivo.
    if (c === '/' && abreRegex()) {
      let j = i + 1, clase = false;
      while (j < n) {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '[') clase = true;
        else if (src[j] === ']') clase = false;
        else if (src[j] === '/' && !clase) break;
        else if (src[j] === '\n') break;
        j++;
      }
      if (j < n && src[j] === '/') { i = j + 1; while (i < n && /[a-z]/.test(src[i])) i++; out += ' RE '; continue; }
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++;
      while (i < n) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === q) { i++; break; }
        if (q === '`' && src[i] === '$' && src[i + 1] === '{') { // interpolacion: sí es código
          i += 2; let prof = 1;
          while (i < n && prof) { if (src[i] === '{') prof++; else if (src[i] === '}') prof--; if (prof) out += src[i]; i++; }
          continue;
        }
        i++;
      }
      out += '""'; continue;
    }
    out += c; i++;
  }
  return out;
}
const codigo = soloCodigo(js);

for (const m of codigo.matchAll(/function\s*([A-Za-z_$][\w$]*)?\s*\(([^)]*)\)/g)) { if (m[1]) defs.add(m[1]); marcarLista(m[2]); }
for (const m of codigo.matchAll(/(?:var|let|const)\s+([^;\n=]+?)\s*[=;\n]/g)) marcarLista(m[1]);
for (const m of codigo.matchAll(/catch\s*\(\s*([A-Za-z_$][\w$]*)/g)) defs.add(m[1]);
for (const m of codigo.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)) defs.add(m[1]);
for (const m of codigo.matchAll(/\(?\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>/g)) defs.add(m[1]);
for (const m of codigo.matchAll(/for\s*\(\s*(?:var|let|const)\s+([A-Za-z_$][\w$]*)/g)) defs.add(m[1]);

const llamadas = new Set();
for (const m of codigo.matchAll(/(?:^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) llamadas.add(m[1]);
const faltan = [...llamadas].filter(n => !defs.has(n) && !NATIVAS.has(n));
if (faltan.length) { console.log('  SIN DEFINIR en app.js: ' + faltan.join(', ')); malo = 1; }
else console.log('  ok    todas las funciones que se llaman existen');

// Manejadores puestos desde el HTML que no existen en el JS.
const desdeHtml = new Set();
for (const m of html.matchAll(/\son(?:click|change|input|submit|keydown|keyup)="([^"]+)"/g))
  for (const f of m[1].matchAll(/([A-Za-z_$][\w$]*)\s*\(/g)) desdeHtml.add(f[1]);
const htmlFaltan = [...desdeHtml].filter(n => !defs.has(n) && !NATIVAS.has(n));
if (htmlFaltan.length) { console.log('  SIN DEFINIR (llamadas desde el HTML): ' + htmlFaltan.join(', ')); malo = 1; }
else console.log('  ok    los botones del HTML apuntan a funciones que existen');

// getElementById de ids que no estan en el HTML ni se crean en el JS.
const idsHtml = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const idsJs = new Set([...js.matchAll(/id=['"]([A-Za-z0-9_-]+)['"]/g)].map(m => m[1]));
const usados = [...new Set([...js.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]))];
const huerfanos = usados.filter(i => !idsHtml.has(i) && !idsJs.has(i));
if (huerfanos.length) console.log('  aviso: ids que no existen (código muerto?): ' + huerfanos.join(', '));
else console.log('  ok    ningún id huérfano');

process.exit(malo);
JS

echo "== el index.js de Cloud Run va igual en los instaladores =="
for s in public/u.sh public/i.sh cloudrun/unify/actualizar.sh cloudrun/unify/instalar.sh; do
  [ -f "$s" ] || continue
  ln=$(grep -n "cat > index.js <<'ARCHIVO_FIN'" "$s" | cut -d: -f1)
  if [ -z "$ln" ]; then printf '  ?     %s (no encontré el bloque)\n' "$s"; continue; fi
  awk -v st="$ln" 'NR>st{if($0=="ARCHIVO_FIN")exit; print}' "$s" > /tmp/_emb.js
  if diff -q /tmp/_emb.js cloudrun/unify/index.js >/dev/null 2>&1; then
    printf '  ok    %s\n' "$s"
  else
    printf '  DESFASADO %s (regenera el instalador)\n' "$s"; fallos=$((fallos+1))
  fi
done
rm -f /tmp/_emb.js

echo "== la version del montaje =="
# La herramienta le dice sola al usuario si su Cloud Run esta al dia comparando
# dos constantes. Si se tocan sin bumpear la version, dira "al dia" mintiendo.
vser=$(grep -m1 "^const VERSION = '" cloudrun/unify/index.js | sed "s/.*'\(.*\)'.*/\1/")
vesp=$(grep -m1 "^const VERSION_ESPERADA = '" api/unify.js | sed "s/.*'\(.*\)'.*/\1/")
if [ -z "$vser" ] || [ -z "$vesp" ]; then
  echo "  FALTA la constante VERSION en el servicio o VERSION_ESPERADA en api/unify.js"; fallos=$((fallos+1))
elif [ "$vser" != "$vesp" ]; then
  echo "  DESCUADRADAS: el servicio dice $vser y la herramienta espera $vesp"; fallos=$((fallos+1))
else
  echo "  ok    servicio y herramienta van por la $vser"
  # Si el servicio cambio respecto al ultimo commit, la version TIENE que cambiar
  # tambien; si no, el usuario no se entera de que le falta actualizar.
  if git rev-parse --git-dir >/dev/null 2>&1 && ! git diff --quiet HEAD -- cloudrun/unify/index.js 2>/dev/null; then
    vant=$(git show HEAD:cloudrun/unify/index.js 2>/dev/null | grep -m1 "^const VERSION = '" | sed "s/.*'\(.*\)'.*/\1/")
    if [ -n "$vant" ] && [ "$vant" = "$vser" ]; then
      echo "  SIN BUMPEAR: cambiaste el servicio pero dejaste la version en $vser"; fallos=$((fallos+1))
    else
      echo "  ok    el servicio cambio y la version subio ($vant → $vser)"
    fi
  fi
fi

echo
if [ "$fallos" -eq 0 ]; then echo "TODO OK — se puede desplegar"; else echo "$fallos problema(s): NO despliegues"; fi
exit "$fallos"
