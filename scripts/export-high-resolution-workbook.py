"""Compatibility entry point for the synchronized customer catalogue workflow."""
from pathlib import Path
import os
import shutil
import subprocess


def main():
    root = Path(__file__).resolve().parents[1]
    portable = root.parent / '.site-tools/node-ready/node-v22.14.0-win-x64/node.exe'
    node = os.environ.get('CATALOGUE_NODE') or shutil.which('node')
    if not node and portable.is_file():
        node = str(portable)
    if not node:
        raise RuntimeError('Node.js 22 or newer is required for catalogue updates.')
    subprocess.run([node, 'scripts/update-catalogues.mjs'], cwd=root, check=True)


if __name__ == '__main__':
    main()
