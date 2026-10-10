// Compatibility entry point: use the maintained, synchronized seven-column export.
// The former branding script could restore obsolete internal workbook columns.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('[catalogue] brand-workbook.mjs now delegates to update:catalogues.');
  await import('./update-catalogues.mjs');
}
