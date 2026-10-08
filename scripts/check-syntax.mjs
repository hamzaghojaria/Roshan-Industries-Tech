// Parse all maintained JavaScript files without running exporters or browser interactions.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function codeFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return codeFiles(file);
    return /\.(?:js|mjs|cjs)$/.test(entry.name) ? [file] : [];
  });
}
const files = ['src', 'scripts', 'tests'].flatMap((directory) =>
  codeFiles(path.join(root, directory)),
);
let failures = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    console.error(`[syntax] FAIL ${path.relative(root, file)}:`, result.error || result.stderr);
    failures++;
  }
}
console.log(`[syntax] ${failures ? 'FAIL' : 'PASS'}: checked ${files.length} JavaScript files.`);
process.exitCode = failures ? 1 : 0;
