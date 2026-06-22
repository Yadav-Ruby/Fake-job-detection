"""
connectors/ncs.py
National Career Service Portal (Government of India) scraper.

URL: https://www.ncs.gov.in

Notes:
    - Government portal, fully public, no login required
    - SPA with heavy JS rendering - needs longer timeouts
    - Cross-referencing jobs here with other platforms is a strong
      fraud signal (legit gov jobs should appear on NCS)
    - All NCS jobs are tagged is_government=True for scoring
"""

import asyncio
from typing import Optional
from urllib.parse import quote_plus
from playwright.async_api import Page

from .base import BaseConnector, RawJob


# Error / block page indicators
ERROR_PAGE_INDICATORS = [
    "502 bad gateway",
    "503 service unavailable",
    "504 gateway timeout",
    "404 not found",
    "page not found",
    "access denied",
    "you have been blocked",
    "captcha",
    "session expired",
    "internal server error",
    "service unavailable",
]


class NCSConnector(BaseConnector):

    platform_name = "NCS (Govt. of India)"

    SEARCH_URL_TEMPLATE = (
        "https://www.ncs.gov.in/Pages/JobSearch.aspx"
        "?JobTitle={keywords}"
        "&Location={location}"
    )

    SELECTORS = {
        # Search results
        "job_cards": ".job-card, .jobcard-item, .vacancy-card",
        "job_links": "a.view-detail, a.job-title, .job-card a",

        # Job detail
        "job_title":     "h2.job-title, .vacancy-title h2, .job-detail-title",
        "organization":  ".organisation-name, .employer-name, .company-name",
        "location":      ".job-location, .location-text",
        "salary":        ".salary-range, .pay-scale",
        "vacancy_count": ".vacancy-count, .no-of-vacancy",
        "description":   ".job-description, .duty-section, #jobDescription",
        "posted_date":   ".post-date, .created-on",
        "last_date":     ".last-date, .closing-date, .apply-before",
        "qualification": ".qualification, .education-req",
        "experience":    ".experience-req, .work-experience",
        "job_type":      ".job-type, .employment-type",
    }

    # ------------------------------------------------------------------------
    # Search URL builder
    # ------------------------------------------------------------------------

    def search_urls(self, keywords: list[str], location: str) -> list[str]:
        urls = []
        for kw in keywords:
            urls.append(self.SEARCH_URL_TEMPLATE.format(
                keywords=quote_plus(kw.strip()),
                location=quote_plus(location.strip()),
            ))
        return urls

    # ------------------------------------------------------------------------
    # Popup handling
    # ------------------------------------------------------------------------

    async def handle_popups(self, page: Page) -> None:
        """Dismiss cookie banners and session warnings."""
        await asyncio.sleep(1)
        try:
            cookie_btn = page.locator(
                "button#acceptCookie, .cookie-accept-btn, button:has-text('Accept')"
            ).first
            if await cookie_btn.count() > 0:
                await cookie_btn.click()
                await asyncio.sleep(0.5)
        except Exception:
            pass

    # ------------------------------------------------------------------------
    # Job link extraction
    # ------------------------------------------------------------------------

    async def extract_job_links(self, page: Page) -> list[str]:
        if await self._is_error_page(page):
            return []

        await self.handle_popups(page)

        # NCS servers can be slow - use longer timeout
        try:
            await page.wait_for_selector(self.SELECTORS["job_cards"], timeout=20000)
        except Exception:
            await asyncio.sleep(5)

        try:
            links = await page.eval_on_selector_all(
                self.SELECTORS["job_links"],
                """els => els
                    .map(e => e.href)
                    .filter(h => h && (
                        h.includes('ncs.gov.in') ||
                        h.includes('job-details') ||
                        h.includes('JobDetails')
                    ))
                """
            )
        except Exception:
            links = []

        seen = set()
        clean = []
        for link in links:
            if link and link not in seen:
                seen.add(link)
                clean.append(link)

        return clean[: self.jobs_per_query]

    def extract_job_links_bs4(self, html: str, base_url: str) -> list[str]:
        from bs4 import BeautifulSoup
        import re
        from urllib.parse import urljoin
        soup = BeautifulSoup(html, "html.parser")
        
        links = []
        for el in soup.find_all("a", href=True):
            href = el["href"]
            if "ncs.gov.in" in href or "job-details" in href or "JobDetails" in href:
                links.append(urljoin(base_url, href))
                
        if not links:
            for el in soup.select(self.SELECTORS["job_links"]):
                href = el.get("href")
                if href:
                    links.append(urljoin(base_url, href))
                    
        seen = set()
        clean = []
        for link in links:
            if link and link not in seen:
                seen.add(link)
                clean.append(link)
                
        return clean[:self.jobs_per_query]

    # ------------------------------------------------------------------------
    # Job data extraction
    # ------------------------------------------------------------------------

    async def extract_job_data(self, page: Page, url: str) -> Optional[RawJob]:
        if await self._is_error_page(page):
            return None

        try:
            await page.wait_for_selector(self.SELECTORS["job_title"], timeout=20000)
        except Exception:
            return None

        await self.handle_popups(page)

        title = await self._safe_text(page, self.SELECTORS["job_title"])
        if not title or self._is_invalid_title(title):
            return None

        org       = await self._safe_text(page, self.SELECTORS["organization"])
        location  = await self._safe_text(page, self.SELECTORS["location"])
        salary    = await self._safe_text(page, self.SELECTORS["salary"])
        desc      = await self._safe_text(page, self.SELECTORS["description"])
        posted    = await self._safe_text(page, self.SELECTORS["posted_date"])
        deadline  = await self._safe_text(page, self.SELECTORS["last_date"])
        qual      = await self._safe_text(page, self.SELECTORS["qualification"])
        exp       = await self._safe_text(page, self.SELECTORS["experience"])
        job_type  = await self._safe_text(page, self.SELECTORS["job_type"])
        vacancies = await self._safe_text(page, self.SELECTORS["vacancy_count"])

        return RawJob(
            source_url           = url,
            platform_name        = self.platform_name,
            job_title            = title,
            company_name         = org,
            location             = location,
            salary               = salary,
            job_description      = desc,
            posted_date          = posted,
            application_deadline = deadline,
            mode                 = "On-site",   # Government jobs default to on-site
            extra_fields         = {
                "qualification": qual,
                "experience":    exp,
                "job_type":      job_type,
                "vacancies":     vacancies,
                "is_government": True,           # Used by scoring_engine for trust bonus
            }
        )

    def extract_job_data_bs4(self, html: str, url: str) -> Optional[RawJob]:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        
        page_title = (soup.title.string or "").lower() if soup.title else ""
        body_text = soup.get_text()[:500].lower()
        for indicator in ERROR_PAGE_INDICATORS:
            if indicator in page_title or indicator in body_text:
                return None
                
        title = ""
        for sel in [s.strip() for s in self.SELECTORS["job_title"].split(",")]:
            el = soup.select_one(sel)
            if el:
                title = el.get_text(strip=True)
                break
                
        if not title or self._is_invalid_title(title):
            return None
            
        org = ""
        for sel in [s.strip() for s in self.SELECTORS["organization"].split(",")]:
            el = soup.select_one(sel)
            if el:
                org = el.get_text(strip=True)
                break
                
        location = ""
        for sel in [s.strip() for s in self.SELECTORS["location"].split(",")]:
            el = soup.select_one(sel)
            if el:
                location = el.get_text(strip=True)
                break
                
        salary = ""
        for sel in [s.strip() for s in self.SELECTORS["salary"].split(",")]:
            el = soup.select_one(sel)
            if el:
                salary = el.get_text(strip=True)
                break
                
        desc = ""
        for sel in [s.strip() for s in self.SELECTORS["description"].split(",")]:
            el = soup.select_one(sel)
            if el:
                desc = el.get_text(separator="\n", strip=True)
                break
                
        posted = ""
        for sel in [s.strip() for s in self.SELECTORS["posted_date"].split(",")]:
            el = soup.select_one(sel)
            if el:
                posted = el.get_text(strip=True)
                break
                
        deadline = ""
        for sel in [s.strip() for s in self.SELECTORS["last_date"].split(",")]:
            el = soup.select_one(sel)
            if el:
                deadline = el.get_text(strip=True)
                break
                
        qual = ""
        for sel in [s.strip() for s in self.SELECTORS["qualification"].split(",")]:
            el = soup.select_one(sel)
            if el:
                qual = el.get_text(strip=True)
                break
                
        exp = ""
        for sel in [s.strip() for s in self.SELECTORS["experience"].split(",")]:
            el = soup.select_one(sel)
            if el:
                exp = el.get_text(strip=True)
                break
                
        job_type = ""
        for sel in [s.strip() for s in self.SELECTORS["job_type"].split(",")]:
            el = soup.select_one(sel)
            if el:
                job_type = el.get_text(strip=True)
                break
                
        vacancies = ""
        for sel in [s.strip() for s in self.SELECTORS["vacancy_count"].split(",")]:
            el = soup.select_one(sel)
            if el:
                vacancies = el.get_text(strip=True)
                break
                
        return RawJob(
            source_url=url,
            platform_name=self.platform_name,
            job_title=title,
            company_name=org,
            location=location,
            salary=salary,
            job_description=desc,
            posted_date=posted,
            application_deadline=deadline,
            mode="On-site",
            extra_fields={
                "qualification": qual,
                "experience": exp,
                "job_type": job_type,
                "vacancies": vacancies,
                "is_government": True,
            }
        )

    # ------------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------------

    async def _is_error_page(self, page: Page) -> bool:
        """Detect server errors, blocks, and session warnings."""
        try:
            title = (await page.title() or "").lower()
            for indicator in ERROR_PAGE_INDICATORS:
                if indicator in title:
                    return True

            body_text = await page.evaluate(
                "() => (document.body ? document.body.innerText : '').slice(0, 600).toLowerCase()"
            )
            for indicator in ERROR_PAGE_INDICATORS:
                if indicator in body_text:
                    return True
        except Exception:
            return True
        return False

    def _is_invalid_title(self, title: str) -> bool:
        """Reject obviously-not-job titles."""
        t = title.lower().strip()
        if len(t) < 5:
            return True
        for indicator in ERROR_PAGE_INDICATORS:
            if indicator in t:
                return True
        return False

    async def _safe_text(self, page: Page, selector: str) -> str:
        """Return text of first matching element, or empty string."""
        if not selector.strip():
            return ""
        try:
            el = page.locator(selector).first
            if await el.count() > 0:
                return (await el.inner_text()).strip()
        except Exception:
            pass
        return ""