"""
url_scraper.py
BeautifulSoup-based URL scraper to extract job details for live analysis.
Integrates official platform connectors (Internshala, LinkedIn, Shine, NCS)
for robust multi-platform extraction via static HTML parser fallback.
"""

import re
import httpx
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from loguru import logger

from backend.scraper.scraper_main.connectors import CONNECTOR_REGISTRY

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
]

def detect_platform_key(url: str) -> str:
    """Extract platform key mapping to CONNECTOR_REGISTRY."""
    domain = urlparse(url).netloc.lower()
    if "internshala" in domain:
        return "internshala"
    elif "linkedin" in domain:
        return "linkedin"
    elif "shine" in domain:
        return "shine"
    elif "ncs.gov" in domain:
        return "ncs"
    return "other"

async def scrape_job_url(url: str) -> dict:
    """
    Fetch the job URL statically via HTTP client and parse with BS4.
    Falls back to generic metadata/selector parsing.
    """
    logger.info(f"Scraping URL with BS4: {url}")
    platform_key = detect_platform_key(url)
    
    headers = {
        "User-Agent": USER_AGENTS[0],
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    
    try:
        async with httpx.AsyncClient(headers=headers, follow_redirects=True, timeout=25.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                raise Exception(f"HTTP {resp.status_code} received when fetching URL.")
            
            html = resp.text
            
            # Phase 1: Try matched connector using BS4 extraction
            if platform_key in CONNECTOR_REGISTRY:
                try:
                    logger.info(f"Using registered connector for {platform_key} to parse URL statically (BS4).")
                    connector_class = CONNECTOR_REGISTRY[platform_key]
                    connector = connector_class({})
                    if hasattr(connector, "extract_job_data_bs4"):
                        raw_job = connector.extract_job_data_bs4(html, url)
                        if raw_job:
                            return {
                                "job_title": raw_job.job_title or "Unknown Title",
                                "job_description": raw_job.job_description or "No description extracted.",
                                "company_name": raw_job.company_name or "Unknown Company",
                                "platform_name": connector.platform_name,
                                "salary_raw": raw_job.salary or "Not Specified",
                                "city": raw_job.location or "India",
                            }
                except Exception as conn_err:
                    logger.warning(f"Connector static parsing failed: {conn_err}. Falling back to generic parser.")
            
            # Phase 2: Generic Selector Fallback using BeautifulSoup
            soup = BeautifulSoup(html, "html.parser")
            
            # Title
            title = ""
            meta_title = soup.find("meta", property="og:title")
            if meta_title and meta_title.get("content"):
                title = meta_title.get("content").strip()
            else:
                title = soup.title.string if soup.title else ""
            
            if title:
                title = re.sub(r'\s*\|\s*.*$', '', title)
                title = re.sub(r'\s*-\s*.*$', '', title)
                title = title.strip()
            
            # Description
            description = ""
            meta_desc = soup.find("meta", property="og:description")
            if meta_desc and meta_desc.get("content"):
                description = meta_desc.get("content").strip()
            
            desc_selectors = [
                "#about_internship .text-container",
                ".description__text",
                ".job-description",
                ".job_description",
                "#job-description",
                ".desc",
                "main",
                "body"
            ]
            for selector in desc_selectors:
                elements = soup.select(selector)
                if elements:
                    text = elements[0].get_text()
                    if text and len(text.strip()) > len(description):
                        description = text.strip()
                        break
            
            # Company
            company = ""
            company_selectors = [
                ".company_name a",
                "company",
                ".company",
                ".topcard__org-name-link",
                "[class*='company']"
            ]
            for selector in company_selectors:
                elements = soup.select(selector)
                if elements:
                    text = elements[0].get_text()
                    if text:
                        company = text.strip()
                        break
            
            # Location
            location = ""
            loc_selectors = [
                ".location",
                "[class*='location']",
                ".location_link",
                ".topcard__flavor--bullet"
            ]
            for selector in loc_selectors:
                elements = soup.select(selector)
                if elements:
                    text = elements[0].get_text()
                    if text:
                        location = text.strip()
                        break
            
            # Salary
            salary = ""
            sal_selectors = [
                ".stipend",
                ".salary",
                "[class*='salary']",
                "[class*='stipend']"
            ]
            for selector in sal_selectors:
                elements = soup.select(selector)
                if elements:
                    text = elements[0].get_text()
                    if text:
                        salary = text.strip()
                        break
            
            return {
                "job_title": title or "Unknown Title",
                "job_description": description or "No description extracted.",
                "company_name": company or "Unknown Company",
                "platform_name": platform_key.capitalize(),
                "salary_raw": salary or "Not Specified",
                "city": location or "India",
            }
            
    except Exception as e:
        logger.error(f"Error scraping URL {url} with BS4: {e}")
        return {
            "job_title": "Scrape Failed",
            "job_description": f"Failed to retrieve page contents. Error: {str(e)}",
            "company_name": "Unknown",
            "platform_name": "Other",
            "salary_raw": "Not Specified",
            "city": "Unknown",
        }
