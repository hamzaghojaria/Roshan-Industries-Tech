# Product image fixes — 10 October 2026

26 products updated in the local website. No broken image URLs existed; these changes repair source-photo defects and improve framing. Original assets remain in assets/products/. Cleaned replacements are in assets/cleaned-products/, selected through src/data/product-image-overrides.json. The 23 fitting images use CSS framing in cards and detail pages; no source pixels were retouched for those products.

| SKU | Product | Change |
| --- | --- | --- |
| RIT-0239 | Aluminium Storage Box with 20 Tins Model 3320 | Removed cut-off model-number text below the box. |
| RIT-0253 | Aluminium Storage Tin 120 ml with Push Fit Lid | Removed clipped Push type text at lower left. |
| RIT-0254 | Aluminium Storage Tin 20 ml with Screw Lid | Removed stray black text fragment at top edge. |
| RIT-0297 | Reducer | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0298 | Female Run Tee | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0299 | Female Branch Tee | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0300 | Male Branch Tee | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0301 | Male Run Tee | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0302 | Reducing Union Tee | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0303 | Union Tee | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0304 | Union Cross | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0305 | Female Adapter | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0306 | Male Adapter | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0307 | Female Elbow | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0308 | Male Elbow | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0309 | Union Elbow | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0310 | Bulkhead Reducer Union | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0311 | Bulkhead Union | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0312 | Bulkhead Female Connector | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0313 | Bulkhead Male Connector | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0314 | Reducing Union | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0315 | Union | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0316 | Female Connector | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0317 | Tube Fitting Nut | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0318 | Back Ferrule | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |
| RIT-0319 | Front Ferrule | Centered the product and reduced excess blank margins using an individual square display frame. Preserved the original file and proportions. |

The three cleaned photographs were produced with the built-in ImageGen tool, then encoded as WebP. Prompts requested removal only of the unwanted text/mark and preservation of all product components, geometry, texture, shadows and framing. Results were visually checked; AI output is not claimed to be pixel-identical to the original product regions. Source-photo references and SHA-256 hashes are recorded in the overrides file.

The varied backgrounds on RIT-0260–0267 and faint corner remnants in older photos remain. They are cosmetic source-photo differences, not broken loading or layout errors. No artificial sharpening or invented detail was applied to the fitting photos.

Validation: build, local links/assets and stable SKU checks, JavaScript syntax, source image provenance validation, product image interaction checks, and all 23 fitting frames at 390px and 1440px. Frame checks confirm no nonwhite product pixels are clipped and original proportions are retained. Before/after sheets are retained locally under artifacts/image-audit/.

Final verification passed: all 311 product images decode with correct dimensions; all 337 routes have no horizontal overflow at 320px, 390px and 760px. All four selected suites passed: product image interactions, individual photo framing, mobile layout/navigation, and whole-card links.

Exact ImageGen prompts are recorded in [prompts.md](prompts.md).

The local build is updated. The PDF was subsequently rebuilt as described below; the workbook and hosted website have not been published or replaced by this task.

## Downloadable PDF proportion fix

RIT-0269's square photo was displayed in a 231 by 103-point rectangle on page 13, making it look flattened. The installed PDF library also stretched 13 other square images despite its preserve-proportions setting. The exporter now calculates the proportional centered rectangle explicitly from each prepared image's dimensions and checks every PDF image transformation before saving.

| Product | PDF page | Repair |
| --- | --- | --- |
| RIT-0012 | 7 | Restored square photo proportions and centered placement. |
| RIT-0013 | 7 | Restored square photo proportions and centered placement. |
| RIT-0229 | 40 | Restored square photo proportions and centered placement. |
| RIT-0233 | 47 | Restored square photo proportions and centered placement. |
| RIT-0237 | 48 | Restored square photo proportions and centered placement. |
| RIT-0244 | 49 | Restored square photo proportions and centered placement. |
| RIT-0260 | 40 | Restored square photo proportions and centered placement. |
| RIT-0261 | 40 | Restored square photo proportions and centered placement. |
| RIT-0262 | 40 | Restored square photo proportions and centered placement. |
| RIT-0265 | 41 | Restored square photo proportions and centered placement. |
| RIT-0266 | 41 | Restored square photo proportions and centered placement. |
| RIT-0267 | 41 | Restored square photo proportions and centered placement. |
| RIT-0268 | 41 | Restored square photo proportions and centered placement. |
| RIT-0269 | 13 | Restored square photo proportions and centered placement. |

Both local customer PDF copies were updated and the hosting build refreshed. The catalogue retains all 63 pages, 311 products, page text, and link counts. All 374 image placements pass the proportion check. Nine affected or refreshed pages were rendered and visually reviewed. The regenerated PDF also includes the three cleaned photographs from the preceding image repair. No new photo retouching was used for the proportion correction.

Regression checks cover correct square fitting, rotated fitting, and rejection of the original stretched-square layout; existing image-cache checks also pass. Detailed verification is saved in [pdf-proportions.json](pdf-proportions.json).

## Owner photo correction for RIT-0012 and RIT-0013

Both entries previously shared a supplier photo with a smooth black lens rim. The owner's supplied reference shows a grey ridged rim and a different body/clamp profile. Both website entries now use the exact supplied JPEG, retained at `assets/reference-products/spectacle-eye-glass-grey-ridged-rim-owner.jpeg` (SHA-256 `320b75120f7012de60f973fcda81ac3555e7d02edaeb03d1d2c1d0c700945c1b`). The copy is byte-identical to the attachment; no AI editing, retouching, resizing or recompression was applied to the website asset.

| Product | Website and PDF change |
| --- | --- |
| RIT-0012 | Replaced the mismatched supplier photo with the supplied reference; centered display frame includes the complete loupe, wire and clamp. |
| RIT-0013 | Uses the same supplied reference and display frame; keeps its existing distinct catalogue variant label. |

The 1 to 1.5 and 2 to 4.5 variant labels remain; a single photograph does not establish optical strength or distinguish those variants. Page 7 of both PDF copies now uses the owner photo with matching display framing. PDF clipping preserves the complete embedded source photo while showing the product area; the PDF still uses its documented JPEG compression profile.

Desktop and mobile screenshots were reviewed. All product photos decode with correct dimensions, all site links/assets pass, and all 374 PDF image placements preserve proportions. The hosted website has not been published. The Excel workbook has not been refreshed; the combined source/export audit reports its earlier PDF checksum as stale after the PDF rebuild.
