# Roshan Industries

Watch parts, tools and custom manufacturing in Mumbai, serving customers since 1900.

[Website](https://roshan-industries-tech.onrender.com/) | [GitHub](https://github.com/hamzaghojaria/Roshan-Industries-Tech) | [Email](mailto:roshanindustriestech@gmail.com)

The current website contains **311 products, 17 categories, five families and 95 New Arrivals**. The synchronized customer PDF has 61 pages; the workbook contains 19 sheets and 622 embedded photographs. These totals describe the current records, not permanent limits.

## Start locally

Use Node.js 22 or newer. From this project directory:

```powershell
npm install
npm run build
npm run check
npm run check:syntax
```

Open the generated index.html for a local preview. Rebuild after editing source. Hosting requires only the build command; Python and a browser are needed only for their respective maintenance checks.

This workspace also retains portable Node and test dependencies under ../.site-tools/. They are local tooling and are excluded from hosting and source archives.

## Project structure

| Location                                 | Responsibility                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| src/templates.mjs                        | Shared HTML, page content, navigation, breadcrumbs, footer and product cards                                  |
| src/app.js                               | Named initializers for search, navigation, effects, sliders, arrivals, listing history and catalogue controls |
| src/styles.css                           | Base document layout and responsive components                                                                |
| src/modern.css                           | Brand theme and ordered component/mobile refinements; loaded after styles.css                                 |
| src/catalogue.mjs                        | Load records, validate permanent SKUs and merge image/export metadata                                         |
| src/catalogue-index.mjs                  | Cached product/category/family lookups per catalogue array                                                    |
| src/descriptions.mjs                     | Descriptions for reviewed catalogue products                                                                  |
| src/location.mjs                         | Confirmed office address and map                                                                              |
| src/data/                                | Reviewed records, approved arrivals, image overrides, SKU and PDF-page mappings                               |
| assets/                                  | Published photos, logo and customer PDF                                                                       |
| scripts/                                 | Build, syntax checks, test runner, export and audit tools                                                     |
| tests/                                   | Browser and fresh-build regressions; helpers/browser.cjs owns browser setup                                   |
| docs/code-reference.md                   | Purpose of every maintained code file and data/configuration notes                                            |
| reports/high-resolution-audit/           | Export reports, image provenance and retained source audits                                                   |
| artifacts/                               | Ignored local screenshots and temporary test output                                                           |
| dist/                                    | Generated hosting output, recreated on every build                                                            |
| products/, categories/, root HTML/CSS/JS | Generated local-preview copies                                                                                |

**Edit src/ and assets/, then rebuild.** Generated pages carry a source-location comment. Root products.js stays readable for PDF/XLSX tools; dist/products.js contains identical records with compact JSON to reduce download size. CSS rules keep their existing order so mobile and accessibility overrides remain predictable.

JSON is strict data and cannot contain comments. Data and configuration responsibilities are documented in the code reference instead.

## Current interface behavior

- Every page shares the same header and footer. On mobile, the highlighted New Arrivals navigation label and its dot are left aligned.
- Breadcrumbs are left aligned on mobile, use subtle chevrons, and keep long product titles on a separate row. Category counts keep each number with its label when wrapping.
- Product images lift slightly on desktop hover and mobile interaction without changing size. There is no magnifier or image zoom dialog. Reduced-motion preferences disable the lift.
- The footer says Download Catalogue. Instagram links to the supplied company profile in a new tab; X has been removed.
- Header search supports thumbnails, SKUs, categories and keyboard navigation. Catalogue and arrivals listings use URL-backed filters and pagination, with 24 products per page.
- Returning from a product preserves listing position, filters and focus. Related products form a desktop grid and a manual mobile slider.
- Content and links remain usable without JavaScript. Enquiries are prepared in the visitor's email or WhatsApp app.

## Validation and maintenance

```powershell
npm run check:syntax
npm run format:check
npm run check
npm test
```

npm test runs all *-qa.cjs suites sequentially, prints each suite name, continues after failures and exits with a failing status if any suite fails. Build before running it. To rerun selected suites, use `npm test -- hover-qa.cjs mobile-qa.cjs`. It includes a temporary fresh-checkout build; screenshot capture and Excel COM automation remain manual tools.

Browser checks load the installed playwright-core dependency, with the retained workspace tooling as a fallback. Windows defaults to Microsoft Edge. Set BROWSER_PATH to an installed Chromium/Chrome/Edge executable on another system; EDGE_PATH is also accepted. On other operating systems, the Playwright default executable is used when no override is supplied.

```powershell
$env:BROWSER_PATH = 'C:/path/to/chrome.exe'
npm run test:mobile
```

| Command                | Checks                                                                       |
| ---------------------- | ---------------------------------------------------------------------------- |
| npm run test:build     | Fresh checkout, repeat build, stale generated route removal                  |
| npm run test:mobile    | Responsive layout, mobile menu and accessibility                             |
| npm run test:catalogue | Search, sorting and pagination                                               |
| npm run test:images    | Small image lift, no zoom, reduced motion and no-JavaScript image visibility |
| npm run test:search    | Header suggestions and keyboard behavior                                     |
| npm run test:history   | Listing return position and saved filters                                    |
| npm run test:cards     | Whole-card native link behavior                                              |
| npm run test:related   | Related-product mobile slider and desktop grid                               |
| npm run test:sliders   | Carousel controls, autoplay and reduced motion                               |
| npm run test:motion    | Hover feedback and reduced-motion behavior                                   |
| npm run check:python   | Parse Python scripts without running exporters                               |
| npm run check:source   | Detailed source/export provenance audit                                      |
| npm run format         | Format maintained JavaScript, CSS, JSON configuration and Markdown           |

Tests print PASS messages or assertion failures with a nonzero exit code. The website uses visible accessible status messages for results and pagination; maintenance logging belongs in scripts/tests rather than customer-facing copy.

## Catalogue records and exports

Keep permanent SKUs unchanged in src/data/sku-map.json. Reviewed PDF records and approved online products, including CNC and VMC machining enquiries, are merged by loadCatalogue(). Duplicate IDs, SKUs or names, unknown categories and changed permanent mappings fail the build. Image replacements belong in src/data/product-image-overrides.json. New badges follow src/data/new-arrivals.json.

The customer PDF is assets/roshan-industries-catalogue.pdf, approximately **10.1 MB** for the current 311 products (previously 96.4 MB). It uses the approved web profile: product photos up to 900 pixels on the longest edge, JPEG quality 85 and a lossless logo. Original website photographs and workbook images keep their original resolution. The synchronized workbook is Roshan-Industries-Product-Catalogue.xlsx.

Processed PDF images are cached in artifacts/catalogue-image-cache/. Unchanged photos reuse their encodings; a source-image, compression-setting or Pillow-version change creates a fresh cache entry. The cache is disposable and excluded from Git and delivery archives. A repeat export measured 3.29 seconds with all 270 image encodings reused; timing depends on the machine and changed content. The local pre-compression PDF is preserved at artifacts/catalogue-archive/roshan-catalogue-native-269-products.pdf. Normal styling changes only need npm run build; they do not need PDF or workbook regeneration.

To regenerate both exports after a catalogue change, use a working Python interpreter and install requirements.txt:

```powershell
python -m pip install -r requirements.txt
npm run build
python scripts/export-branded-catalogue.py
npm run build
python scripts/export-high-resolution-workbook.py
npm run build
npm run check
npm run check:source
python scripts/validate-synchronized-exports.py
```

Run `python tests/catalogue-image-cache-qa.py` to verify image cache reuse, invalidation and logo/photo settings. Export progress reports the PDF size, elapsed time and cache hits/misses.

Python scripts use UTF-8 input and are formatted with Black at 100 columns. Run `python scripts/check-python.py` for dependency-free syntax validation; `python -m black --line-length 100 scripts` formats them when Black is installed.

Close Excel before regenerating its workbook. The build reads the current XLSX and PDF; it does not regenerate them. Source-image extraction and inspection need ../reference-documents/roshan-high-resolution-source.pdf, which is outside the published website.

scripts/update-catalogue-introduction.py is a historical tool for the archived 228-product export, not the current 311-product export workflow. See the code reference before running tools that write records or export files.

## Publishing

The existing Render static site builds with npm run build and publishes dist/. With auto-deploy configured, pushing reviewed source changes triggers the hosting build. This cleanup does not publish or push changes.

For Hostinger, upload the contents of dist/ directly into public_html/ so index.html sits at its root. Update hardcoded Render-domain URLs before moving to another public domain. scripts/package-delivery.py can package the finished website and editable source after a successful build.

## Source control

Keep source, assets, scripts, tests, docs, configuration, the synchronized XLSX and useful audit reports. Ignore generated previews, dist, screenshots, dependencies, caches and secrets. Owner notes in pending task.txt are maintained separately.

Normal workflow: edit source -> format -> build -> check and test -> review -> commit and publish.
