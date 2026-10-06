// Reviewed category assignments and product records with permanent SKU allocation.
import { pumpCategories, pumpProducts } from './pumps.mjs';
import { describeProduct } from './descriptions.mjs';
import fs from 'node:fs';
import path from 'node:path';
// Category metadata powers navigation, grouping and category landing pages.
export const categories = [
  [
    'eye-loupes',
    'Eye Loupes & Magnifiers',
    'Watchmaking',
    'p02-01',
    'Wooden, aluminium and plastic eye glasses, headband models and auxiliary lenses for close inspection.',
  ],
  [
    'screwdrivers',
    'Precision Screwdrivers',
    'Watchmaking',
    'p15-01',
    'Individual screwdrivers, replacement-pin models and complete sets for the watchmaker’s bench.',
  ],
  [
    'case-openers',
    'Case Opening Tools',
    'Watchmaking',
    'p13-04',
    'Knife openers, back-opening tools and wrenches in a range of catalogue models.',
  ],
  [
    'link-strap-tools',
    'Bracelet & Strap Tools',
    'Watchmaking',
    'p08-05',
    'Link removers, side-bar tools, pin pushers and strap holders for bracelet and strap work.',
  ],
  [
    'glass-hand-tools',
    'Glass & Hand Fitting',
    'Watchmaking',
    'p16-02',
    'Glass fitting machines, fitting bases and hand presser tools.',
  ],
  [
    'clock-keys',
    'Clock Winding Keys',
    'Clockmaking',
    'p11-12',
    'Brass and nickel winding keys, crank keys and multi-size key sets.',
  ],
  [
    'clock-parts',
    'Clock Parts & Accessories',
    'Clockmaking',
    'p09-10',
    'Gongs, hooks, stabilizers and other clock components shown in the Roshan Industries catalogue.',
  ],
  [
    'jewellery-tools',
    'Jewellery Bench Tools',
    'Jewellery',
    'p07-01',
    'Work holders, ring clamps, shovels and practical tools for jewellery bench work.',
  ],
  [
    'soldering-tools',
    'Soldering & Helping Hands',
    'Jewellery',
    'p07-12',
    'Ceramic clamps, helping hands, torch stands and soldering holders for bench setups.',
  ],
  [
    'tweezers',
    'Tweezers',
    'Workshop Essentials',
    'p05-10',
    'Plastic tweezers, assorted sizes and cell-testing tweezer models.',
  ],
  [
    'oiling-tools',
    'Oil Cups & Oil Pins',
    'Watchmaking',
    'p06-05',
    'Single oil cups, combined oiling sets and oil pins in the listed assortment sizes.',
  ],
  [
    'holders-stands',
    'Holders & Stands',
    'Workshop Essentials',
    'p04-04',
    'Movement and case holders, bur stands and tool stands to organise the working bench.',
  ],
  [
    'gauges-selectors',
    'Gauges & Selectors',
    'Workshop Essentials',
    'p05-05',
    'Ring and bangle gauges, battery selectors and side-bar sizing tools.',
  ],
  [
    'trays-storage',
    'Trays, Covers & Storage',
    'Workshop Essentials',
    'p04-01',
    'Dividing trays, dust covers and other small-part storage accessories.',
  ],
  [
    'compasses',
    'Compasses',
    'Workshop Essentials',
    'p19-03',
    'Round and hanging compass models photographed in the Roshan Industries catalogue.',
  ],
]
  .map(([id, name, family, image, description]) => ({ id, name, family, image, description }))
  .concat(pumpCategories);
// Assignments are reviewed against catalogue photos rather than guessed from keywords.
const E = 'eye-loupes',
  H = 'holders-stands',
  T = 'trays-storage',
  G = 'gauges-selectors',
  L = 'link-strap-tools',
  W = 'tweezers',
  O = 'oiling-tools',
  J = 'jewellery-tools',
  S = 'soldering-tools',
  C = 'clock-parts',
  K = 'clock-keys',
  A = 'case-openers',
  D = 'screwdrivers',
  F = 'glass-hand-tools',
  P = 'compasses';
const assignment = {
  2: Array(12).fill(E),
  3: [E, E, E, E, E, E, E, E, H, H, H, H],
  4: [T, T, T, H, E, H, H, L, G, G, G, G],
  5: [G, G, G, G, G, G, H, H, H, W, W, W],
  6: [W, W, W, O, O, O, O, O, O, O, O, O],
  7: [J, S, G, G, G, G, S, S, S, S, S, S],
  8: [S, S, S, L, L, L, L, L, L, L, L, T],
  9: [T, L, L, L, L, L, C, C, C, C, C, L],
  10: [C, C, L, L, C, C, C, C, C, C, J, T],
  11: [J, J, J, A, J, L, L, L, K, K, K, K],
  12: Array(12).fill(K),
  13: [K, K, K, A, A, A, A, A, A, A, H, H],
  14: [L, L, L, L, A, J, W, W, S, T, S, H],
  15: [D, D, D, D, D, D, D, D, D, D, D, H],
  16: [J, F, F, F, F, L, H, H, L, L, L, T],
  17: [C, C, C, H, T, C, J, G, H, L, G, L],
  18: [T, T, F, F],
  19: Array(4).fill(P),
};
/** Build product records from reviewed photo assignments, preserving permanent SKUs. */
export function loadCatalogue(root) {
  const confirmedNames = new Set(
    JSON.parse(fs.readFileSync(path.join(root, 'src/data/name-confirmations.json'), 'utf8'))
      .productIds,
  );
  const sourceFile = path.join(root, 'src/data/catalogue-source.json');
  let text = fs
    .readFileSync(sourceFile, 'utf8')
    .replaceAll('\u00e2\u20ac\u201d', '—')
    .replaceAll('\u00e2\u20ac\u201c', '–')
    .replaceAll('\u00c3\u2014', '×');
  // Avoid rewriting reviewed source when text repair made no changes.
  if (fs.readFileSync(sourceFile, 'utf8') !== text) fs.writeFileSync(sourceFile, text);
  const source = JSON.parse(text),
    mapFile = path.join(root, 'src/data/sku-map.json');
  const skus = fs.existsSync(mapFile) ? JSON.parse(fs.readFileSync(mapFile, 'utf8')) : {};
  // Allocate new identifiers only after the highest existing SKU. Never renumber.
  let next = Math.max(0, ...Object.values(skus).map((sku) => Number(sku.split('-')[1]))) + 1;
  // Each reviewed photo panel has its own listing, including the two different selectors.
  const products = [];
  for (const [pageText, names] of Object.entries(source)) {
    const page = Number(pageText);
    names.forEach((name, index) => {
      if (!name) return;
      const slot = index + 1,
        id = `p${String(page).padStart(2, '0')}-${String(slot).padStart(2, '0')}`;
      if (!skus[id]) skus[id] = `RIT-${String(next++).padStart(4, '0')}`;
      const category = categories.find((c) => c.id === assignment[page]?.[index]);
      if (!category) throw new Error(`Missing category for ${id}`);
      const nameConfirmed = confirmedNames.has(id);
      const unlabelled = !nameConfirmed && (page === 19 || (page === 17 && slot <= 2));
      products.push({
        id,
        sku: skus[id],
        name,
        category: category.name,
        categoryId: category.id,
        family: category.family,
        page,
        slot,
        image: `assets/products/${id}.webp`,
        url: `products/${skus[id].toLowerCase()}.html`,
        nameConfirmed,
        note: unlabelled
          ? 'This photograph has no caption in the printed catalogue. Please confirm the exact model and specifications with our team.'
          : 'Please contact our team to confirm available options, specifications, quantities and pricing.',
      });
    });
  }
  // Descriptions explain application; missing captions retain explicit confirmation notes.
  for (const product of products) product.description = describeProduct(product);
  for (const pump of pumpProducts) {
    if (skus[pump.id] && skus[pump.id] !== pump.sku) throw new Error('Pump SKU changed');
    skus[pump.id] = pump.sku;
  }
  const serialized = JSON.stringify(skus, null, 2) + '\n';
  if (!fs.existsSync(mapFile) || fs.readFileSync(mapFile, 'utf8') !== serialized)
    fs.writeFileSync(mapFile, serialized);
  return products.concat(pumpProducts);
}
