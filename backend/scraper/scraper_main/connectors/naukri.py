"""
connectors/naukri.py
Naukri.com connector.
"""

import asyncio
import re
from typing import Optional
from playwright.async_api import Page
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from .base import BaseConnector, RawJob


class NaukriConnector(BaseConnector):
    platform_name = "Naukri"

    SEARCH_URL = "https://www.naukri.com/{keywords}-jobs"

    SELECTORS = {
        "job_title": [".jd-header-title", "h1.job-desc-title", ".title", "h1"],
        "company": [".jd-header-comp-name a", ".company-name", ".comp-name-yourselector", ".comp-info-detail-header a"],
        "location": [".location a", ".loc-yourselector", ".location", ".loc"],
        "salary": [".salary", ".ctc", ".salary-container", "[class*='salary']"],
        "description": [".job-desc", "#jobDescription", ".jd-desc", ".job-description-section", "[class*='description']"],
        "posted_date": [".posted-date", ".date", ".job-post-date", "[class*='posted']"],
        "skills": [".key-skill a", ".skills span", ".skill-tag", "[class*='skills'] a"],
    }

    def search_urls(self, keywords: list[str], location: str) -> list[str]:
        result = []
        for kw in keywords:
            slug = kw.strip().lower().replace(" ", "-")
            result.append(self.SEARCH_URL.format(keywords=slug))
        return result

    async def extract_job_links(self, page: Page) -> list[str]:
        try:
            await page.wait_for_selector("a.title", timeout=10000)
        except Exception:
            pass

        links = await page.eval_on_selector_all(
            "a[href*='/job-listings-']",
            "els => [...new Set(els.map(e => e.href))]"
        )
        return list(dict.fromkeys(links))[:self.jobs_per_query]

    def extract_job_links_bs4(self, html: str, base_url: str) -> list[str]:
        soup = BeautifulSoup(html, "html.parser")
        links = []
        for el in soup.find_all("a", href=True):
            href = el["href"]
            if "/job-listings-" in href:
                links.append(urljoin(base_url, href))
        return list(dict.fromkeys(links))[:self.jobs_per_query]

    async def extract_job_data(self, page: Page, url: str) -> Optional[RawJob]:
        html = await page.content()
        return self.extract_job_data_bs4(html, url)

    def extract_job_data_bs4(self, html: str, url: str) -> Optional[RawJob]:
        soup = BeautifulSoup(html, "html.parser")
        
        # Title
        title = ""
        for sel in self.SELECTORS["job_title"]:
            el = soup.select_one(sel)
            if el:
                title = el.get_text().strip()
                break
                
        # Company
        company = ""
        for sel in self.SELECTORS["company"]:
            el = soup.select_one(sel)
            if el:
                company = el.get_text().strip()
                break

        # Location
        location = ""
        for sel in self.SELECTORS["location"]:
            el = soup.select_one(sel)
            if el:
                location = el.get_text().strip()
                break

        # Salary
        salary = ""
        for sel in self.SELECTORS["salary"]:
            el = soup.select_one(sel)
            if el:
                salary = el.get_text().strip()
                break

        # Description
        desc = ""
        for sel in self.SELECTORS["description"]:
            el = soup.select_one(sel)
            if el:
                desc = el.get_text().strip()
                break

        # Posted Date
        posted = ""
        for sel in self.SELECTORS["posted_date"]:
            el = soup.select_one(sel)
            if el:
                posted = el.get_text().strip()
                break

        # Skills
        skills = []
        for sel in self.SELECTORS["skills"]:
            els = soup.select(sel)
            if els:
                skills = [e.get_text().strip() for e in els]
                break

        if not title and not desc:
            return None

        return RawJob(
            job_title=title or "Naukri Role",
            company_name=company or "Naukri Company",
            location=location or "India",
            salary=salary,
            job_description=desc or title,
            posted_date=posted,
            source_url=url,
            extra_fields={"skills": ",".join(skills)}
        )
