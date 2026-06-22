"""
connectors/career.py
Generic Careers Page connector to parse corporate /careers domains.
"""

import asyncio
from typing import Optional
from playwright.async_api import Page
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from .base import BaseConnector, RawJob


class CareerConnector(BaseConnector):
    platform_name = "Careers"

    # Search URL pointing to generic job boards or corporate directories
    SEARCH_URL = "https://www.google.com/search?q={keywords}+careers+india+jobs"

    SELECTORS = {
        "job_title": ["h1", "h2", ".job-title", ".title", ".career-title"],
        "company": [".company-name", ".company", "header img", "[class*='company']"],
        "location": [".location", ".loc", "[class*='location']"],
        "salary": [".salary", ".compensation", "[class*='salary']"],
        "description": [".job-description", ".description", ".jd", "#jobDescription", "[class*='description']"],
        "posted_date": [".posted-date", ".date", "[class*='posted']"],
        "skills": [".skills", ".requirements", "[class*='requirements'] li"],
    }

    def search_urls(self, keywords: list[str], location: str) -> list[str]:
        result = []
        for kw in keywords:
            slug = kw.strip().lower().replace(" ", "+")
            result.append(self.SEARCH_URL.format(keywords=slug))
        return result

    async def extract_job_links(self, page: Page) -> list[str]:
        # Google search results parsing to find corporate career domains
        try:
            await page.wait_for_selector("a[href*='/careers']", timeout=5000)
        except Exception:
            pass

        links = await page.eval_on_selector_all(
            "a[href*='/careers'], a[href*='/jobs/']",
            "els => [...new Set(els.map(e => e.href))]"
        )
        return [l for l in links if "google.com" not in l][:self.jobs_per_query]

    def extract_job_links_bs4(self, html: str, base_url: str) -> list[str]:
        soup = BeautifulSoup(html, "html.parser")
        links = []
        for el in soup.find_all("a", href=True):
            href = el["href"]
            if ("/careers" in href or "/jobs/" in href) and "google.com" not in href:
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

        # Derive domain from URL for company name if not found
        if not company:
            from urllib.parse import urlparse
            company = urlparse(url).netloc.replace("www.", "").split(".")[0].title()

        return RawJob(
            job_title=title or "Careers Job",
            company_name=company or "Corporate Site",
            location=location or "Remote",
            salary=salary,
            job_description=desc or title,
            posted_date=posted,
            source_url=url,
            extra_fields={"skills": ",".join(skills)}
        )
