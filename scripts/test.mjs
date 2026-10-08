// Run browser and build regressions in a predictable order and report every failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Screenshot capture and Excel COM automation are explicit manual tools, not suite tests.
const available = fs
  .readdirSync(path.join(root, 'tests'))
  .filter((file) => file.endsWith('-qa.cjs'))
  .sort();
// Pass suite filenames to rerun selected failures without repeating the whole audit.
const requested = process.argv.slice(2);
for (const file of requested)
  if (!available.includes(file)) throw new Error(`[test] Unknown suite: ${file}`);
const files = requested.length ? requested : available;
const failed = [];
for (const file of files) {
  console.log(`\n[test] Running ${file}`);
  const passed = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(root, 'tests', file)], {
      cwd: root,
      stdio: 'inherit',
      // The mobile audit visits every route at three widths and needs more than three minutes.
      timeout: 600000,
    });
    child.on('error', (error) => {
      console.error(`[test] Could not start ${file}:`, error.message);
      resolve(false);
    });
    child.on('close', (code) => resolve(code === 0));
  });
  if (!passed) {
    failed.push(file);
    console.error(`[test] FAIL ${file} (assertion, process error or timeout).`);
  }
}
console.log(`\n[test] ${files.length - failed.length}/${files.length} suites passed.`);
if (failed.length) console.error('[test] Failed suites:', failed.join(', '));
process.exitCode = failed.length ? 1 : 0;
