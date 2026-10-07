// The reviewed high resolution PDF inventory is the product source of truth.
import fs from 'node:fs';
import path from 'node:path';
import { describeProduct } from './descriptions.mjs';
export const categories = JSON.parse(
  fs.readFileSync(new URL('./data/reviewed-categories.json', import.meta.url), 'utf8'),
);
export function loadCatalogue(root) {
  const records = [
    ...JSON.parse(fs.readFileSync(path.join(root, 'src/data/reviewed-products.json'), 'utf8')),
    ...JSON.parse(fs.readFileSync(path.join(root, 'src/data/pump-products.json'), 'utf8')),
  ];
  const cataloguePages = JSON.parse(
    fs.readFileSync(path.join(root, 'src/data/catalogue-pages.json'), 'utf8'),
  );
  const permanentSkus = JSON.parse(
    fs.readFileSync(path.join(root, 'src/data/sku-map.json'), 'utf8'),
  );
  const ids = new Set(),
    skus = new Set(),
    names = new Set();
  return records.map((record) => {
    if (ids.has(record.id) || skus.has(record.sku) || names.has(record.name))
      throw new Error('Duplicate reviewed product ' + record.sku);
    ids.add(record.id);
    skus.add(record.sku);
    names.add(record.name);
    if (permanentSkus[record.id] !== record.sku)
      throw new Error('Permanent SKU changed ' + record.id);
    if (!categories.some((c) => c.id === record.categoryId))
      throw new Error('Unknown category ' + record.categoryId);
    if (!/^[A-Za-z0-9 .-]+$/.test(record.name)) throw new Error('Unclean title ' + record.name);
    const { previousName, previousCategory, ...current } = record;
    return {
      ...current,
      cataloguePage: cataloguePages[record.sku],
      description: record.onlineRange ? record.description : describeProduct(record),
    };
  });
}
