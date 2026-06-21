"""
utils/patch_playwright.py
Monkey-patches Playwright's driver path to run from a safe temporary directory,
avoiding launch failures caused by spaces and ampersands in Windows workspace paths.
"""

import os
import sys
import shutil
import inspect
from pathlib import Path

def patch_playwright():
    try:
        # Force import to locate package path
        import playwright
        package_path = Path(inspect.getfile(playwright)).parent
        original_driver_dir = package_path / "driver"
        
        # Resolve to standard user TEMP directory
        temp_dir = Path(os.environ.get("TEMP", "C:\\Temp")) / "playwright_driver_safe"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        safe_driver_path = temp_dir / "driver"
        
        # Copy driver folder if not exists
        if not safe_driver_path.exists():
            shutil.copytree(original_driver_dir, safe_driver_path, dirs_exist_ok=True)
        
        # Monkey patch compute_driver_executable in playwright.driver
        import playwright._impl._driver as driver
        
        def patched_compute():
            if sys.platform == "win32":
                return safe_driver_path / "playwright.cmd"
            return safe_driver_path / "playwright.sh"
            
        driver.compute_driver_executable = patched_compute
    except Exception:
        # Silently bypass errors to keep standard environments functional
        pass

# Automatically run patch on module import
patch_playwright()
