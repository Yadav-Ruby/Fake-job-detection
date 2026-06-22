"""
main.py
Delegation wrapper for Graphura's advanced job scraper.
"""

import asyncio
from backend.scraper.scraper_main.main import main

if __name__ == "__main__":
    asyncio.run(main())