from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
service = root / 'cloudrun' / 'unify'
files = ['package.json', 'package-lock.json', 'Dockerfile', 'index.js', 'timeline.js']
embedded = []
for name in files:
    path = service / name
    if not path.exists():
        if name == 'package-lock.json':
            continue
        raise FileNotFoundError(path)
    embedded.append("cat > " + name + " <<'ARCHIVO_FIN'\n" + path.read_text().rstrip() + "\nARCHIVO_FIN\n")
version = re.search(r"^const VERSION = '([^']+)';", (service / 'index.js').read_text(), re.M)
if not version:
    raise ValueError('Falta VERSION en el montador')
content = (service / 'update-template.sh').read_text().replace('# EMBED_FILES', '\n'.join(embedded)).replace('@RENDER_VERSION@', version.group(1))
for target in ['public/u.sh', 'public/i.sh', 'cloudrun/unify/actualizar.sh', 'cloudrun/unify/instalar.sh']:
    (root / target).write_text(content)
