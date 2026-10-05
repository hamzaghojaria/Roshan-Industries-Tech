# Roshan Industries

Static company website with custom product manufacturing as its main message, 200 catalogue products, 15 category pages, About Us and Contact Us. It uses no backend and needs no production dependencies. Email enquiries open the visitor’s email application; the visitor attaches drawings and sends the message there.

## Open and build

The supplied checkout is already built: open `index.html` in a browser. After editing source, rebuild with Node.js 22 or newer:

```sh
npm run build
npm run check
```

These two commands need only Node.js, not `npm install`. For formatting and browser tests, first run `npm install`. Tests use Microsoft Edge; set `EDGE_PATH` to another compatible Chromium executable if necessary.

```sh
npm run test:content
npm run test:catalogue
npm run test:motion
npm run format
```

The workspace also retains a portable Node executable at `../.site-tools/node-ready/node-v22.14.0-win-x64/node.exe`. Example in PowerShell: `& '../.site-tools/node-ready/node-v22.14.0-win-x64/node.exe' scripts/build.mjs`.

## Directory map

```text
Roshan Industries Tech/          Workspace
├── README.md                    Workspace entry point
├── .gitignore                   Excludes portable tools and local caches
├── .site-tools/                 Local Node, Git and test/format dependencies
└── roshan-industries-tech/       Website project
    ├── src/                     Editable browser code and page generators
    │   ├── data/                Reviewed product names and permanent SKU map
    │   ├── templates.mjs        Shared layout and all page content
    │   ├── catalogue.mjs        Product loading and reviewed taxonomy
    │   ├── descriptions.mjs     Product-description rules
    │   ├── app.js               Browser interactions
    │   ├── styles.css           Base layouts and components
    │   └── modern.css           Shared theme, hover effects and custom sections
    ├── scripts/                 Build, verification, PDF and Excel utilities
    ├── tests/                   Browser regression checks
    ├── assets/                  Supplied logo, PDF and product photographs
    ├── reports/                 Preserved catalogue audit and coverage evidence
    ├── artifacts/               Disposable screenshots and extraction previews
    ├── categories/              Generated category pages
    ├── products/                Generated product pages
    ├── dist/                    Generated static hosting copy
    ├── *.html                   Generated root pages for local preview
    └── *.xlsx / *.zip           Local deliverables, excluded from Git
```

`src/` is the editable source. Generated root pages let you open the site without a server. `dist/` repeats those files for hosting and contains no source, tests, Excel workbooks or tooling. Generated output is ignored by Git and can be rebuilt; it is not an abandoned duplicate.

## Source and code files

| File                                   | Purpose and editing guidance                                                                                                                                                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/templates.mjs`                    | HTML escaping, product/category cards, breadcrumbs, shared header/footer, enquiry emails and generators for Home, Categories, Catalogue, Product, About and Contact. Edit website copy and email/contact details here. All relative links account for nested page depth. |
| `src/catalogue.mjs`                    | Fifteen category definitions, explicit page/slot assignments, source loading, permanent SKU allocation, missing-caption notes and generated product records. Categories are reviewed assignments, not keyword guesses.                                                   |
| `src/descriptions.mjs`                 | Category application guidance, specific tool exceptions and printed variant details. Descriptions avoid unsupported specifications, stock or pricing claims.                                                                                                             |
| `src/data/catalogue-source.json`       | Product names indexed by PDF page, then photo slot. Page 5 slots 3 and 4 are distinct slotted-centre and solid-centre selectors. Edit captions carefully and preserve order.                                                                                                                        |
| `src/data/sku-map.json`                | Permanent photo-ID-to-SKU mapping. Preserve this file: changing or deleting it can break existing identifiers and product URLs.                                                                                                                                          |
| `src/app.js`                           | Current footer year, sticky-header feedback, reduced-motion-aware scroll reveals, query matching, sorting, pagination, live result counts and mobile category navigation. Non-catalogue pages skip catalogue controls.                                                   |
| `src/styles.css`                       | Base typography, document reset, header, cards, catalogue layouts, product details and responsive breakpoints.                                                                                                                                                           |
| `src/modern.css`                       | White/charcoal/cobalt theme overrides, focus and hover feedback, responsive adjustments, custom-manufacturing sections and reduced-motion behaviour. Loaded after the base stylesheet.                                                                                   |
| `scripts/build.mjs`                    | Loads the source once; generates five root pages, 15 category pages, 200 product pages, browser data and SKU CSV; copies browser source to the preview root; creates `dist/`. Generated HTML names its source in a comment.                                              |
| `scripts/check.mjs`                    | Checks every local page/link/asset, stable and unique SKUs, taxonomy, descriptions, shared logo sources, custom enquiry sections and full company naming.                                                                                                                |
| `scripts/extract-catalogue.py`         | Renders product panels and the supplied logo from the original PDF, writes optimised WebP assets and a readable 20-page web PDF. Never modifies the original. Re-extract only when intentional: it replaces generated assets.                                            |
| `scripts/export-workbook.py`           | Re-renders and compares all 200 source panels; builds the category Excel workbook with 200 embedded photos, overview/master/audit sheets; records source and image hashes; reopens the workbook to verify it. Close the existing Excel workbook before replacing it.     |
| `tests/content-qa.cjs`                 | Custom CTA navigation, email contents and SKU context, FAQ interactions, changed-page layouts and 200% text.                                                                                                                                                             |
| `tests/multipage-qa.cjs`               | All category routes, SKU search, product navigation, sorting, pagination, empty states, mobile navigation and enlarged text.                                                                                                                                             |
| `tests/hover-qa.cjs`                   | Card lift, image zoom, category/button hover, search focus, sticky header, reduced motion and no-JavaScript visibility.                                                                                                                                                  |
| `package.json`                         | Project metadata, build/check/format/test commands and development-only dependencies.                                                                                                                                                                                    |
| `requirements.txt`                     | Optional Python packages for PDF extraction and Excel export. Not needed to view or build the website.                                                                                                                                                                   |
| `.prettierrc.json` / `.prettierignore` | Formatting conventions and exclusions for generated files/assets.                                                                                                                                                                                                        |
| `.gitignore`                           | Generated output, development dependencies, caches, Excel lock files, secrets and downloadable archives.                                                                                                                                                                 |
| `.openai/hosting.json`                 | Existing Sites project ID and the `dist/` hosting directory. This is configuration, not a credential.                                                                                                                                                                    |

## Generated pages and assets

| Path                                            | Contents                                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `index.html`                                    | Custom manufacturing homepage and catalogue discovery.                                                                   |
| `catalogue.html`                                | Searchable, sortable, paginated catalogue.                                                                               |
| `categories.html`                               | Category index grouped by trade.                                                                                         |
| `about.html`                                    | Company heritage, products and custom manufacturing approach.                                                            |
| `contact.html`                                  | Email/location details, custom project checklist and FAQs.                                                               |
| `categories/*.html`                             | One listing page per category.                                                                                           |
| `products/rit-*.html`                           | One product page per stable SKU, with description, photograph, source reference, enquiries and related items.            |
| `products.js`                                   | Browser-readable catalogue generated from source data.                                                                   |
| `app.js`, `styles.css`, `modern.css`            | Preview copies of browser source in `src/`.                                                                              |
| `product-skus.csv`                              | Spreadsheet-compatible generated product/SKU index.                                                                      |
| `assets/products/*.webp`                        | 200 extracted photo panels. `p05-04.webp` is deliberately retained for source audit although it has no separate listing. |
| `assets/roshan-logo.png`                        | Original supplied company mark used in both header and footer.                                                           |
| `assets/roshan-product-catalogue.pdf`           | Optimised complete 20-page PDF for website download.                                                                     |
| `reports/Catalogue-Audit.md`                    | Human-readable coverage findings and limitations.                                                                        |
| `reports/catalogue-audit/coverage.json`         | Original PDF SHA-256, panel/SKU mappings, image hashes and comparison results.                                           |
| `reports/catalogue-audit/photo-coverage.csv`    | Coverage mapping in spreadsheet-compatible form.                                                                         |
| `reports/catalogue-audit/page-*-comparison.jpg` | Original crop beside its website image for visual review.                                                                |
| `artifacts/qa/*.png`                            | Screenshots written by browser tests, ignored by Git.                                                                    |
| `Roshan-Industries-Product-Catalogue.xlsx`      | Category workbook deliverable, retained locally.                                                                         |
| `roshan-website.zip`                            | Static website download, refreshed from `dist/`.                                                                         |

## PDF and Excel utilities

Install Python requirements, then pass the source path explicitly:

```sh
python -m pip install -r requirements.txt
python scripts/extract-catalogue.py --pdf "C:/Users/Hamza/Downloads/20 page.pdf"
npm run build
npm run check
python scripts/export-workbook.py --pdf "C:/Users/Hamza/Downloads/20 page.pdf"
```

`uv run --with pillow --with pypdfium2 --with openpyxl python ...` is also supported. The default source is `Downloads/20 page.pdf` under the current user’s home. The original scan is external to the repository and is never deleted or edited.

## Product facts and branding

The 20-page scan has 200 product-photo panels and two covers. Page 5 panels 3 and 4 are distinct selectors (slotted centre and solid centre), giving 200 listings in 15 categories. A panel may depict a multi-piece set; it counts as one listing. Six photos lack captions: page 17 panels 1–2 and all four page 19 compasses. The company confirmed these six names and the page 18 tray/Hands names on 05 October 2026. Confirmation is recorded in `src/data/name-confirmations.json`; materials and specifications are not inferred. Other ambiguous captions are flagged in the workbook.

SKUs `RIT-0001`–`RIT-0200` are assigned website identifiers, not codes printed in the PDF. New products receive the next unused SKU; existing names can change without changing their SKUs. Source references such as `P02-01` retain PDF page/panel traceability.

Use **Roshan Industries** in visible company copy. Keep the supplied logo, technical asset filenames, existing SKU prefix and actual email address unchanged. Confirmed owner details: watch parts manufacturing, Mumbai, 100+ years of heritage, custom product manufacturing, `roshanindustriestech@gmail.com` and the linked Google listing. No certifications, street address, telephone, guaranteed tolerances, minimum quantities, prices or lead times are invented.

## Cleanup decisions

Removed redundant portable Node extraction, downloaded Node/Git ZIP archives, the superseded single-page QA test and outdated preview screenshots. Kept the functioning portable Node/Git binaries because this computer needs them for development and hosting, current regression tests, all product assets and audit evidence. Excel temporary lock files belong to the active Excel session and are ignored rather than forcibly removed.

Website publishing has not succeeded: the hosting service returned expired credentials. The local preview and static ZIP work independently of hosting.

## Banner links and anchor alignment

The homepage Watchmaker’s Bench image links to the Precision Screwdrivers category. The two smaller panels retain their labelled category links. `src/app.js` measures the actual sticky-header height and sets one CSS scroll offset; custom sections have no additional scroll margin. This prevents doubled spacing and corrects cross-page anchor landings after mobile navigation initialises.

`tests/anchor-qa.cjs` checks the banner’s category destination and both custom-manufacturing header links on mobile, tablet and desktop, including navigation from About Us. Run it with `npm run test:anchors`.

## Category families and optimisation

The Categories page highlights Watchmaking, Clockmaking, Jewellery and Workshop Essentials with quick section links, prominent headers and category/product totals. Totals are derived from source records; Watchmaking currently includes six categories.

All Products and every category listing also have a family selector. On All Products it filters existing cards and combines with search, sorting and pagination; the selected family is saved in the URL for reloads and shared links. On category pages, choosing another family opens its full range in All Products. Desktop sidebars and mobile category selectors group the fifteen categories under the same four families. Browser regressions in `tests/multipage-qa.cjs` verify family counts, search combinations, reloads and navigation between families.

`src/catalogue-index.mjs` builds and caches product lookups by photo ID, category and family without changing source records. Templates reuse this index for feature selection and counts. Browser search uses direct SKU lookups and precomputed normalised text instead of rescanning and normalising all records per keystroke. Only catalogue/category listing pages load `products.js`; other pages keep the shared navigation script without the full catalogue payload. Source data and SKU files are written only when they change. Code remains dependency-free at runtime and keeps explanatory comments around these responsibilities.

## Mobile navigation, location and updated workbook

`src/location.mjs` holds the owner-confirmed office address: C-20, 1st Singh Industrial Estate, Ram Mandir Road, Near Movie Star Cinema, Goregaon (W), Mumbai - 400 104. The embedded Google map and directions link use this complete address, and the Contact page displays it as well. Google Maps requires an internet connection.

`src/app.js` now adds a collapsible mobile menu with an expanded-state announcement, Escape-key support and keyboard focus return. Links stay visible without JavaScript. Interior pages use breadcrumb navigation with the current page marked for assistive technology. The homepage product montage has no rotation.

`tests/mobile-qa.cjs` checks menu open/close and Escape, breadcrumb navigation, banner alignment, footer columns, map attributes and navigation without JavaScript. Run it with `npm run test:mobile`. Screenshots are written to `artifacts/qa/`.

The Excel category sheets and master list now include every product’s current description and a custom-manufacturing enquiry note. The export validates names and descriptions against the same records used to build the website.

About Us uses a connected three-generation timeline: Ahmed Rashid Roshan (father), Imran Roshan (son), then Abdullah Roshan and Mohammed Roshan (grandsons). These are owner-supplied relationships; no executive titles, founder dates or biographies are inferred. Edit the timeline in `src/templates.mjs` and its responsive styling in `src/modern.css`. The centred footer includes company/email, Explore/catalogue download and the office map.
