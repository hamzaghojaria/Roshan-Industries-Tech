"""Prepare and cache PDF images without changing the website's original photographs."""

from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image, __version__ as pillow_version

WEB_IMAGE_PROFILE = {
    "name": "web",
    "maxImageEdge": 900,
    "jpegQuality": 85,
    "subsampling": 2,
    "logoLossless": True,
}


class CatalogueImageCache:
    """Invalidate cached encodings when source bytes, settings or Pillow change."""

    def __init__(self, directory):
        self.directory = Path(directory)
        self.directory.mkdir(parents=True, exist_ok=True)
        self.hits = 0
        self.misses = 0

    def prepare(self, file, *, lossless=False):
        source = Path(file).read_bytes()
        settings = {
            **WEB_IMAGE_PROFILE,
            "lossless": lossless,
            "pillowVersion": pillow_version,
            "encodingVersion": 1,
        }
        key = sha256(source + json.dumps(settings, sort_keys=True).encode("utf8")).hexdigest()
        target = self.directory / (key + (".png" if lossless else ".jpg"))
        if target.is_file():
            self.hits += 1
            return target.read_bytes()

        # Flatten transparency on white, matching the existing catalogue appearance.
        with Image.open(BytesIO(source)) as original:
            rgba = original.convert("RGBA")
            photo = Image.alpha_composite(Image.new("RGBA", rgba.size, "white"), rgba).convert(
                "RGB"
            )
        buffer = BytesIO()
        if lossless:
            photo.save(buffer, format="PNG")
        else:
            edge = WEB_IMAGE_PROFILE["maxImageEdge"]
            photo.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            photo.save(
                buffer,
                format="JPEG",
                quality=WEB_IMAGE_PROFILE["jpegQuality"],
                optimize=True,
                subsampling=WEB_IMAGE_PROFILE["subsampling"],
            )
        encoded = buffer.getvalue()
        # An interrupted encoding must never leave a partial cache entry.
        with NamedTemporaryFile(dir=self.directory, suffix=".tmp", delete=False) as temporary:
            temporary.write(encoded)
            temporary_path = Path(temporary.name)
        try:
            temporary_path.replace(target)
        finally:
            temporary_path.unlink(missing_ok=True)
        self.misses += 1
        return encoded
