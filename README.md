# Roshan Industries

Watch parts, tools and custom manufacturing in Mumbai. **Since 1900 · 125+ years of service.**

[View website](https://roshan-industries-tech.onrender.com/) · [GitHub repository](https://github.com/hamzaghojaria/Roshan-Industries-Tech) · [Email us](mailto:roshanindustriestech@gmail.com)

**212 products · 21 categories · 5 families**. Website headlines display **200+ products**.

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

## What to edit

| Change | File or folder |
| --- | --- |
| Page content, layouts, header and footer | [src/templates.mjs](src/templates.mjs) |
| Colours, spacing and mobile appearance | [src/styles.css](src/styles.css), [src/modern.css](src/modern.css) |
| Sliders, search, filters and mobile menu | [src/app.js](src/app.js) |
| Original products and categories | [src/catalogue.mjs](src/catalogue.mjs), [src/data/](src/data/) |
| Pump products and categories | [src/pumps.mjs](src/pumps.mjs) |
| Product descriptions | [src/descriptions.mjs](src/descriptions.mjs) |
| Office address and map | [src/location.mjs](src/location.mjs) |
| Photos, logo and current downloadable PDF | [assets/](assets/) |

**Keep existing SKUs unchanged.** The permanent mapping lives in [src/data/sku-map.json](src/data/sku-map.json).

<details>
<summary><strong>Click to explore the folders</strong></summary>

| Folder | Purpose |
| --- | --- |
| `src/` | Editable website code and templates |
| `src/data/` | Original catalogue records, approved names and permanent SKUs |
| `assets/` | Logo, product photos, pump photos and the current customer PDF |
| `scripts/` | Build, validation, image extraction and catalogue export tools |
| `tests/` | Browser checks for mobile layout and website behaviour |
| `reports/` | Catalogue verification records and PDF page mappings |
| `artifacts/` | Local screenshots and review files; ignored by Git |
| `dist/` | Generated website ready for hosting; ignored by Git |
| `products/`, `categories/` | Generated HTML for local previews; ignored by Git |
| `.openai/` | Existing project metadata; not used by the Render build |

Root HTML, CSS, JavaScript and CSV files are also generated local-preview copies. Make lasting changes in `src/` or `assets/`.

</details>

<details>
<summary><strong>Click to explore supporting code files</strong></summary>

| File | Purpose |
| --- | --- |
| `src/catalogue-index.mjs` | Fast lookups by product, category and family |
| `src/data/catalogue-source.json` | Original PDF product records |
| `src/data/name-confirmations.json` | Company-approved product names |
| `scripts/build.mjs` | Generates pages and recreates `dist/` |
| `scripts/check.mjs` | Checks links, images, product counts and SKU stability |
| `scripts/export-updated-catalogue.py` | Creates the complete PDF and Excel, including pumps |
| `scripts/prepare-premium-pdf.py` | Verifies and prepares the original 200-product PDF |
| `scripts/export-workbook.py` | Prepares the original workbook and internal audit |
| `scripts/extract-catalogue.py` | Extracts product photos and the logo from the original scan |
| `scripts/export-pdf.py` | Compatibility entry point for the premium PDF exporter |
| `package.json` | Build, check, test and formatting commands |
| `requirements.txt` | Python dependencies for catalogue tools |
| `.gitignore` | Keeps generated files, exports and secrets out of GitHub |
| `.prettierrc.json`, `.prettierignore` | Source formatting settings |
| `pending task.txt` | Owner-maintained ideas and notes |

Browser checks in `tests/`: `mobile-qa.cjs` checks responsive pages; `anchor-qa.cjs` checks section links; `content-qa.cjs` checks enquiries and content; `hover-qa.cjs` checks effects; `multipage-qa.cjs` checks catalogue navigation and filters; `root-navigation-qa.cjs` checks home URLs; `pumps-qa.cjs` checks pump photos and categories; `sliders-qa.cjs` checks autoplay and controls.

Tests currently use Microsoft Edge on Windows. Source code includes responsibility comments. JSON files contain data and cannot include comments.

</details>

## Publish on Render

| Setting | Value |
| --- | --- |
| Service type | Static Site |
| Branch | `main` |
| Root directory | Leave empty when `package.json` is at the repository root |
| Build command | `npm run build` |
| Publish directory | `dist` |

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

- **Website download:** [assets/roshan-updated-product-catalogue.pdf](assets/roshan-updated-product-catalogue.pdf), tracked in GitHub.
- **Local PDF:** `Roshan-Industries-Catalogue-Premium-Verified.pdf`, ignored by Git.
- **Local Excel:** `Roshan-Industries-Product-Catalogue.xlsx`, ignored by Git.
- **Website ZIP:** `roshan-website.zip`, ready to upload.
- **Source ZIP:** `Roshan-Industries-Source.zip`, editable project files.

The PDF contains 48 pages and 212 entries. Pumps is last in the two-page index. Family/category navigation is clickable; product cards are not. Excel contains Overview, All Products and 21 category sheets with embedded photos, without audit or pump-source sheets.

<details>
<summary><strong>Click for catalogue export commands</strong></summary>

Keep the original documents outside the repository. This workstation stores reference PDFs in `../reference-documents/`. Set the source path when using another computer.

```powershell
python -m pip install -r requirements.txt
npm run build
$env:ROSHAN_PREMIUM_SOURCE = "C:\path\to\owner-supplied-premium.pdf"
python scripts/export-updated-catalogue.py --pdf "C:\path\to\20 page.pdf"
npm run build
npm run check
```

Close Excel before regenerating the workbook. Source verification and page mappings remain in `reports/`. Pump source/licence information remains in `assets/pumps/LICENSES.txt` and PDF metadata; there is no visible Photo credits page.

</details>

## What belongs in GitHub?

**Keep:** `src/`, `assets/`, `scripts/`, `tests/`, useful verification reports and configuration files.

**Ignore:** `dist/`, generated preview files, local PDF/Excel/ZIP exports, screenshots, dependencies, caches and secrets. Old reference PDFs remain outside the repository.

Your normal workflow: **edit source → build and check → commit and push → Render deploys.**
