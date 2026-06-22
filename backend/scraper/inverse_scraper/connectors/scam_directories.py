"""
inverse_scraper/connectors/scam_directories.py
Connector targeting public fraud directories and complaint boards.
"""

import re
from typing import Optional
from bs4 import BeautifulSoup
from .base import BaseInverseConnector, RawScamJob

class ScamDirectoriesConnector(BaseInverseConnector):
    """Scrapes reported fake jobs from common aggregate warning directories."""

    platform_name = "ScamWarningsBoard"

    # Targets list of scam postings
    SEARCH_URL = "https://www.complaintboard.in/search.php?q=fake+job"

    def search_urls(self, keywords: list[str]) -> list[str]:
        # Return complaint board queries for job scams
        return [self.SEARCH_URL]

    def extract_scam_links(self, html: str) -> list[str]:
        soup = BeautifulSoup(html, "html.parser")
        links = []
        # Find links pointing to complaints
        for el in soup.find_all("a", href=True):
            href = el["href"]
            if "/complaints/com" in href or "/complaints/" in href:
                if href.startswith("/"):
                    links.append(f"https://www.complaintboard.in{href}")
                elif "complaintboard.in" in href:
                    links.append(href)
        return list(dict.fromkeys(links))[:self.jobs_per_query]

    def extract_scam_data(self, html: str, url: str) -> Optional[RawScamJob]:
        soup = BeautifulSoup(html, "html.parser")
        
        # Select title and description using complaint board selectors
        title_el = soup.select_one("h1, h2.complaint-title, .title")
        desc_el = soup.select_one(".complaint-text, .complaint_text, td.text")
        
        if not title_el or not desc_el:
            # Try to get raw headers/paragraphs
            title_el = soup.find("h1")
            desc_el = soup.find("p")
            
        if not title_el or not desc_el:
            return None
            
        title = title_el.get_text(strip=True)
        description = desc_el.get_text(separator="\n", strip=True)
        
        if len(description) < 50:
            return None
            
        # Clean title (remove common prefix/suffix like "Complaint about...")
        title = re.sub(r'^(Complaint|Warning|Scam)\s+(about|on)\s+', '', title, flags=re.IGNORECASE)
        
        # Try to parse skills if mentioned in text
        skills = []
        for s in ["data entry", "typing", "photoshop", "python", "excel"]:
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
