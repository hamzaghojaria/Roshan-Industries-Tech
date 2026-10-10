import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
const req = createRequire(
  path.join(
    os.homedir(),
    '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json',
  ),
);
const { Workbook, SpreadsheetFile } = await import(
  pathToFileURL(req.resolve('@oai/artifact-tool')).href
);
const products = JSON.parse(
  (await fs.readFile('products.js', 'utf8'))
    .split('window.ROSHAN_PRODUCTS =')[1]
    .trim()
    .replace(/;$/, ''),
);
const categories = JSON.parse(await fs.readFile('src/data/reviewed-categories.json', 'utf8'));
const previews = JSON.parse(await fs.readFile('artifacts/workbook-previews.json', 'utf8'));
const wb = Workbook.create();
const overview = wb.worksheets.add('Overview');
overview.tabColor = '#991B28';
const colors = {
  Watchmaking: '#991B28',
  Clockmaking: '#B68A42',
  Jewellery: '#8B5CB2',
  'Workshop Essentials': '#2C8790',
  'Precision Machining': '#4B7F52',
};
const headers = [
  'SKU',
  'Product',
  'Description',
  'Category',
  'Photo',
  'Product Page',
  'Catalogue Reference',
];
const widths = [15, 40, 70, 32, 18, 22, 22];
const manifest = [];
function makeSheet(title, items, index) {
  const s = wb.worksheets.add(title);
  const family =
    new Set(items.map((p) => p.family)).size === 1 ? items[0].family : 'All five product families';
  const color = colors[family] || '#202124';
  s.tabColor = color;
  s.getRange(`A1:G${items.length + 5}`).format = {
    font: { name: 'Arial', size: 10, color: '#202124' },
    verticalAlignment: 'center',
    wrapText: true,
  };
  s.mergeCells('A1:G1');
  s.getRange('A1').values = [['Roshan Industries Product Catalogue']];
  s.getRange('A1').format.font = { size: 19, bold: true };
  s.getRange('A1:G1').format.rowHeight = 30;
  s.mergeCells('A2:G2');
  s.getRange('A2').values = [[`Family: ${family}   |   ${title}   |   ${items.length} products`]];
  s.getRange('A2').format.font = { size: 11, bold: true, color };
  s.getRange('A3').values = [['Back to Overview']];
  s.getRange('A5:G5').values = [headers];
  s.getRange('A5:G5').format = {
    fill: '#202124',
    font: { bold: true, color: '#FFFFFF' },
    rowHeight: 28,
  };
  s.getRange(`A6:G${items.length + 5}`).values = items.map((p) => [
    p.sku,
    p.name,
    p.description,
    p.category,
    null,
    'View Product',
    `Page ${p.cataloguePage}`,
  ]);
  s.getRange(`A6:G${items.length + 5}`).format.rowHeight = 88;
  for (let i = 0; i < items.length; i++) {
    const p = items[i];
    const row = i + 6;
    if (row % 2 === 0) s.getRange(`A${row}:G${row}`).format.fill = '#FCF1F2';
    s.getRange(`D${row}`).format.font = { bold: true, color: colors[p.family] };
    const image = previews[p.image];
    const scale = Math.min(115 / image.width, 100 / image.height);
    s.images.add({
      dataUrl: image.dataUrl,
      anchor: {
        from: { row: row - 1, col: 4 },
        extent: { widthPx: image.width * scale, heightPx: image.height * scale },
      },
    });
  }
  widths.forEach(
    (width, i) =>
      (s.getRange(
        `${String.fromCharCode(65 + i)}1:${String.fromCharCode(65 + i)}${items.length + 5}`,
      ).format.columnWidth = width),
  );
  s.freezePanes.freezeRows(5);
  s.freezePanes.freezeColumns(2);
  s.tables.add(`A5:G${items.length + 5}`, true, `Products${index}`);
  manifest.push({ title, items: items.map((p) => p.sku) });
  return s;
}
overview.mergeCells('A1:D1');
overview.getRange('A1').values = [['Roshan Industries']];
overview.getRange('A1').format.font = { name: 'Arial', size: 25, bold: true, color: '#202124' };
overview.getRange('A1:D1').format.rowHeight = 38;
overview.mergeCells('A2:D2');
overview.getRange('A2').values = [['Product Catalogue and Database']];
overview.getRange('A2').format.font = { size: 16, color: '#991B28' };
overview.getRange('A4:A7').values = [
  [`${products.length} products`],
  [`${categories.length} categories across five families`],
  ['Custom CNC & VMC - All Jobs'],
  ['Updated website catalogue with clickable category index'],
];
for (let r = 4; r <= 7; r++) overview.mergeCells(`A${r}:D${r}`);
overview.getRange('A9').values = [['All Products']];
overview.getRange('A11:D11').values = [['Category', 'Family', 'Products', 'Open Category']];
overview.getRange('A11:D11').format = { fill: '#202124', font: { bold: true, color: '#FFFFFF' } };
overview.images.add({
  dataUrl:
    'data:image/png;base64,' + (await fs.readFile('assets/roshan-logo-new.png')).toString('base64'),
  anchor: { from: { row: 0, col: 4 }, extent: { widthPx: 100, heightPx: 100 } },
});
makeSheet('All Products', products, 0);
let row = 11,
  index = 0;
for (const [family, color] of Object.entries(colors)) {
  row++;
  overview.mergeCells(`A${row}:D${row}`);
  overview.getRange(`A${row}`).values = [
    [`${family.toUpperCase()}   ${products.filter((p) => p.family === family).length} products`],
  ];
  overview.getRange(`A${row}:D${row}`).format = {
    fill: color,
    font: { bold: true, color: '#FFFFFF' },
    rowHeight: 30,
  };
  for (const c of categories.filter((c) => c.family === family)) {
    const items = products.filter((p) => p.categoryId === c.id);
    const title = c.name.replaceAll(' and ', ' ').slice(0, 31);
    makeSheet(title, items, ++index);
    row++;
    overview.getRange(`A${row}:D${row}`).values = [[c.name, family, items.length, 'View Products']];
    overview.getRange(`A${row}:D${row}`).format = {
      wrapText: true,
      verticalAlignment: 'center',
      rowHeight: 28,
    };
  }
}
[40, 25, 14, 22].forEach(
  (width, i) =>
    (overview.getRange(
      `${String.fromCharCode(65 + i)}1:${String.fromCharCode(65 + i)}${row}`,
    ).format.columnWidth = width),
);
wb.recalculate();
wb.recalculate();
await fs.writeFile('artifacts/workbook-sheet-manifest.json', JSON.stringify(manifest, null, 2));
await (await SpreadsheetFile.exportXlsx(wb)).save('Roshan-Industries-Product-Catalogue.xlsx');
console.log(
  `Exported ${products.length} records and ${categories.length} category sheets with source-matched images.`,
);
try {
  const preview = await wb.render({
    sheetName: 'Storage',
    range: 'A5:G9',
    scale: 1.3,
    format: 'png',
  });
  await fs.writeFile(
    'artifacts/workbook-storage-preview.png',
    new Uint8Array(await preview.arrayBuffer()),
  );
  console.log('Rendered Storage workbook preview.');
} catch (error) {
  console.log('Workbook renderer:', error.message);
}
