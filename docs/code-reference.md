# Maintained code reference

This inventory covers editable code. Generated HTML/CSS/JS copies inherit source comments on rebuild. JSON data is documented here because JSON does not support comments.

## Source and maintenance scripts

| File                                       | Responsibility                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| src/app.js                                 | Browser feature initializers; DOM-only enhancement with a readable no-JavaScript fallback.                                     |
| src/catalogue-index.mjs                    | WeakMap-cached indexes by product ID, category and family; treat input arrays as immutable.                                    |
| src/catalogue.mjs                          | Load and validate records, preserve permanent SKUs and merge image/PDF metadata.                                               |
| src/descriptions.mjs                       | Generate grounded application descriptions without inventing specifications.                                                   |
| src/location.mjs                           | Owner-confirmed office address and exact Google Maps identifier.                                                               |
| src/modern.css                             | Brand theme, component refinements, mobile rules and reduced-motion overrides. Preserve cascade order.                         |
| src/styles.css                             | Base document, responsive layout, reusable components and footer placement.                                                    |
| src/templates.mjs                          | HTML generation, shared header/footer, product cards and page content; escape inserted text.                                   |
| scripts/build.mjs                          | Build local previews and dist; validates records, cleans only verified generated routes and compacts published catalogue JSON. |
| scripts/check-syntax.mjs                   | Parse every maintained JavaScript file without executing maintenance operations.                                               |
| scripts/check-python.py                    | Parse Python maintenance code without importing export dependencies or running exports.                                        |
| scripts/check.mjs                          | Check all generated routes, local links/assets, text, product totals and permanent SKU mapping.                                |
| scripts/export-branded-catalogue.py        | Write the current branded PDF, page mappings and audit; refresh pump image dimensions in source data.                          |
| scripts/export-high-resolution-workbook.py | Write the synchronized XLSX with styled category sheets and embedded product photos.                                           |
| scripts/extract-high-resolution.py         | Extract native PDF crops; writes product images, reviewed records and provenance reports.                                      |
| scripts/inspect-high-resolution.py         | Inspect original scans and workbook; writes contact sheets, PDF text and inspection reports.                                   |
| scripts/package-delivery.py                | Package existing dist and editable source into ZIP files without workspace tooling or secrets.                                 |
| scripts/preview-branded-catalogue.py       | Render selected current PDF pages as review images; does not change the catalogue.                                             |
| scripts/reviewed-high-resolution.mjs       | Retained source-review inventory and category codes for the original high-resolution migration.                                |
| scripts/test.mjs                           | Run all regression suites sequentially, report failures and return a failing exit status.                                      |
| scripts/update-catalogue-introduction.py   | Historical archived 228-product PDF cover/introduction updater; not the current export workflow.                               |
| scripts/validate-high-resolution.mjs       | Audit source coverage, native images, stable identifiers and exported metadata; writes audit reports.                          |
| scripts/validate-synchronized-exports.py   | Compare website records, PDF image pixels/page links and workbook rows/images; writes synchronization audit.                   |
| tests/anchor-qa.cjs                        | Check the hero category destination and both custom-manufacturing header anchors.                                              |
| tests/arrival-badges-qa.cjs                | Regression check: arrival badges. Run after rebuilding the website.                                                            |
| tests/arrival-pagination-qa.cjs            | Regression check: arrival pagination. Run after rebuilding the website.                                                        |
| tests/browsing-return-qa.cjs               | Regression check: browsing return. Run after rebuilding the website.                                                           |
| tests/capture-ui-review.cjs                | Capture local screenshots for manual review; excluded from the automated test suite.                                           |
| tests/catalogue-actions-qa.cjs             | Regression check: catalogue actions. Run after rebuilding the website.                                                         |
| tests/catalogue-enhancements-qa.cjs        | Regression check: catalogue enhancements. Run after rebuilding the website.                                                    |
| tests/content-qa.cjs                       | Browser regression checks: custom enquiries, descriptive content and responsive layouts.                                       |
| tests/final-arrivals-qa.cjs                | Regression check: final arrivals. Run after rebuilding the website.                                                            |
| tests/fresh-build-qa.cjs                   | Reproduce a hosting checkout without ignored, generated folders.                                                               |
| tests/high-resolution-qa.cjs               | Regression check: high resolution. Run after rebuilding the website.                                                           |
| tests/hover-qa.cjs                         | Browser regression checks: hover feedback, keyboard focus and reduced motion.                                                  |
| tests/mobile-qa.cjs                        | Regression checks for mobile menu, breadcrumbs, straight hero and footer/map layout.                                           |
| tests/multipage-qa.cjs                     | Browser regression checks: navigation, all categories, search and pagination.                                                  |
| tests/new-arrivals-qa.cjs                  | Regression check: new arrivals. Run after rebuilding the website.                                                              |
| tests/online-products-qa.cjs               | Check the approved ZIP/link inventory, synchronized exports and new product enquiry flows.                                     |
| tests/product-images-qa.cjs                | Check the small image lift, removed zoom, touch behavior and reduced-motion fallback.                                          |
| tests/related-slider-qa.cjs                | Regression check: related slider. Run after rebuilding the website.                                                            |
| tests/root-navigation-qa.cjs               | Serve the generated site locally to verify hosted home URLs and local-preview fallbacks.                                       |
| tests/search-suggestions-qa.cjs            | Regression check: search suggestions. Run after rebuilding the website.                                                        |
| tests/sliders-qa.cjs                       | Exercise real carousel movement, pause, reduced motion and mobile geometry.                                                    |
| tests/whole-card-qa.cjs                    | Regression check: whole card. Run after rebuilding the website.                                                                |
| tests/workbook-excel-qa.ps1                | Read-only Microsoft Excel COM verification of sheets, records and embedded photos; writes an audit report.                     |
| tests/helpers/browser.cjs                  | Shared Playwright dependency loading and BROWSER_PATH/EDGE_PATH selection.                                                     |

## Data and configuration

| File                                  | Responsibility                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| src/data/catalogue-pages.json         | SKU to customer-PDF page mapping, regenerated by the current PDF exporter.               |
| src/data/new-arrivals.json            | Selected arrival SKUs for shared badges and arrival listings.                            |
| src/data/online-products.json         | Approved linked/photo product records, supplied specifications and source references.    |
| src/data/product-image-overrides.json | Approved replacement photo metadata, dimensions, checksums and source URLs.              |
| src/data/pump-products.json           | Restored pump enquiry products with permanent SKUs and original photos.                  |
| src/data/reviewed-categories.json     | Category IDs, family assignment, labels and source references.                           |
| src/data/reviewed-products.json       | Reviewed native-PDF product inventory and source provenance.                             |
| src/data/sku-map.json                 | Permanent product ID to SKU mapping. Never renumber existing records.                    |
| package.json                          | Build, validation, regression, export and formatting commands; development dependencies. |
| requirements.txt                      | Python export/audit dependencies; not required by website hosting.                       |
| .prettierrc.json / .prettierignore    | Formatting style and exclusions for generated files, data and reports.                   |
| .gitignore                            | Generated files, dependencies, screenshots, archives and secret exclusions.              |

## Browser feature boundaries

src/app.js starts page-loader cleanup, then runs initSearch, initPageNavigation, initVisualEffects, initSliders, initArrivals, initListingHistory and initCatalogue. Each initializer owns its local state and checks its page-specific DOM before use. renderPages is shared between listing types. Catalogue setup returning early cannot skip other features.

## Messages and comments

File headers explain responsibility; function comments explain boundaries and constraints. Build/syntax/test commands print explicit progress and completion results. Assertions supply failing status for automation. Browser results use accessible status regions; avoid console chatter or implementation messages in the customer interface.

## Maintenance constraints

Keep CSS order: styles.css is the base and modern.css supplies later overrides. Keep generated local records readable because Python exporters parse products.js. Published dist/products.js is compact but semantically identical. Export/source-audit tools may write data and reports; normal website builds never re-export the PDF or workbook.

Python scripts are formatted at 100 columns. All nine scripts were parsed and their formatting was checked against unchanged syntax trees. Export regeneration is a separate catalogue maintenance operation.
