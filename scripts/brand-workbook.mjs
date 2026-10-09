import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  FileBlob,
  SpreadsheetFile,
} from 'file:///C:/Users/Hamza/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const meta = JSON.parse(
  await fs.readFile('reports/high-resolution-audit/workbook-brand-input.json', 'utf8'),
);
const wb = await SpreadsheetFile.importXlsx(
  await FileBlob.load('Roshan-Industries-Product-Catalogue.xlsx'),
);
const pdfHash = createHash('sha256')
  .update(await fs.readFile('assets/roshan-industries-catalogue.pdf'))
  .digest('hex');
console.log('Imported workbook for branding');
for (const m of meta) {
  const s = wb.worksheets.getItem(m.name);
  if (m.name === 'Overview') {
    s.getRange('A1:D1').format.font = { name: 'Calibri', size: 25, bold: true, color: '#202124' };
    s.getRange('A2:D2').format.font = { name: 'Calibri', size: 16, color: '#991B28' };
    s.getRange('A9').format.font = {
      name: 'Calibri',
      size: 13,
      bold: true,
      color: '#991B28',
      underline: 'single',
    };
    s.getRange('A11:D11').format.fill = '#202124';
    for (const r of m.familyRows)
      s.getRange('A' + r + ':D' + r).format = {
        fill: '#991B28',
        font: { bold: true, color: '#FFFFFF' },
      };
    for (let r = 12; r <= m.rows; r++)
      if (!m.familyRows.includes(r)) {
        s.getRange('B' + r).format.font.color = '#202124';
        s.getRange('D' + r).format.font.color = '#991B28';
      }
    s.images.add({
      dataUrl:
        'data:image/png;base64,' +
        (await fs.readFile('assets/roshan-logo-new.png')).toString('base64'),
      anchor: { from: { row: 0, col: 4 }, extent: { widthPx: 100, heightPx: 100 } },
    });
  } else {
    for (const name of m.tables) s.tables.getItem(name).style = 'TableStyleLight1';
    s.getRange('A1:O1').format.font = { name: 'Calibri', size: 19, bold: true, color: '#202124' };
    s.getRange('A2:O2').format.font = { name: 'Calibri', size: 11, bold: true, color: '#991B28' };
    s.getRange('A3').format.font.color = '#991B28';
    s.getRange('A5:O5').format = { fill: '#202124', font: { bold: true, color: '#FFFFFF' } };
    s.getRange('O6:O' + m.rows).values = [[pdfHash]];
    s.getRange('E6:E' + m.rows).format.font.color = '#202124';
    for (const c of ['H', 'I', 'L'])
      s.getRange(c + '6:' + c + m.rows).format.font.color = '#991B28';
    for (let r = 6; r <= m.rows; r++)
      s.getRange('A' + r + ':O' + r).format.fill = r % 2 === 0 ? '#FCF1F2' : '#FFFFFF';
  }
}
await fs.mkdir('reports/workbook-brand-review', { recursive: true });
console.log('Branding applied; rendering overview');
try {
  const image = await wb.render({ sheetName: 'Overview', range: 'A1:F9', scale: 1, format: 'png' });
  await fs.writeFile(
    'reports/workbook-brand-review/overview.png',
    new Uint8Array(await image.arrayBuffer()),
  );
} catch (e) {
  console.log('Render unavailable:', e.message);
}
await (
  await SpreadsheetFile.exportXlsx(wb)
).save('reports/workbook-brand-review/catalogue-branded.xlsx');
console.log('Branded workbook exported for verification');
