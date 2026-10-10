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
        "prepare-workbook-previews.py",
        "finish-catalogue-workbook.py",
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
        # Exercise the actual authoring stages without the compatibility updater's
        # site/source-audit requirements, which are outside this isolated fixture.
        env = os.environ.copy()
        env["PYTHONPATH"] = os.pathsep.join(
            str(Path(entry).resolve()) for entry in sys.path if entry
        )
        for name in ("export-branded-catalogue.py", "prepare-workbook-previews.py"):
            subprocess.run(
                [sys.executable, "-B", str(fixture / "scripts" / name)],
                cwd=fixture,
                env=env,
                check=True,
            )
        node = os.environ.get("CATALOGUE_NODE") or shutil.which("node")
        if not node:
            portable = root.parent / ".site-tools/node-ready/node-v22.14.0-win-x64/node.exe"
            node = str(portable) if portable.is_file() else None
        assert node, "Node.js is required for Artifact Tool workbook authoring"
        result = subprocess.run(
            [node, "scripts/export-catalogue-workbook.mjs"],
            cwd=fixture,
            env=env,
            text=True,
            capture_output=True,
        )
        print(result.stdout, end="")
        assert result.returncode == 0 or (
            result.returncode in (1, 3221226505)
            and "Exported " in result.stdout
            and (fixture / "Roshan-Industries-Product-Catalogue.xlsx").is_file()
        ), result.stderr
        subprocess.run(
            [sys.executable, "-B", str(fixture / "scripts/finish-catalogue-workbook.py")],
            cwd=fixture,
            env=env,
            check=True,
        )
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
