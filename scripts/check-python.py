"""Parse maintained Python scripts without importing dependencies or running exports."""

import ast
from pathlib import Path
import sys


def main():
    """Report every syntax error and return a status suitable for automated checks."""
    files = sorted(Path(__file__).resolve().parent.glob("*.py"))
    failures = 0
    for file in files:
        try:
            ast.parse(file.read_text(encoding="utf8"), filename=str(file))
        except (SyntaxError, UnicodeError, OSError) as error:
            print(f"[python-syntax] FAIL {file.name}: {error}", file=sys.stderr)
            failures += 1
    status = "FAIL" if failures else "PASS"
    print(f"[python-syntax] {status}: checked {len(files)} Python files.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
