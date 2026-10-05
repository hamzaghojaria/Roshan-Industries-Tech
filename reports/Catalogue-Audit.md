# Roshan Industries catalogue audit

Audited 05 October 2026 against the original `20 page.pdf`.

- 20 source pages: front and back covers plus 18 product pages.
- 200 photo panels: all have a website image and an assigned listing.
- 200 unique listings and stable SKUs in 15 categories.
- Page 5 panels 3 and 4 are distinct selectors: slotted centre RIT-0039 and solid centre RIT-0200.
- Six uncaptioned images: page 17 panels 1–2 and all four page 19 compasses. Names confirmed by the company on 05 October 2026.
- Ambiguous captions are flagged in Excel, including page 18 trays and “Hands”; tray material is not asserted.
- Multi-part sets count as one source photo panel, not one entry per piece.

Each original PDF crop was independently rendered and compared numerically with its website image (mean RGB difference below 5/255). Page-by-page visual comparisons are in `catalogue-audit`. This verifies extraction fidelity; source scan resolution limits available detail. Product terminology, specifications, availability and prices still require company confirmation.

The workbook was reopened and checked for 200 unique SKUs, all 15 category sheets, 200 embedded category images, 200 audit rows and working local product-page targets. Original PDF SHA-256 and per-image hashes are recorded in `catalogue-audit/coverage.json`.
