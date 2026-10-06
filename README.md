# Roshan Industries website

Static website for Roshan Industries, watch parts and custom manufacturing in Mumbai. The verified printed catalogue contains **200 products, 15 categories and four families**. The website also includes **12 pump enquiry entries in six additional categories** (212 entries, 21 categories and five families in total). The brand is **Since 1900**, with **125+ years of service**. About Us presents four generations, starting with Vali Mohammed Roshan.

## Build and deploy

Use Node.js 22 or newer. There are no production package dependencies.

```powershell
npm install
npm run build
npm run check
```

Render settings:

| Setting           | Value         |
| ----------------- | ------------- |
| Service           | Static Site   |
| Branch            | main          |
| Root directory    | Empty         |
| Build command     | npm run build |
| Publish directory | dist          |

Push source changes to GitHub to trigger Render deployment. The generated `dist` directory is ignored by Git and rebuilt on Render. Home links use the directory root, so hosted navigation shows `/` instead of `/index.html`. Opening `/index.html` directly also cleans the address in JavaScript, preserving its query and anchor. Local `file:` previews keep the actual filename to remain usable.

## Folder guide

| Folder                  | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| src                     | Editable templates, browser logic and styles.                                            |
| src/data                | Reviewed names, stable SKU map, name confirmations and the supplied premium PDF.         |
| scripts                 | Website build/check, original PDF extraction, premium PDF verification and Excel export. |
| tests                   | Browser regression checks with Playwright and Microsoft Edge.                            |
| assets                  | Logo, all 200 product images, original scan reference and current customer PDF.          |
| reports                 | Original image audit and premium catalogue/page/link verification records.               |
| reports/catalogue-audit | Per-panel source references, image hashes and visual comparisons.                        |
| artifacts/qa            | Disposable screenshots produced by browser checks; ignored by Git.                       |
| categories and products | Generated HTML for 21 categories and 212 entries; do not edit.                           |
| dist                    | Disposable deployment output; safely recreated on every build.                           |
| .openai                 | Existing Sites project metadata; Render deployment uses the settings above.              |

The parent `.site-tools` folder contains portable Node/Git and local QA dependencies. It is required by this workstation and is excluded from Git. Keep it if Node/Git are not installed globally.

## Source file guide

| File                                         | Responsibility                                                                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src/templates.mjs                            | Shared header/footer, home and company pages, catalogue/category listings, product pages, breadcrumbs, email/WhatsApp links and verified PDF-page links.              |
| src/catalogue.mjs                            | Fifteen category definitions, reviewed photo assignments, product records and permanent SKU allocation.                                                               |
| src/catalogue-index.mjs                      | Cached lookups by image ID, category and family; avoids repeated catalogue scans.                                                                                     |
| src/descriptions.mjs                         | Product descriptions using reviewed names and category applications without inventing specifications.                                                                 |
| src/location.mjs                             | Owner-confirmed address and exact Google Maps business CID.                                                                                                           |
| src/app.js                                   | Mobile menu, measured anchor offsets, local/home URL handling, sticky header, reveal/spotlight effects, floating WhatsApp visibility, search, sorting and pagination. |
| src/styles.css                               | Base typography, layout, components and responsive breakpoints.                                                                                                       |
| src/modern.css                               | Current theme, responsive refinements, timeline, footer and accessible interaction effects.                                                                           |
| src/data/catalogue-source.json               | Product names indexed by original PDF page/panel. Both page-5 selectors are separate products.                                                                        |
| src/data/sku-map.json                        | Permanent image-to-SKU mapping; never renumber existing entries.                                                                                                      |
| src/data/name-confirmations.json             | Company-approved names; approval does not assert dimensions or materials.                                                                                             |
| scripts/build.mjs                            | Generate 220 HTML pages, browser catalogue data, SKU CSV and a fresh dist.                                                                                            |
| scripts/check.mjs                            | Validate links/assets, 212 unique SKUs, clean product names, routes, branding and data stability.                                                                     |
| scripts/extract-catalogue.py                 | Extract original scan images/logo and web reference PDF; never alters the supplied scan.                                                                              |
| scripts/prepare-premium-pdf.py               | Compare 200 names/SKUs/categories/images, repair premium PDF heritage, clickable family/category index, return links and bookmarks; record the verified page map.     |
| scripts/export-pdf.py                        | Small compatibility entry point that delegates to the approved premium exporter.                                                                                      |
| scripts/export-workbook.py                   | Export category/master/audit sheets, embedded photos, website links and premium-PDF page links; reopen and verify the workbook.                                       |
| tests/mobile-qa.cjs                          | All generated routes at 320/390/760px, overflow, breadcrumbs, mobile menu, footer/map, timeline and no-JavaScript navigation.                                         |
| tests/anchor-qa.cjs                          | Homepage category destination and custom-manufacturing anchors on mobile/tablet/desktop.                                                                              |
| tests/content-qa.cjs                         | Enquiry links, SKU context, FAQ behavior, responsive layout and text enlargement.                                                                                     |
| tests/hover-qa.cjs                           | Hover/focus feedback, sticky header, reduced motion and readable no-JavaScript fallbacks.                                                                             |
| tests/multipage-qa.cjs                       | Category navigation, search, sorting, empty states, family URL subsets and compact pagination.                                                                        |
| tests/root-navigation-qa.cjs                 | Hosted root navigation and index.html cleanup with preserved query/hash.                                                                                              |
| package.json                                 | Node development dependencies and build/check/test/format commands.                                                                                                   |
| requirements.txt                             | Python dependencies for catalogue extraction, verification and export.                                                                                                |
| .gitignore                                   | Exclude generated pages, dist, exports, caches and local secrets.                                                                                                     |
| .prettierrc.json and .prettierignore         | Consistent source formatting without changing generated/data artifacts.                                                                                               |
| pending task.txt                             | Owner-maintained ideas/backlog; preserved as notes, not implemented automatically.                                                                                    |

Every executable source file has responsibility/section comments. Generated HTML/data also identify their source. JSON data files stay valid JSON and cannot contain comments; their role is documented here.

## Generated files and exports

Root HTML/CSS/JS files are disposable local-preview copies. Edit `src`, then rebuild. `products.js` loads only on catalogue listing pages. Product cards reference the matching image/SKU and verified premium-PDF page.

- `Roshan-Industries-Catalogue-Premium-Verified.pdf`: Current 48-page customer catalogue.
- `assets/roshan-updated-product-catalogue.pdf`: Same verified PDF served by website downloads.
- `Roshan-Industries-Product-Catalogue.xlsx`: Customer workbook with Overview, All Products and 21 category sheets. Includes 212 embedded category photos and correct PDF-page hyperlinks. Audit and pump-source sheets are excluded.
- `roshan-website.zip`: Contents of dist, ready for a static host.
- `Roshan-Industries-Source.zip`: Editable source, scripts, tests, assets and reports.
- `reports/premium-catalogue-audit.json`: Source/output hashes, all SKU-page mappings, image comparison scores and verified internal links.

Identical legacy PDF/Updated.xlsx exports and old QA screenshots were removed. If Excel locks the canonical workbook, export-workbook.py writes an Updated.xlsx instead; close Excel before replacing the canonical file.

## Catalogue maintenance

Keep source photo order and stable SKUs. RIT-0039 is the slotted-centre selector, and RIT-0200 is the solid-centre selector. All 200 original photo panels now have separate listings. Multi-piece sets remain one listing per panel.

Families: Watchmaking 86 products / 6 categories; Clockmaking 36 / 2; Jewellery 21 / 2; Workshop Essentials 57 / 5. Catalogue listings keep category navigation, search and sorting. The removed family dropdown stays removed, while existing family query URLs still filter correctly. Pagination shows at most three numbers, ellipses and Previous/Next.

Install Python dependencies and run exports from the project directory:

```powershell
python -m pip install -r requirements.txt
npm run build
$env:ROSHAN_PREMIUM_SOURCE = "C:\path\to\owner-supplied-premium.pdf"
python scripts/export-updated-catalogue.py --pdf "C:\Users\Hamza\Downloads\20 page.pdf"
npm run build
npm run check
```

Build again after PDF generation to copy the current PDF into dist and use its page map. If product identities change, the premium verifier stops on a mismatch so the source design must be updated deliberately.

Old reference PDFs are kept outside the repository in `../reference-documents/` and excluded from website/source ZIPs. The premium exporter uses that local folder by default; set `ROSHAN_PREMIUM_SOURCE` when the source document is stored elsewhere. Only the current customer catalogue in `assets/` is deployed.

## Contact and interactions

Company name: **Roshan Industries**. Email: roshanindustriestech@gmail.com. Owner-confirmed phone/WhatsApp destination: +91 98212 16170. Website contact actions show **Chat on WhatsApp**, without a separate phone-number link. Messages include product/SKU context on product pages and are reviewed/sent by the visitor.

Office: C-20, 1st Singh Industrial Estate, Ram Mandir Road, Near Movie Star Cinema, Goregaon (W), Mumbai - 400 104. Map uses exact CID 2993568223158557359; do not replace it with an ambiguous business-name search.

The floating WhatsApp shortcut appears on mobile and hides near enquiry actions, pagination or the footer. Motion effects respect reduced-motion preferences, preserve readable content without JavaScript, and do not tilt product images. No prices, stock, tolerances, certifications or lead-time promises are inferred.

## Verification

```powershell
npm run check
npm run test:content
npm run test:catalogue
npm run test:motion
npm run test:mobile
npm run test:anchors
npm run test:home
npm run format:check
```

Browser checks use installed playwright-core, or the parent portable QA toolchain, with Microsoft Edge by default. Set EDGE_PATH to override the browser executable. Screenshots are regenerated into artifacts/qa. The PDF and workbook exporters separately verify their saved output, SKU completeness, embedded images and page-link mappings.

### Pumps enquiry range

`src/pumps.mjs` defines 12 researched pump enquiry entries in six categories, with permanent SKUs RIT-0201 to RIT-0212. Pumps appear on the homepage, category overview, filters and product pages. `assets/pumps/` holds photographs of actual pumps from Wikimedia Commons. Visible product-page credits link to each source and licence; these images illustrate types rather than Roshan stock. Descriptions are original summaries informed by manufacturer references linked in each entry. Photos retain their original framing and brand markings; product pages credit the creator and licence. Confirm real models and replace reference images with company photographs when available. The updated PDF and Excel include the original 200 verified products plus 12 pump enquiry entries. `scripts/export-updated-catalogue.py` rebuilds the source audit and adds the pump range, photographs and credits. Run it with the original PDF via `--pdf`.

`tests/pumps-qa.cjs` checks all 12 photo files load, six category counts, Pumps family filtering, SKU-specific WhatsApp links and responsive layouts. Run `npm run test:pumps` after changes to the pump range.

Photo credits are generated as `photo-credits.html` by `photoCreditsPage` in `src/templates.mjs`, linked from every footer. Product pages omit the photo-credit paragraph. Category family cards and category tiles fill each row evenly, including shorter final rows.

Homepage discovery sections use `homeSlider` in `src/templates.mjs`, scroll-snap styles in `src/modern.css`, and enhancement in `src/app.js`. Visible sliders advance every five seconds, pause for hover/focus/touch and hidden tabs, support swipe/arrow controls, and start paused for reduced motion. Photo credits remain on the footer-linked credits page; card reference labels are removed.

`tests/sliders-qa.cjs` verifies homepage automatic movement, next/previous and wrapping at mobile/tablet/desktop sizes, reduced motion and no-JavaScript fallback. Run `npm run test:sliders`.

The UI uses "200+ products" for headline totals; exports retain exact SKU counts. Updated PDF: 48 pages with two matching index pages at the start; Pumps is the first family. Product cards are non-clickable, while family/category rows and index navigation remain clickable. Pump cards use the original category card layout. Updated Excel: 21 category sheets, all 212 entries and embedded photos, with no audit or pump-source sheets. Pump photo attribution is accessible through the PDF's photo-credit links and the website. `reports/export-audit.json` records combined export totals; the original source-panel audit remains 200. Slider controls contain previous/next only.
