"""Encode clear workbook previews and share identical OOXML image resources."""

from hashlib import sha256
from io import BytesIO
from pathlib import PurePosixPath
from posixpath import normpath
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET
from PIL import Image

WORKBOOK_IMAGE_PROFILE = {
    "format": "JPEG",
    "maxWidth": 240,
    "maxHeight": 210,
    "jpegQuality": 85,
    "subsampling": 2,
    "sharedImageResources": True,
}


def preview_bytes(source):
    """Keep existing thumbnail dimensions and encode without modifying the source."""
    with Image.open(source) as original:
        photo = original.convert("RGB")
    photo.thumbnail((240, 210), Image.Resampling.LANCZOS)
    buffer = BytesIO()
    photo.save(buffer, format="JPEG", quality=85, subsampling=2, optimize=True)
    return buffer.getvalue()


def share_image_resources(workbook):
    """Point repeated drawing images to one media file; preserve every visible drawing."""
    namespace = "http://schemas.openxmlformats.org/package/2006/relationships"
    ET.register_namespace("", namespace)
    output = BytesIO()
    with ZipFile(workbook) as source:
        canonical = {}
        replacements = {}
        media = [name for name in source.namelist() if name.startswith("xl/media/")]
        for name in media:
            digest = sha256(source.read(name)).hexdigest()
            if digest in canonical:
                replacements[name] = canonical[digest]
            else:
                canonical[digest] = name
        with ZipFile(output, "w", ZIP_DEFLATED, compresslevel=9) as target:
            for entry in source.infolist():
                if entry.filename in replacements:
                    continue
                data = source.read(entry.filename)
                if entry.filename.endswith(".rels"):
                    tree = ET.fromstring(data)
                    changed = False
                    # A part's relationships live in the _rels child of its own directory.
                    base = str(PurePosixPath(entry.filename).parent.parent)
                    for relationship in tree:
                        if not relationship.get("Type", "").endswith("/image"):
                            continue
                        location = relationship.get("Target", "")
                        resolved = (
                            normpath(location.lstrip("/"))
                            if location.startswith("/")
                            else normpath(base + "/" + location)
                        )
                        if resolved in replacements:
                            relationship.set("Target", "/" + replacements[resolved])
                            changed = True
                    if changed:
                        data = ET.tostring(tree, encoding="utf-8", xml_declaration=True)
                target.writestr(entry.filename, data)
    workbook.write_bytes(output.getvalue())
    return {
        "uniqueImageResources": len(canonical),
        "duplicateImageResourcesRemoved": len(replacements),
    }
