"""Catch PDF image stretching even when the embedded photograph is unchanged."""
from io import BytesIO
from pathlib import Path
import sys
import pymupdf as fitz
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from catalogue_images import fit_image_rect, validate_image_proportions


def main():
    image = BytesIO()
    Image.new("RGB", (900, 900), "white").save(image, format="JPEG")
    for rotation in (0, 90):
        with fitz.open() as doc:
            page = doc.new_page()
            placement = fitz.Rect(fit_image_rect((48, 100, 279, 203), (900, 900)))
            page.insert_image(placement, stream=image.getvalue(),
                              keep_proportion=False, rotate=rotation)
            assert validate_image_proportions(doc) == 1
    with fitz.open() as doc:
        page = doc.new_page()
        page.insert_image(fitz.Rect(48, 100, 279, 203), stream=image.getvalue(),
                          keep_proportion=False)
        try:
            validate_image_proportions(doc)
        except ValueError as error:
            assert "Stretched image on PDF page 1" in str(error)
        else:
            raise AssertionError("The RIT-0269 stretching regression was not detected")
    print("PASS PDF image proportions: preserved and rotated placements pass; stretched square fails.")


if __name__ == "__main__":
    main()
