"""Verify import-safe exporters and full-data generation in an isolated project copy."""

from contextlib import redirect_stdout
from io import StringIO
import json
import os
from pathlib import Path
import runpy
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory


def main():
    """Exercise actual export outputs without replacing the site's customer downloads."""
    root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(root / "scripts"))
    for name in (
        "export-branded-catalogue.py",
        "export-high-resolution-workbook.py",
        "preview-branded-catalogue.py",
        "package-delivery.py",
        "inspect-high-resolution.py",
        "extract-high-resolution.py",
        "validate-synchronized-exports.py",
        "update-catalogue-introduction.py",
    ):
        output = StringIO()
        with redirect_stdout(output):
            namespace = runpy.run_path(str(root / "scripts" / name), run_name="export_import_test")
        assert callable(namespace["main"])
        assert output.getvalue() == "", "Import unexpectedly started an export"
    print("PASS maintenance imports do not start generation or write files.", flush=True)
    artifacts = root / "artifacts"
    artifacts.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix="export-qa-", dir=artifacts) as directory:
        fixture = Path(directory)
        for name in ("src", "scripts", "assets"):
            shutil.copytree(root / name, fixture / name)
        shutil.copy2(root / "products.js", fixture / "products.js")
        (fixture / "reports/high-resolution-audit").mkdir(parents=True)
        for name in (
            "export-branded-catalogue.py",
            "export-high-resolution-workbook.py",
        ):
            subprocess.run([sys.executable, "-B", str(fixture / "scripts" / name)], check=True)
        expected = json.loads(
            (root / "products.js")
            .read_text(encoding="utf8")
            .split("window.ROSHAN_PRODUCTS =", 1)[1]
            .strip()
            .rstrip(";")
        )
        report = fixture / "reports/high-resolution-audit"
        pdf = json.loads((report / "branded-catalogue-validation.json").read_text())
        excel = json.loads((report / "workbook-validation.json").read_text())
        assert pdf["products"] == excel["products"] == len(expected)
        assert set(pdf["skuPages"]) == {product["sku"] for product in expected}
        assert excel["embeddedPhotos"] == len(expected) * 2
        assert excel["allFieldsMatchWebsite"]
        print("PASS isolated PDF and Excel retain all products, photographs and references.")


if __name__ == "__main__":
    main()
