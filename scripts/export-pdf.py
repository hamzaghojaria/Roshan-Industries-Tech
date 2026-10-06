"""Compatibility entry point: export the approved premium catalogue and its audit."""
from pathlib import Path
import runpy

# Delegate to one maintained implementation rather than retaining an obsolete layout.
runpy.run_path(str(Path(__file__).with_name('prepare-premium-pdf.py')), run_name='__main__')
