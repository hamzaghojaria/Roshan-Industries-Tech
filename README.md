# Roshan Industries

Watch parts, tools and custom manufacturing in Mumbai. **Since 1900 · 125+ years of service.**

[View website](https://roshan-industries-tech.onrender.com/) · [GitHub repository](https://github.com/hamzaghojaria/Roshan-Industries-Tech) · [Email us](mailto:roshanindustriestech@gmail.com)

**264 products · 21 categories · 5 families**. The website includes 216 reviewed PDF products, 12 restored pump listings and 36 approved October New Arrivals. The PDF and XLSX retain 228 products until the user requests the product export update. The PDF cover and dedicated introduction were refreshed separately; it now has 53 pages.

[Start locally](#start-locally) · [What to edit](#what-to-edit) · [Render](#publish-on-render) · [Hostinger](#publish-on-hostinger) · [PDF and Excel](#pdf-and-excel)

## How it works

```text
Edit src/ and assets/
         |
         v
npm run build
         |
         v
dist/ = finished website
         |
         v
Render publishes dist/ OR you upload its contents to Hostinger
```

**You edit the source. The build creates the finished pages.** `dist` means distribution: the files ready to publish. It is recreated automatically and does not need to be committed to GitHub.

## Start locally

Open a terminal inside `roshan-industries-tech`. Use Node.js 22 or newer.

```powershell
npm install
npm run build
npm run check
```

Open the generated `index.html` in your browser to preview the website. After changing source files, run the build again and refresh the browser.

## Latest catalogue presentation

The cover has a logo centered vertically and horizontally. Page 2 introduces the business and enquiry process; the clickable category index is on pages 3 and 4. All 228 previously exported product pages and photographs are preserved. Website page links have been adjusted; Excel and the New Arrival product export remain deferred. `scripts/update-catalogue-introduction.py` reproduces this presentation update from the archived prior catalogue.

Five further designs were added from eight unique links with repeated product references consolidated. Their SKUs are RIT-0260 through RIT-0264. The full New Arrivals selection now contains 36 products.

## October New Arrivals

`src/data/online-products.json` holds the approved linked acrylic stand and 30 distinct ZIP products. One repeated ZIP image was excluded. `src/data/new-arrivals.json` controls the shared blue New badges across listings and detail pages. New products have stable SKUs RIT-0229 through RIT-0259. They have no PDF page link until exported. Supplied dimensions are recorded separately from generated descriptions. Seven images were cleaned using the built in imagegen tool; original references and edits are tracked in the source data.

## What to edit

| Change                                    | File or folder                                                                                                                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page content, layouts, header and footer  | [src/templates.mjs](src/templates.mjs)                                                                                                                                             |
| Colours, spacing and mobile appearance    | [src/styles.css](src/styles.css), [src/modern.css](src/modern.css)                                                                                                                 |
| Sliders, search, filters and mobile menu  | [src/app.js](src/app.js)                                                                                                                                                           |
| Reviewed PDF products and categories      | [src/catalogue.mjs](src/catalogue.mjs), [src/data/reviewed-products.json](src/data/reviewed-products.json), [src/data/reviewed-categories.json](src/data/reviewed-categories.json) |
| Product descriptions                      | [src/descriptions.mjs](src/descriptions.mjs)                                                                                                                                       |
| Office address and map                    | [src/location.mjs](src/location.mjs)                                                                                                                                               |
| Photos, logo and current downloadable PDF | [assets/](assets/)                                                                                                                                                                 |

**Keep existing SKUs unchanged.** The permanent mapping lives in [src/data/sku-map.json](src/data/sku-map.json).

The footer stays at the bottom of short pages on mobile and desktop. On long pages it follows the content naturally. This layout is defined in `src/styles.css`; the footer does not cover page content while scrolling.

<details>
<summary><strong>Click to explore the folders</strong></summary>

| Folder                     | Purpose                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `src/`                     | Editable website code and templates                            |
| `src/data/`                | Original catalogue records, approved names and permanent SKUs  |
| `assets/`                  | Logo, product photos, pump photos and the current customer PDF |
| `scripts/`                 | Build, validation, image extraction and catalogue export tools |
| `tests/`                   | Browser checks for mobile layout and website behaviour         |
| `reports/`                 | Catalogue verification records and PDF page mappings           |
| `artifacts/`               | Local screenshots and review files; ignored by Git             |
| `dist/`                    | Generated website ready for hosting; ignored by Git            |
| `products/`, `categories/` | Generated HTML for local previews; ignored by Git              |
| `.openai/`                 | Existing project metadata; not used by the Render build        |

Root HTML, CSS, JavaScript and CSV files are also generated local-preview copies. Make lasting changes in `src/` or `assets/`.

</details>

<details>
<summary><strong>Click to explore supporting code files</strong></summary>

| File                                         | Purpose                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `src/catalogue-index.mjs`                    | Fast lookups by product, category and family                            |
| `src/data/reviewed-products.json`            | Current PDF product records with page, panel, crop and image dimensions |
| `src/data/new-arrivals.json`                 | Current arrivals and shared New badges                                  |
| `scripts/build.mjs`                          | Generates pages and recreates `dist/`                                   |
| `scripts/check.mjs`                          | Checks links, images, product counts and SKU stability                  |
| `scripts/extract-high-resolution.py`         | Native scan extraction and image provenance                             |
| `scripts/export-high-resolution-workbook.py` | Styled, synchronized Excel database                                     |
| `scripts/validate-high-resolution.mjs`       | Complete source, product, image, download and XLSX audit                |
| `package.json`                               | Build, check, test and formatting commands                              |
| `requirements.txt`                           | Python dependencies for catalogue tools                                 |
| `.gitignore`                                 | Keeps generated files, exports and secrets out of GitHub                |
| `.prettierrc.json`, `.prettierignore`        | Source formatting settings                                              |
| `pending task.txt`                           | Owner-maintained ideas and notes                                        |

Browser checks in `tests/`: `mobile-qa.cjs` checks responsive pages; `anchor-qa.cjs` checks section links; `content-qa.cjs` checks enquiries and content; `hover-qa.cjs` checks effects; `multipage-qa.cjs` checks catalogue navigation and filters; `root-navigation-qa.cjs` checks home URLs; `sliders-qa.cjs` checks autoplay and controls.

Tests currently use Microsoft Edge on Windows. Source code includes responsibility comments. JSON files contain data and cannot include comments.

</details>

## Publish on Render

| Setting           | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| Service type      | Static Site                                               |
| Branch            | `main`                                                    |
| Root directory    | Leave empty when `package.json` is at the repository root |
| Build command     | `npm run build`                                           |
| Publish directory | `dist`                                                    |

Render downloads your GitHub source, runs the build and serves `dist/`. With auto-deploy enabled, pushing changes updates the website.

```powershell
git add .
git commit -m "Update website"
git push origin main
```

Render does not generate PDF or Excel files. Commit the updated website PDF in `assets/` and its page mapping in `reports/` when updating the catalogue.

## Publish on Hostinger

Create a **Custom PHP/HTML website**, open File Manager and upload the **contents of `dist/`** into `public_html/`.

```text
public_html/
├── index.html
├── assets/
├── products/
├── categories/
└── ...other files from dist/
```

You can also extract `roshan-website.zip` there. `index.html` must sit directly inside `public_html/`. After source changes, rebuild and upload the updated files. Update the existing Render-domain URLs before moving to your final domain.

## PDF and Excel

- **Website catalogue:** [assets/roshan-industries-catalogue.pdf](assets/roshan-industries-catalogue.pdf), a 59-page branded catalogue with a centered cover logo, refreshed introduction, high resolution product images, a clickable category index, website headers and footers, and restored pump listings.
- **Product database:** [Roshan-Industries-Product-Catalogue.xlsx](Roshan-Industries-Product-Catalogue.xlsx), tracked so website builds include the synchronized database.
- **Audit:** [reports/high-resolution-audit/](reports/high-resolution-audit/) contains the page review, before and after inventory, native crop provenance and validation results.

The website, branded catalogue and workbook contain 268 products in 21 categories and five families, including 40 selected New Arrivals. All 200 previous photographed products retain their SKUs; 16 new source PDF entries and 40 online arrivals were added. The 12 pump enquiry entries retain their original SKUs, images and enquiry descriptions. Historical records and exporter scripts are archived in the workspace reference documents, outside the published website.

Excel contains an Overview, All Products and 21 category sheets. Family names appear on the overview, every category header and each product row. Category tabs share a color by family. It includes fresh descriptions, branded catalogue page links, source panel references, image dimensions, checksums, and 536 embedded PNG previews. Image and product links are relative to the website folder; keep the workbook with the website files when using them locally.

For future content changes:

```powershell
python -m pip install -r requirements.txt
npm run build
python scripts/export-branded-catalogue.py
npm run build
python scripts/export-high-resolution-workbook.py
npm run build
npm run check
node scripts/validate-high-resolution.mjs
python scripts/validate-synchronized-exports.py
```

Close Excel before regenerating the workbook. `src/data/reviewed-products.json` and `src/data/reviewed-categories.json` hold the reviewed records. Product descriptions come from `src/descriptions.mjs`. `src/data/new-arrivals.json` controls the shared New badges.

`extract-high-resolution.py` reproduces the native product crops from `../reference-documents/roshan-high-resolution-source.pdf`. It removes red page-frame fragments from crop corners without resampling the product images. The original supplied PDF remains unchanged.

## What belongs in GitHub?

**Keep:** `src/`, `assets/`, `scripts/`, `tests/`, the synchronized XLSX, useful verification reports and configuration files.

**Ignore:** `dist/`, generated preview files, historical PDF and ZIP exports, screenshots, dependencies, caches and secrets. Old reference PDFs remain outside the repository.

Your normal workflow: **edit source → build and check → commit and push → Render deploys.**

To refresh the branded exports, build the website, run `python scripts/export-branded-catalogue.py`, rebuild to refresh catalogue page links, run `python scripts/export-high-resolution-workbook.py`, then rebuild and validate. The original supplied PDF remains unchanged in the workspace reference documents.

Photograph replacements are stored in `src/data/product-image-overrides.json`, with source URLs, natural image dimensions and checksums. The current loupe photos and replacement scissors stand image are included in the PDF and XLSX. Run `python scripts/validate-synchronized-exports.py` to compare every PDF image and workbook row/photo with the website.

All Products and category pages include a New Arrivals filter beside sorting, with search and pagination support. A shared page loader appears during page navigation on phone and desktop, respects reduced motion and remains hidden without JavaScript. Every product page has an Explore in catalogue link to its correct PDF page.

New Arrivals uses its original card layout with category filters and pagination of 24 products per page. All Products retains the highlighted New Arrivals first sorting option without the separate Show selector.

Listing history entries preserve scroll position and the selected product; pagination, search, sorting and category selection remain in the URL when visitors return or reload.

Workbook tables provide their own filter dropdowns; overlapping worksheet filters are omitted for desktop Excel compatibility. The workbook was verified by normal read-only opening in Microsoft Excel, with all 268 products and 536 embedded photos retained.

Header search offers product thumbnails, names, SKUs and categories, category links and full search results, with keyboard navigation and mobile support. The full-width mobile product enquiry bar has been removed.

Product photographs open in an accessible image dialog with zoom controls, reset, drag to pan, mobile pinch zoom and Escape to close. Product additionalImages entries are supported as additional photographs; navigation controls appear only when multiple photographs are supplied. Without JavaScript the image opens directly.

Product detail photographs magnify under a desktop hover pointer, following the cursor and resetting on exit. Touch devices use the tap-to-enlarge viewer. The Show selector is omitted from both All Products and category pages.

In the same category uses a manual horizontal product slider on mobile, with swipe/native scrolling, a thin scrollbar and arrow controls. Desktop related products retain their grid layout.
