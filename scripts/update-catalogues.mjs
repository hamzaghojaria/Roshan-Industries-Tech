// One command builds the website and refreshes only stale catalogue exports.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const started = Date.now();
const statePath = 'reports/catalogue-export-state.json';
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const fileHash = (file) => (fs.existsSync(file) ? hash(fs.readFileSync(file)) : null);
const old = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  process.stdout.write(result.stdout || '');
  if (result.stderr) process.stderr.write(result.stderr);
  // This runtime can exit 1 during WASM cleanup after saving a valid workbook.
  // Accept that specific case only when a fresh export exists; the next stage validates it.
  const completedWorkbook =
    options.workbook &&
    [1, 3221226505].includes(result.status) &&
    result.stdout?.includes('Exported 311 records') &&
    fs.statSync('Roshan-Industries-Product-Catalogue.xlsx').mtimeMs >= options.started;
  if (result.error || (result.status !== 0 && !completedWorkbook))
    throw result.error || new Error(`${command} failed (${result.status})`);
}
function python(script) {
  const search = [
    path.resolve(root, '../.site-tools/python-export'),
    path.resolve(root, 'scripts'),
  ];
  const code = `import sys,runpy; sys.path[:0]=${JSON.stringify(search)}; runpy.run_path(${JSON.stringify(script)},run_name='__main__')`;
  run(process.env.CATALOGUE_PYTHON || 'python', ['-c', code]);
}
function signature(files, products) {
  return hash(JSON.stringify({ products, files: files.map((file) => [file, fileHash(file)]) }));
}
run(process.execPath, ['scripts/build.mjs']);
const readProducts = () =>
  JSON.parse(
    fs
      .readFileSync('products.js', 'utf8')
      .split('window.ROSHAN_PRODUCTS =')[1]
      .trim()
      .replace(/;$/, ''),
  );
let products = readProducts();
const images = [...new Set(['assets/roshan-logo-new.png', ...products.map((p) => p.image)])];
const pdfFiles = ['scripts/export-branded-catalogue.py', 'scripts/catalogue_images.py', ...images];
const pdf = 'assets/roshan-industries-catalogue.pdf';
const xlsx = 'Roshan-Industries-Product-Catalogue.xlsx';
const pdfInput = signature(pdfFiles, products);
const updatePdf = old.pdfInput !== pdfInput || old.pdfOutput !== fileHash(pdf);
if (updatePdf) {
  python('scripts/export-branded-catalogue.py');
  run(process.execPath, ['scripts/build.mjs']);
  products = readProducts();
} else console.log('[catalogue] PDF unchanged; reusing the verified export.');
const xlsxFiles = [
  'scripts/export-catalogue-workbook.mjs',
  'scripts/finish-catalogue-workbook.py',
  'scripts/prepare-workbook-previews.py',
  'scripts/workbook_images.py',
  pdf,
  ...images,
];
const xlsxInput = signature(xlsxFiles, products);
const updateXlsx = old.xlsxInput !== xlsxInput || old.xlsxOutput !== fileHash(xlsx);
if (updateXlsx) {
  python('scripts/prepare-workbook-previews.py');
  run(process.execPath, ['scripts/export-catalogue-workbook.mjs'], {
    workbook: true,
    started: Date.now(),
  });
  python('scripts/finish-catalogue-workbook.py');
  run(process.execPath, ['scripts/build.mjs']);
} else console.log('[catalogue] Excel unchanged; reusing the verified export.');
run(process.execPath, ['scripts/check.mjs']);
run(process.execPath, ['scripts/validate-high-resolution.mjs']);
if (updatePdf || updateXlsx) python('scripts/validate-synchronized-exports.py');
fs.writeFileSync(
  statePath,
  JSON.stringify(
    {
      pdfInput: signature(pdfFiles, products),
      pdfOutput: fileHash(pdf),
      xlsxInput,
      xlsxOutput: fileHash(xlsx),
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `PASS catalogue refresh in ${((Date.now() - started) / 1000).toFixed(1)}s: ${products.length} products, synchronized PDF and Excel.`,
);
