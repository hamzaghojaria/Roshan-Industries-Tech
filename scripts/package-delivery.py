"""Package the finished website and editable source without local tools or secrets."""
from pathlib import Path
import zipfile, json
ROOT=Path(__file__).resolve().parents[1]
def package(name,files,base):
    temporary=ROOT/(name+'.tmp')
    with zipfile.ZipFile(temporary,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
        for file in sorted(files):archive.write(file,file.relative_to(base).as_posix())
    temporary.replace(ROOT/name)
    with zipfile.ZipFile(ROOT/name) as archive:assert archive.testzip() is None
    print(f'PASS {name}: {len(files)} files',flush=True)
package('roshan-website.zip',[p for p in (ROOT/'dist').rglob('*') if p.is_file()],ROOT/'dist')
files=[]
for directory in ['src','assets','scripts','tests']:
    files.extend(p for p in (ROOT/directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
files.extend(p for p in (ROOT/'reports/high-resolution-audit').glob('*') if p.suffix in ['.json','.md'])
for name in ['README.md','package.json','package-lock.json','requirements.txt','render.yaml','.gitignore','Roshan-Industries-Product-Catalogue.xlsx']:
    if (ROOT/name).is_file():files.append(ROOT/name)
package('Roshan-Industries-Source.zip',files,ROOT)
