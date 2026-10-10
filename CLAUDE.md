# Project maintenance

Roshan Industries is a static catalogue website. Work in this repository; the parent .site-tools folder is local tooling. Changes remain local unless publication is explicitly requested.

## Editable sources and generated files

- Edit src/templates/ for pages, src/browser/ for behavior and src/styles/ for component styling. src/templates.mjs is the public template interface.
- Keep stylesheet order in scripts/browser-build.mjs. motion.css runs after interactions.css; respect reduced-motion preferences and keep content visible without JavaScript.
- Edit product records in src/data/. Preserve existing IDs and permanent SKUs in sku-map.json. Reviewed descriptions and image overrides must match the actual photographed product.
- Keep original assets and source provenance. Image overrides reference approved replacements; do not delete originals merely because they are currently unused.
- Root HTML/CSS/JS, products/, categories/ and dist/ are generated. Build from source instead of patching generated pages. dist/ is recreated on each build.
- artifacts/ contains disposable caches, screenshots and review outputs. reports/ contains useful audit evidence. Do not move source data into either folder.

## Commands and verification

Use Node.js 22 or newer. Run npm run build, npm run check and npm run check:syntax after code changes. Run relevant browser regressions; npm test runs every *-qa.cjs suite and continues after failures. For shared changes, run the full suite. npm run check:python parses Python without running exports. npm run format includes this file.

Browser tests use Playwright and installed Edge on Windows; BROWSER_PATH selects another Chromium executable. Portable workspace tooling can be used when executables are absent from PATH.

## Catalogue workflow

Run npm run update:catalogues after changing catalogue records, category definitions, images or export layout. Website-only styling changes need npm run build. The updater fingerprints inputs and outputs and reuses unchanged PDF/XLSX files. Do not hardcode the current product total as an export limit.

PDF authoring uses PyMuPDF and Pillow. Workbook authoring uses Codex Artifact Tool; openpyxl is used for read-only verification. Install requirements.txt for Python dependencies. CATALOGUE_PYTHON selects the interpreter. The Artifact Tool loader currently expects the bundled Codex runtime under the current user's home directory.

The customer workbook has seven columns: SKU, Product, Description, Category, Photo, Product Page and Catalogue Reference. Keep public product/PDF hyperlinks, category sheets, embedded photos and print settings synchronized. Internal fingerprints belong in reports/catalogue-export-state.json.

The approved PDF image profile is a 900-pixel longest edge at JPEG quality 85; workbook thumbnails use 240 by 210 pixels at quality 85. Retain source image proportions. PDF image caches are disposable and keyed by source content, settings and Pillow version.

scripts/prepare-workbook-previews.py and scripts/finish-catalogue-workbook.py execute through main(); importing them must not write files. brand-workbook.mjs and export-high-resolution-workbook.py are compatibility commands for the current updater. update-catalogue-introduction.py is historical and must not be used on the current customer PDF.

## Delivery

Render builds with npm run build and serves dist/. scripts/package-delivery.py packages the built site and editable source, including README.md and CLAUDE.md. Preserve pending task.txt as owner notes. Do not commit secrets, dependency directories, caches or temporary archives.
