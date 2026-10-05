// Cache one lookup index per catalogue array. Source records stay unchanged.
const indexes = new WeakMap();
export function indexCatalogue(products) {
  if (indexes.has(products)) return indexes.get(products);
  const index = { byId: new Map(), byCategory: new Map(), byFamily: new Map() };
  for (const product of products) {
    index.byId.set(product.id, product);
    for (const [map, key] of [
      [index.byCategory, product.categoryId],
      [index.byFamily, product.family],
    ]) {
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(product);
    }
  }
  indexes.set(products, index);
  return index;
}
