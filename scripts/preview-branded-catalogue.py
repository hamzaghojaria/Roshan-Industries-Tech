"""Render selected current PDF pages as review images; does not change the catalogue."""

# Run directly from a working Python installation; see README for inputs and write effects.

import pymupdf as fitz
from pathlib import Path

r = Path.cwd()
d = fitz.open(r / "assets/roshan-industries-catalogue.pdf")
for n in [0, 1, 2, 3, 45]:
    d[n].get_pixmap(matrix=fitz.Matrix(1, 1)).save(
        r / f"reports/high-resolution-audit/branded-page-{n+1}.png"
    )

print("PASS catalogue review images saved to reports/high-resolution-audit/.", flush=True)
