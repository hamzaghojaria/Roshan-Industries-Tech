// Assemble local-preview-compatible assets without a browser module loader or extra dependencies.
import fs from 'node:fs';
import path from 'node:path';

export const browserFeatures = [
  'initSearch',
  'initPageNavigation',
  'initVisualEffects',
  'initSliders',
  'renderPages',
  'initArrivals',
  'initListingHistory',
  'initCatalogue',
];
export const themeComponents = [
  'theme',
  'navigation',
  'sliders',
  'manufacturing',
  'footer',
  'arrivals',
  'products',
  'company',
  'interactions',
];

/** Keep all feature state private and preserve the existing file:// preview workflow. */
export function buildBrowserScript(root) {
  const sources = browserFeatures.map((name) =>
    fs.readFileSync(path.join(root, 'src/browser', `${name}.js`), 'utf8'),
  );
  sources.push(fs.readFileSync(path.join(root, 'src/app.js'), 'utf8'));
  return `// Generated browser bundle. Edit src/browser/ or src/app.js and rebuild.\n(() => {\n'use strict';\n${sources.join('\n')}\n})();\n`;
}

/** Preserve cascade order; later mobile and accessibility rules must retain precedence. */
export function buildThemeStyles(root) {
  return themeComponents
    .map((name) => fs.readFileSync(path.join(root, 'src/styles', `${name}.css`), 'utf8'))
    .join('');
}

/** Send only fields used by browser search, filters, sorting and product suggestions. */
export function browserProducts(products) {
  const fields = ['id', 'sku', 'name', 'category', 'categoryId', 'family', 'url', 'image'];
  return products.map((product) => ({
    ...Object.fromEntries(fields.map((field) => [field, product[field]])),
    specifications: (product.specifications || []).map(({ value }) => ({ value })),
  }));
}

/** Assemble assets once so preview and deployment always use identical browser code. */
export function writeBrowserAssets(root, products) {
  const base = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
  const theme = buildThemeStyles(root);
  const assets = {
    'app.js': buildBrowserScript(root),
    'styles.css': base,
    'modern.css': theme,
    'site.css': `${base}\n${theme}`,
    'browser-products.js': `// Generated search records. Full export records are in products.js.\nwindow.ROSHAN_PRODUCTS = ${JSON.stringify(browserProducts(products))};\n`,
  };
  for (const [file, contents] of Object.entries(assets))
    fs.writeFileSync(path.join(root, file), contents);
}
