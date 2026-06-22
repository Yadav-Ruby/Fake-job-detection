"""
inverse_scraper/connectors/consumer_complaints.py
Connector targeting consumercomplaints.in to gather scam job records.
"""

import re
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseInverseConnector, RawScamJob

class ConsumerComplaintsConnector(BaseInverseConnector):
    """Scrapes fake jobs reported on consumercomplaints.in."""

    platform_name = "ConsumerComplaints"

    def search_urls(self, keywords: list[str]) -> list[str]:
        urls = []
        pages_to_scrape = int(self.config.get("PAGES_PER_KEYWORD", 10))
        for kw in keywords:
            query = kw.strip().replace(" ", "+")
            urls.append(f"https://www.consumercomplaints.in/?search={query}")
            for p in range(2, pages_to_scrape + 1):
                urls.append(f"https://www.consumercomplaints.in/page/{p}?search={query}")
        return urls

    def extract_scam_links(self, html: str) -> list[str]:
        soup = BeautifulSoup(html, "html.parser")
        links = []
        # consumercomplaints.in detail URLs always end with a slug followed by "-c[number]"
        for el in soup.find_all("a", href=True):
            href = el["href"]
            if re.search(r'-c\d+(\?|$)', href):
                if href.startswith("/"):
                    links.append(f"https://www.consumercomplaints.in{href}")
                elif "consumercomplaints.in" in href:
                    links.append(href)
        return list(dict.fromkeys(links))[:self.jobs_per_query]

    def extract_scam_data(self, html: str, url: str) -> Optional[RawScamJob]:
        soup = BeautifulSoup(html, "html.parser")
        
        # Selectors for consumercomplaints.in
        title_el = soup.select_one("h1, .complaint-title, .title, .header h1")
        desc_el = soup.select_one(".compl-text, .complaint-text, .text, .complaint-body, .complaint-content, div.body")
        
        if not title_el or not desc_el:
            title_el = soup.find("h1")
            desc_el = soup.find("p")
            
        if not title_el or not desc_el:
            return None
            
        title = title_el.get_text(strip=True)
        description = desc_el.get_text(separator="\n", strip=True)
        
        if len(description) < 50:
            return None
            
        # Clean title
        title = re.sub(r'^(Complaint|Warning|Scam|Grievance)\s+(about|on|against)\s+', '', title, flags=re.IGNORECASE)
        
        skills = []
        for s in ["data entry", "typing", "photoshop", "python", "excel", "remote", "delivery"]:
            if s in description.lower():
                skills.append(s.title())
                
        return RawScamJob(
            source_url=url,
            platform_name=self.platform_name,
            job_title=title,
            job_description=description,
            salary_raw="",
            skills=skills,
            is_scam=True
        )
