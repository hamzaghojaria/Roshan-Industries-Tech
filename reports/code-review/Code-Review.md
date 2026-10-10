# Code and folder review - 10 October 2026

Scope: maintained source, styles, maintenance scripts, regression code and project configuration. Generated root pages and dist copies are verified as outputs, not edited as source. Inventory: 91 code/style files (9 .js, 25 .mjs, 11 .css, 17 .py, 28 .cjs, 1 .ps1).

## Changes

- Animation mutation observers schedule work inside changed listing grids instead of scanning the entire document.
- Catalogue input hashing reuses unchanged file digests within each invocation. Size, modification and change timestamps invalidate the in-memory cache.
- PDF and workbook fingerprints now include category definitions and shared input code; catalogue updates no longer depend on the present product total.
- Workbook preview preparation encodes distinct source images once and creates its output folder when missing.
- Workbook preparation and finalization have import-safe main entry points. Finalization logs actual product/category/photo totals.
- The obsolete workbook branding command delegates to the maintained synchronized exporter, preventing a return to retired internal columns.
- Generated founder/office routes and Artifact Tool inspection files are excluded from source control. Source packaging includes CLAUDE.md.
- Updated stale banner/download expectations and separated product photos from the overview logo in the manual Excel audit.
- Corrected isolated exporter tests to use the current authoring stages and absolute child-process dependency paths.
- Updated README.md, CLAUDE.md and docs/code-reference.md; included CLAUDE.md in formatter commands.

## Folder findings

The existing source/assets/scripts/tests/docs/reports layout is appropriate. dist and local preview routes are disposable build output; artifacts contains ignored caches and review material. Original images and archived catalogue references are retained for provenance. No source-photo deletion, framework replacement or dependency addition is needed for these changes. The published dist build was approximately 75.5 MiB during this review; ignored artifacts are local and are not hosted.

## Verification

- Website build and 339-page route/asset check passed.
- JavaScript syntax (62 files), Python syntax (17 files) and maintained Prettier formatting passed.
- Import-safety checks and isolated PDF/XLSX generation passed: all 311 products, 65 PDF pages and 622 workbook product photos retained.
- Targeted banner, mobile downloads and shared-animation browser suites passed.
- All 26 browser/build regression suites passed after updating and rerunning four obsolete expectations (banner destination, removed Excel button, category total and uniform product detail rows). The initial full run passed 22/26; targeted reruns passed all four corrected suites.
- Three image-cache tests and the image-proportions regression passed. Git whitespace checks passed. The manual Microsoft Excel COM audit was updated but was not executed.

## Maintained file inventory

- scripts/brand-workbook.mjs
- scripts/browser-build.mjs
- scripts/build.mjs
- scripts/catalogue_images.py
- scripts/check-python.py
- scripts/check-syntax.mjs
- scripts/check.mjs
- scripts/export-branded-catalogue.py
- scripts/export-catalogue-workbook.mjs
- scripts/export-high-resolution-workbook.py
- scripts/export_data.py
- scripts/extract-high-resolution.py
- scripts/finish-catalogue-workbook.py
- scripts/inspect-high-resolution.py
- scripts/package-delivery.py
- scripts/prepare-workbook-previews.py
- scripts/preview-branded-catalogue.py
- scripts/reviewed-high-resolution.mjs
- scripts/test.mjs
- scripts/update-catalogue-introduction.py
- scripts/update-catalogues.mjs
- scripts/validate-high-resolution.mjs
- scripts/validate-synchronized-exports.py
- scripts/workbook_images.py
- src/app.js
- src/browser/initArrivals.js
- src/browser/initCatalogue.js
- src/browser/initListingHistory.js
- src/browser/initPageNavigation.js
- src/browser/initSearch.js
- src/browser/initSliders.js
- src/browser/initVisualEffects.js
- src/browser/renderPages.js
- src/catalogue-index.mjs
- src/catalogue.mjs
- src/descriptions.mjs
- src/location.mjs
- src/styles.css
- src/styles/arrivals.css
- src/styles/company.css
- src/styles/footer.css
- src/styles/interactions.css
- src/styles/manufacturing.css
- src/styles/motion.css
- src/styles/navigation.css
- src/styles/products.css
- src/styles/sliders.css
- src/styles/theme.css
- src/templates.mjs
- src/templates/aboutPage.mjs
- src/templates/cataloguePage.mjs
- src/templates/categoriesPage.mjs
- src/templates/contactPage.mjs
- src/templates/founderPage.mjs
- src/templates/home.mjs
- src/templates/newArrivalsPage.mjs
- src/templates/officesPage.mjs
- src/templates/productPage.mjs
- src/templates/shared.mjs
- tests/anchor-qa.cjs
- tests/arrival-badges-qa.cjs
- tests/arrival-pagination-qa.cjs
- tests/brand-interactions-qa.cjs
- tests/browsing-return-qa.cjs
- tests/capture-ui-review.cjs
- tests/catalogue-actions-qa.cjs
- tests/catalogue-enhancements-qa.cjs
- tests/catalogue-image-cache-qa.py
- tests/catalogue-image-proportions-qa.py
- tests/content-qa.cjs
- tests/downloads-mobile-qa.cjs
- tests/export-entrypoints-qa.py
- tests/final-arrivals-qa.cjs
- tests/fresh-build-qa.cjs
- tests/helpers/browser.cjs
- tests/high-resolution-qa.cjs
- tests/hover-qa.cjs
- tests/mobile-qa.cjs
- tests/multipage-qa.cjs
- tests/new-arrivals-qa.cjs
- tests/online-products-qa.cjs
- tests/process-motion-qa.cjs
- tests/product-images-qa.cjs
- tests/product-photo-framing-qa.cjs
- tests/related-slider-qa.cjs
- tests/root-navigation-qa.cjs
- tests/search-suggestions-qa.cjs
- tests/shared-motion-qa.cjs
- tests/sliders-qa.cjs
- tests/whole-card-qa.cjs
- tests/workbook-excel-qa.ps1
