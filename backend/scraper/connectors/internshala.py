"""
connectors/internshala.py
Internshala scraper.
"""

import re
import asyncio
import random
from typing import Optional
from playwright.async_api import Page

from .base import BaseConnector, RawJob


# Indicators that a scraped page is an error/captcha rather than a real listing
ERROR_PAGE_INDICATORS = [
    "502 bad gateway",
    "503 service unavailable",
    "504 gateway timeout",
    "404 not found",
    "page not found",
    "access denied",
    "you have been blocked",
    "captcha",
    "internal server error",
    "rate limit exceeded",
]


class InternshalaConnector(BaseConnector):

    platform_name = "Internshala"

    SEARCH_URL = "https://internshala.com/internships/keywords-{keywords}/"

    # Each selector that is a list is tried in order; first match wins.
    SELECTORS = {
        "card_signal": "div.individual_internship, .internship_list_container, #internship_list",

        "job_title": [
            "h1.internship_heading",
            ".profile_on_detail_page",
            ".internship_heading h1",
            "h1",
        ],
        "company": [
            ".company_name a",
            "a.link_display_like_text",
            ".internship_heading .heading_6",
            ".heading_6",
        ],
        "stipend": [
            ".stipend",
            "#stipend",
            ".salary_container .stipend",
            "[class*='stipend']",
        ],
        "duration": [
            "#duration",
            "[id='duration']",
        ],
        "description": [
            "#about_internship .text-container",
            "#about_internship",
            ".about_internship_container",
            ".internship_details",
            ".internship_details_section",
            "[class*='about'] [class*='text']",
            "[class*='description']",
        ],
        "posted_date": [
            ".posted_by_container span",
            ".status-inactive",
            "[class*='posted']",
        ],
        "apply_by": [
            "#apply_by",
            ".apply_by_date",
            "[id*='apply']",
        ],
        "skills": [
            ".round_tags_container span",
            ".skill-tags span",
            "[class*='skill'] span",
        ],
        "location":       ["a.location_link"],
        "work_from_home": ["#work_from_home_icon", ".work_from_home_tag"],
    }

    # ------------------------------------------------------------------------
    # Search URL builder
    # ------------------------------------------------------------------------

    def search_urls(self, keywords: list[str], location: str) -> list[str]:
        result = []
        for kw in keywords:
            slug = kw.strip().lower().replace(" ", "-").replace("_", "-")
            result.append(self.SEARCH_URL.format(keywords=slug))
        return result

    # ------------------------------------------------------------------------
    # Popup handling
    # ------------------------------------------------------------------------

    async def handle_popups(self, page: Page) -> None:
        await asyncio.sleep(0.5)
        try:
            await page.keyboard.press("Escape")
        except Exception:
            pass

    # ------------------------------------------------------------------------
    # Job link extraction (from search results page)
    # ------------------------------------------------------------------------

    async def extract_job_links(self, page: Page) -> list[str]:
        # Check for error pages first
        if await self._is_error_page(page):
            return []

        # Wait up to 15s for any card to appear after React renders
        try:
            await page.wait_for_selector(self.SELECTORS["card_signal"], timeout=15000)
        except Exception:
            await asyncio.sleep(3)

        # Scroll to load lazy cards
        for _ in range(5):
            await page.mouse.wheel(0, random.randint(300, 600))
            await asyncio.sleep(random.uniform(0.5, 1.0))

        await self.handle_popups(page)

        # Primary: DOM selector
        links = await page.eval_on_selector_all(
            "a[href*='/internship/detail/']",
            "els => [...new Set(els.map(e => e.href))]"
        )

        # Fallback: regex on raw HTML
        if not links:
            html = await page.content()
            raw  = re.findall(
                r'href=["\'](/internship/detail/[a-zA-Z0-9\-_%]+/?)["\']',
                html
            )
            links = [f"https://internshala.com{p}" for p in dict.fromkeys(raw)]

        # Deduplicate and normalize
        seen  = set()
        clean = []
        for link in links:
            base = link.split("?")[0].rstrip("/")
            if base not in seen and "internshala.com/internship" in base:
                seen.add(base)
                clean.append(base)

        return clean[: self.jobs_per_query]

    # ------------------------------------------------------------------------
    # Job data extraction (from job detail page)
    # ------------------------------------------------------------------------

    async def extract_job_data(self, page: Page, url: str) -> Optional[RawJob]:
        await self.handle_popups(page)

        # Skip error pages BEFORE trying to extract
        if await self._is_error_page(page):
            return None

        try:
            await page.wait_for_selector("h1, .profile_on_detail_page", timeout=12000)
        except Exception:
            return None

        title = await self._safe_text(page, self.SELECTORS["job_title"])
        if not title:
            return None

        # Additional safeguard: reject obvious non-job titles
        if self._is_invalid_title(title):
            return None

        company  = await self._safe_text(page, self.SELECTORS["company"])
        stipend  = await self._safe_text(page, self.SELECTORS["stipend"])
        duration = await self._safe_text(page, self.SELECTORS["duration"])
        desc     = await self._extract_description(page)
        apply_by = await self._safe_text(page, self.SELECTORS["apply_by"])
        posted   = await self._safe_text(page, self.SELECTORS["posted_date"])
        location = await self._extract_location(page)

        # Detect work-from-home mode
        wfh = 0
        for sel in self.SELECTORS["work_from_home"]:
            try:
                wfh = await page.locator(sel).count()
                if wfh > 0:
                    break
            except Exception:
                continue
        mode = "Remote" if wfh > 0 else ("On-site" if location else "Unknown")

        # Extract skills
        skills = []
        for sel in self.SELECTORS["skills"]:
            try:
                skills = await page.eval_on_selector_all(
                    sel,
                    "els => els.map(e => e.innerText.trim()).filter(Boolean)"
                )
                if skills:
                    break
            except Exception:
                continue

        return RawJob(
            source_url           = url,
            platform_name        = self.platform_name,
            job_title            = title,
            company_name         = company,
            location             = location,
            salary               = stipend,
            job_description      = desc,
            posted_date          = posted,
            application_deadline = apply_by,
            mode                 = mode,
            extra_fields         = {
                "duration": duration,
                "skills":   ", ".join(skills),
            }
        )

    # ------------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------------

    async def _is_error_page(self, page: Page) -> bool:
        """
        Detect if the loaded page is a server error or block page
        instead of a real Internshala job listing.
        """
        try:
            title = (await page.title() or "").lower()
            for indicator in ERROR_PAGE_INDICATORS:
                if indicator in title:
                    return True

            # Check first 500 chars of body for error markers
            body_text = await page.evaluate(
                "() => (document.body ? document.body.innerText : '').slice(0, 500).toLowerCase()"
            )
            for indicator in ERROR_PAGE_INDICATORS:
                if indicator in body_text:
                    return True

        except Exception:
            # If we can't even evaluate, treat as error
            return True

        return False

    def _is_invalid_title(self, title: str) -> bool:
        """Reject titles that are obviously not real job postings."""
        t = title.lower().strip()
        if len(t) < 5:
            return True
        for indicator in ERROR_PAGE_INDICATORS:
            if indicator in t:
                return True
        return False

    async def _safe_text(self, page: Page, selector) -> str:
        """Try each selector in the list; return first non-empty match."""
        sels = selector if isinstance(selector, list) else [selector]
        for sel in sels:
            try:
                el = page.locator(sel).first
                if await el.count() > 0:
                    text = (await el.inner_text()).strip()
                    if text:
                        return text
            except Exception:
                continue
        return ""

    async def _extract_description(self, page: Page) -> str:
        """
        Three-strategy description extraction:
            1. Known CSS selectors (list, first match)
            2. Largest text block on page (>150 chars, skips nav/footer noise)
            3. JSON-LD structured data embedded in page source
        """
        # Strategy 1
        text = await self._safe_text(page, self.SELECTORS["description"])
        if text and len(text) > 50:
            return text

        # Strategy 2 - largest meaningful div/p/section
        try:
            blocks = await page.eval_on_selector_all(
                "p, div, section",
                """els => els
                    .map(e => e.innerText.trim())
                    .filter(t => t.length > 150)
                    .sort((a, b) => b.length - a.length)
                    .slice(0, 5)
                """
            )
            skip = [
                "copyright", "privacy policy", "terms of", "log in",
                "sign up", "cookie", "all rights reserved",
            ]
            for block in blocks:
                if not any(s in block.lower() for s in skip):
                    return block
        except Exception:
            pass

        # Strategy 3 - JSON-LD in page HTML
        try:
            html = await page.content()
            m = re.search(r'"description"\s*:\s*"([^"]{100,})"', html)
            if m:
                return (m.group(1)
                         .replace("\\n", "\n")
                         .replace("\\u003c", "<")
                         .replace("\\u003e", ">"))
        except Exception:
            pass

        return ""

    async def _extract_location(self, page: Page) -> str:
        try:
            locs = await page.eval_on_selector_all(
                "a.location_link",
                "els => els.map(e => e.innerText.trim()).filter(Boolean)"
            )
            return ", ".join(locs[:4]) if locs else ""
        except Exception:
            return ""