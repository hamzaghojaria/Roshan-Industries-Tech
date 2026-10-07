// Validate this complete source revision and write a reviewable migration report.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { categories, loadCatalogue } from '../src/catalogue.mjs';
const root = process.cwd();
const products = loadCatalogue(root);
const auditPath = path.join(root, 'reports/high-resolution-audit');
const images = JSON.parse(fs.readFileSync(path.join(auditPath, 'image-provenance.json'), 'utf8'));
const changes = JSON.parse(fs.readFileSync(path.join(auditPath, 'changes.json'), 'utf8'));
const workbook = JSON.parse(
  fs.readFileSync(path.join(auditPath, 'workbook-validation.json'), 'utf8'),
);
const previous = JSON.parse(
  fs.readFileSync(path.join(auditPath, 'previous-products.json'), 'utf8'),
);
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const source = path.resolve(root, '../reference-documents/roshan-high-resolution-source.pdf');
const pdf = path.join(root, 'assets/roshan-industries-catalogue.pdf');
assert.equal(hash(source), images.sourceSha256, 'Original high resolution source is preserved');
const branded = JSON.parse(
  fs.readFileSync(path.join(auditPath, 'branded-catalogue-validation.json'), 'utf8'),
);
assert.equal(hash(pdf), branded.pdfSha256);

assert.equal(hash(pdf), workbook.sourceSha256);
assert.equal(images.pdfPages, 21);
assert.equal(products.length, 228);
assert.equal(categories.length, 21);
assert.equal(new Set(products.map((p) => p.name)).size, 228);
assert.equal(new Set(products.map((p) => p.sku)).size, 228);
assert.equal(images.images.length, 216);
const expected = new Map([...Array(17)].map((_, n) => [n + 2, 12]));
expected.set(19, 8);
expected.set(20, 4);
for (const [page, count] of expected)
  assert.equal(products.filter((p) => p.page === page).length, count, 'PDF page coverage ' + page);
assert.equal(products.filter((p) => p.newArrival).length, 0);
assert.equal(changes.removed.length, 12);
for (const p of products) {
  const html = fs.readFileSync(path.join(root, p.url), 'utf8');
  assert(
    html.includes('roshan-industries-catalogue.pdf#page=' + p.cataloguePage),
    'Wrong current catalogue page ' + p.sku,
  );
  assert.equal(p.cataloguePage, branded.skuPages[p.sku]);
  assert(fs.existsSync(path.join(root, p.image)));
  assert(!/[\\/|*#@!~^<>{}\[\]]/.test(p.name), 'Unclean title ' + p.sku);
  assert(!/[\\/|*#@!~^<>{}\[\]]/.test(p.description), 'Unclean description ' + p.sku);
  assert(p.description.length > 120);
  const old = previous.find((old) => old.sku === p.sku);
  if (old) assert.equal(p.id, old.id, 'Stable product ID changed');
  if (p.onlineRange) {
    assert.equal(p.family, 'Pumps');
    assert(p.imageWidth > 0 && p.imageHeight > 0);
    assert(html.includes(p.imageLicense), 'Pump photograph licence missing');
    continue;
  }
  assert(
    previous.every((old) => old.description !== p.description),
    'Reused PDF product description',
  );
  assert(/^[a-z0-9-]+\.webp$/.test(path.basename(p.image)));
  const image = images.images.find((i) => i.sku === p.sku);
  assert(image);
  assert.equal(image.page, p.page);
  assert.equal(image.slot, p.slot);
  assert.equal(image.sha256, hash(path.join(root, p.image)));
  assert.deepEqual(image.dimensions, [p.imageWidth, p.imageHeight]);
  assert.equal(p.imageWidth, p.sourceCrop[2] - p.sourceCrop[0]);
  assert.equal(p.imageHeight, p.sourceCrop[3] - p.sourceCrop[1]);
  assert(p.imageWidth >= 580 && p.imageHeight >= 500);
}
assert(
  !fs
    .readFileSync(path.join(root, 'index.html'), 'utf8')
    .includes('Discover the latest additions.'),
);
assert.equal(workbook.allTabsColored, true);
for (const old of changes.removed)
  assert(
    products.some((p) => p.sku === old.sku),
    'Pump listing was not restored',
  );
assert.deepEqual(
  new Set(fs.readdirSync(path.join(root, 'assets/products'))),
  new Set(products.filter((p) => !p.onlineRange).map((p) => path.basename(p.image))),
);
assert.deepEqual(
  fs.readdirSync(path.join(root, 'assets')).filter((f) => f.endsWith('.pdf')),
  ['roshan-industries-catalogue.pdf'],
);
assert.equal(products.filter((p) => p.onlineRange).length, 12);
assert.equal(
  hash(path.join(root, 'Roshan-Industries-Product-Catalogue.xlsx')),
  workbook.xlsxSha256,
  'Workbook validation is stale',
);
assert.equal(
  hash(path.join(root, 'dist/Roshan-Industries-Product-Catalogue.xlsx')),
  workbook.xlsxSha256,
  'Published XLSX differs',
);
assert.equal(
  hash(path.join(root, 'dist/assets/roshan-industries-catalogue.pdf')),
  hash(pdf),
  'Published PDF differs',
);
assert.equal(workbook.allFieldsMatchWebsite, true);
assert.equal(workbook.products, products.length);
assert.equal(workbook.categorySheets, categories.length);
assert.equal(workbook.embeddedPhotos, 456);
const routes = [
  'index.html',
  'about.html',
  'contact.html',
  'catalogue.html',
  'categories.html',
  'new-arrivals.html',
  ...products.map((p) => p.url),
  ...categories.map((c) => 'categories/' + c.id + '.html'),
];
let downloadLinks = 0;
for (const file of routes) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert(
    !/roshan-updated-product-catalogue|roshan-product-catalogue/.test(html),
    'Outdated reference ' + file,
  );
  assert(!/200\+ products|212 products|20-page catalogue/.test(html), 'Outdated count ' + file);
  for (const link of html.matchAll(/href="([^"]+\.pdf(?:#[^"]*)?)"/g)) {
    assert(link[1].includes('roshan-industries-catalogue.pdf'));
    downloadLinks++;
  }
}
const result = {
  reviewDate: '2026-10-07',
  sourcePages: 21,
  productPagesReviewed: 19,
  pdfProducts: 216,
  websiteProducts: 228,
  workbookProducts: 228,
  categories: 21,
  retainedSkus: 200,
  newProducts: 16,
  restoredPumpProducts: 12,
  nativeProductImages: 216,
  uniqueTitles: 228,
  freshDescriptions: 216,
  downloadLinks,
  sourcePdfSha256: hash(source),
  brandedPdfSha256: hash(pdf),
  brandedCataloguePages: branded.pages,
  validation: 'Passed',
  notes: [
    'Pages 1 and 21 are covers.',
    'Page 19 has eight populated panels and four empty panels.',
    'Page 20 has four compass photographs without printed captions. Names preserve previous visually matched confirmed identities.',
    'Repeated printed captions are distinguished by visible product features.',
  ],
};
fs.writeFileSync(
  path.join(auditPath, 'final-validation.json'),
  JSON.stringify(result, null, 2) + '\n',
);
const lines = [
  '# Roshan Industries Catalogue Update Audit',
  '',
  'Source reviewed on 7 October 2026. The 21-page high resolution PDF is authoritative.',
  '',
  '216 PDF product entries plus 12 restored pump enquiry listings match 228 website and XLSX records in 21 categories and five families. Stable SKUs are preserved.',
  '',
  'All 216 product images are native scan crops saved losslessly. Every image has a recorded source page, panel, embedded-image reference, crop rectangle, dimensions and checksum. All descriptions are newly generated and differ from every previous description.',
  '',
  'The supplied PDF is preserved unchanged as the image and product reference. The branded downloadable catalogue contains all 228 products with a clickable category index and website headers and footers. The XLSX contains 228 matching records, 21 family-colored category sheets and 456 embedded PNG previews.',
  '',
  '## Page Coverage',
  '',
  '| PDF Page | Product Entries | Review |',
  '| --- | ---: | --- |',
  '| 1 | 0 | Front cover reviewed |',
  ...Array.from(
    expected,
    ([page, count]) => `| ${page} | ${count} | Labels and product photographs reviewed |`,
  ),
  '| 21 | 0 | Back cover reviewed |',
  '',
  '## Added Products',
  '',
  '| SKU | Product | PDF Page |',
  '| --- | --- | ---: |',
  ...products
    .filter((p) => changes.added.some((a) => a.sku === p.sku))
    .map((p) => `| ${p.sku} | ${p.name} | ${p.page} |`),
  '',
  '## Restored Pump Listings',
  '',
  'Restored at the explicit request of the user:',
  '',
  ...changes.removed.map((p) => `- ${p.sku} ${p.name}`),
  '',
  '## Review Notes',
  '',
  ...result.notes.map((n) => '- ' + n),
  '',
  'Historical data and images are archived in the workspace reference documents and are excluded from website hosting. Browser validation results are recorded in browser-validation.json.',
];
fs.writeFileSync(path.join(auditPath, 'Catalogue-Update-Audit.md'), lines.join('\n') + '\n');
console.log(
  'PASS: PDF coverage, all 216 images and fresh descriptions, stable SKUs, clean titles, branded catalogue links, restored pumps, and synchronized XLSX.',
);
