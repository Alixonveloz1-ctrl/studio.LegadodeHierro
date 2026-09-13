from pathlib import Path

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
content = (service / 'update-template.sh').read_text().replace('# EMBED_FILES', '\n'.join(embedded))
for target in ['public/u.sh', 'public/i.sh', 'cloudrun/unify/actualizar.sh', 'cloudrun/unify/instalar.sh']:
    (root / target).write_text(content)
