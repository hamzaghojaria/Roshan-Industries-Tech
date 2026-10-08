"""Check cache reuse/invalidation, approved photo dimensions and lossless logo encoding."""

from io import BytesIO
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from catalogue_images import CatalogueImageCache, WEB_IMAGE_PROFILE
from PIL import Image


class CatalogueImageTests(unittest.TestCase):
    def setUp(self):
        self.temporary = TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.source = self.root / "photo.png"
        Image.new("RGB", (1600, 1000), "red").save(self.source)
        self.cache = CatalogueImageCache(self.root / "cache")

    def tearDown(self):
        self.temporary.cleanup()

    def test_reuse_preserves_original_and_bounds_image_size(self):
        original = self.source.read_bytes()
        first = self.cache.prepare(self.source)
        self.assertEqual(self.cache.prepare(self.source), first)
        self.assertEqual((self.cache.hits, self.cache.misses), (1, 1))
        self.assertEqual(self.source.read_bytes(), original)
        with Image.open(BytesIO(first)) as image:
            self.assertEqual(image.format, "JPEG")
            self.assertEqual(max(image.size), 900)
            self.assertAlmostEqual(image.width / image.height, 1.6, places=2)

    def test_changed_source_and_quality_invalidate_cache(self):
        first = self.cache.prepare(self.source)
        Image.new("RGB", (1600, 1000), "blue").save(self.source)
        changed = self.cache.prepare(self.source)
        self.assertNotEqual(first, changed)
        with Image.open(BytesIO(changed)) as image:
            self.assertGreater(image.getpixel((0, 0))[2], 240)
        with patch.dict(WEB_IMAGE_PROFILE, {"jpegQuality": 80}):
            self.cache.prepare(self.source)
        self.assertEqual(self.cache.misses, 3)
        self.assertEqual(self.cache.prepare(self.source), changed)
        self.assertEqual(self.cache.hits, 1)

    def test_logo_stays_lossless_and_separate_from_photo_profile(self):
        lossless = self.cache.prepare(self.source, lossless=True)
        with Image.open(BytesIO(lossless)) as image:
            self.assertEqual(image.format, "PNG")
            self.assertEqual(image.size, (1600, 1000))
            self.assertEqual(image.getpixel((0, 0)), (255, 0, 0))
        self.assertNotEqual(lossless, self.cache.prepare(self.source))


if __name__ == "__main__":
    unittest.main(verbosity=2)
