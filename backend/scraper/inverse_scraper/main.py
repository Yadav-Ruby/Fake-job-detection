"""
inverse_scraper/main.py
Master orchestrator for Graphura's inverse scraper to collect scam jobs for ML training.

Usage:
    python -m backend.scraper.inverse_scraper.main
"""

import backend.utils.patch_playwright
from backend.utils.antidetection import apply_antidetection
import asyncio
import random
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from decouple import config as env
from loguru import logger
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

from .connectors import INVERSE_CONNECTOR_REGISTRY
from backend.scraper.scraper_main.connectors import CONNECTOR_REGISTRY as STANDARD_CONNECTOR_REGISTRY
from backend.storage.supabase_client import get_client, insert_model_training_data

# ============================================================================
# CONFIGURATION
# ============================================================================

# Read keywords from environment, use scam keywords for standard scrapers or fallbacks
KEYWORDS_CONFIG   = env("INVERSE_KEYWORDS", default="part time,data entry,work from home,whatsapp,copy paste,typing,earn daily,fake job,scam,fraud")
KEYWORDS          = [k.strip() for k in KEYWORDS_CONFIG.split(",") if k.strip()]

JOBS_PER_QUERY    = int(env("JOBS_PER_QUERY", default=25))
MIN_DELAY         = float(env("MIN_DELAY", default=4))
MAX_DELAY         = float(env("MAX_DELAY", default=8))
ENABLED_PLATFORMS = [p.strip().lower() for p in env("ENABLED_PLATFORMS", default="linkedin,internshala,shine,ncs").split(",")]
HEADLESS_MODE     = env("HEADLESS_MODE", default="True").lower() == "true"

Path("logs").mkdir(exist_ok=True)

logger.remove()
logger.add(
    sys.stdout,
    format="<yellow>{time:HH:mm:ss}</yellow> | <level>{level: <8}</level> | {message}",
    level="INFO"
)
logger.add(
    "logs/inverse_scraper_{time:YYYY-MM-DD}.log",
    rotation="1 day",
    retention="7 days",
    level="DEBUG"
)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
]

VIEWPORT_POOL = [
    {"width": 1366, "height": 768},
    {"width": 1440, "height": 900},
    {"width": 1920, "height": 1080},
]


def fetch_html_static(url: str) -> Optional[str]:
    """Fetch HTML statically using HTTPX."""
    import httpx
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
    }
    try:
        with httpx.Client(headers=headers, follow_redirects=True, timeout=15.0) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                return resp.text
    except Exception as e:
        logger.debug(f"Static fetch failed for {url}: {e}")
    return None


async def main():
    """Run the inverse scrape pipeline."""
    start_time = datetime.now()
    logger.info("=" * 70)
    logger.info("GRAPHURA INVERSE SCRAPER - Starting")
    logger.info("=" * 70)
    logger.info(f"Targeting platforms: {', '.join(ENABLED_PLATFORMS)}")
    logger.info(f"Per query: {JOBS_PER_QUERY}")
    logger.info(f"Delays   : {MIN_DELAY}-{MAX_DELAY}s")
    logger.info("=" * 70)

    # 1. Connect to database
    try:
        sb = get_client()
        res = sb.table("model_training_data").select("id", count="exact").eq("is_scam", True).execute()
        initial_count = res.count or 0
        logger.info(f"Connected to database. Existing training scams: {initial_count}")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return

    saved_count = 0
    skipped_count = 0
    failed_count = 0

    # Initialize Playwright once
    playwright = None
    browser = None
    context = None
    
    try:
        from playwright.async_api import async_playwright
        playwright_cm = async_playwright()
        playwright = await playwright_cm.__aenter__()
        browser = await playwright.chromium.launch(
            headless=HEADLESS_MODE,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"]
        )
        context = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport=random.choice(VIEWPORT_POOL),
            locale="en-IN",
            timezone_id="Asia/Kolkata"
        )
        await apply_antidetection(context)
    except Exception as e:
        logger.warning(f"Playwright initialization failed ({e}). Running static-only mode.")

    # 2. Iterate through enabled platforms
    for name in ENABLED_PLATFORMS:
        connector_class = None
        is_standard = False
        
        if name in INVERSE_CONNECTOR_REGISTRY:
            connector_class = INVERSE_CONNECTOR_REGISTRY[name]
        elif name in STANDARD_CONNECTOR_REGISTRY:
            connector_class = STANDARD_CONNECTOR_REGISTRY[name]
            is_standard = True
            
        if not connector_class:
            logger.warning(f"Platform connector not found for: {name}. Skipping.")
            continue
            
        logger.info(f"Running platform: {name} (Standard={is_standard})")
        
        config = {
            "JOBS_PER_QUERY": JOBS_PER_QUERY,
            "PAGES_PER_KEYWORD": int(env("PAGES_PER_KEYWORD", default=10))
        }
        connector = connector_class(config)

        # Build search URLs
        if is_standard:
            search_urls = connector.search_urls(KEYWORDS, "India")
        else:
            search_urls = connector.search_urls(KEYWORDS)
            
        all_scam_links = []

        # 3. Gather Scam Links
        for s_url in search_urls:
            logger.info(f"Searching listings (BS4): {s_url}")
            html = fetch_html_static(s_url)
            links = []
            if html:
                try:
                    if is_standard:
                        links = connector.extract_job_links_bs4(html, s_url)
                    else:
                        links = connector.extract_scam_links(html)
                except Exception as e:
                    logger.debug(f"   BS4 search parse error: {e}")

            if not links and context:
                logger.info("   BS4 search failed/blocked. Trying Playwright fallback...")
                try:
                    search_page = await context.new_page()
                    await stealth_async(search_page)
                    await search_page.goto(s_url, wait_until="domcontentloaded", timeout=25000)
                    await asyncio.sleep(random.uniform(1.5, 3))
                    
                    if is_standard:
                        links = await connector.extract_job_links(search_page)
                    else:
                        html_content = await search_page.content()
                        links = connector.extract_scam_links(html_content)
                    await search_page.close()
                except Exception as e:
                    logger.debug(f"   Playwright search parse error: {e}")

            logger.info(f"   Found {len(links)} posts to process")
            all_scam_links.extend(links)
            await asyncio.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

        # Deduplicate links
        all_scam_links = list(dict.fromkeys(all_scam_links))
        
        # 4. Extract detail data and save to DB
        for url in all_scam_links:
            logger.info(f"Scraping scam detail: {url}")
            raw_job = None
            
            # BS4 static fetch
            html = fetch_html_static(url)
            if html:
                try:
                    if is_standard:
                        raw_job = connector.extract_job_data_bs4(html, url)
                    else:
                        raw_job = connector.extract_scam_data(html, url)
                except Exception as e:
                    logger.debug(f"   BS4 extract error: {e}")

            # Playwright fallback
            if not raw_job and context:
                logger.info("   BS4 detail scrape failed. Trying Playwright fallback...")
                try:
                    job_page = await context.new_page()
                    await stealth_async(job_page)
                    await job_page.goto(url, wait_until="domcontentloaded", timeout=25000)
                    await asyncio.sleep(random.uniform(1.5, 3))
                    
                    if is_standard:
                        raw_job = await connector.extract_job_data(job_page, url)
                    else:
                        html_content = await job_page.content()
                        raw_job = connector.extract_scam_data(html_content, url)
                    await job_page.close()
                except Exception as e:
                    logger.debug(f"   Playwright extract error: {e}")

            if not raw_job:
                logger.warning(f"   Could not extract data from {url}")
                failed_count += 1
                continue

            # Apply rule-based keyword filtering for scam scraper
            from backend.ml.scoring_engines.scoring_engine import passes_keyword_rules
            if not passes_keyword_rules(raw_job.job_title or "", raw_job.job_description or "", is_scam_scraper=True):
                logger.info(f"   Skipping job since it does not pass scam keyword rules: {raw_job.job_title[:40]}")
                skipped_count += 1
                continue

            # Save to model_training_data
            if is_standard:
                # Rule-based / Scoring evaluation to determine if it is a scam
                from backend.ml.scoring_engines.scoring_engine import compute_fraud_score
                from backend.ml.scoring_engines.company_trust import compute_company_trust
                from backend.ml.scoring_engines.recruiter_verifier import verify_recruiter
                from backend.ml.scoring_engines.location_normalizer import normalize_location
                from backend.ml.scoring_engines.salary_parser import parse_salary
                import re

                # Compute support scores for rule checking
                loc = normalize_location(raw_job.location or "")
                sal = parse_salary(raw_job.salary or "")
                co_intel = compute_company_trust(raw_job.company_name or "", 0, False)
                
                email = ""
                if raw_job.job_description:
                    match = re.search(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', raw_job.job_description)
                    email = match.group() if match else ""
                email_dom = email.split("@", 1)[1].lower().strip() if "@" in email else ""
                
                rec_score, _ = verify_recruiter(raw_job.recruiter_name or "", "", email_dom, "", co_intel.domain)
                
                scoring = compute_fraud_score(
                    job={
                        "job_description": raw_job.job_description or "",
                        "salary_raw": raw_job.salary or "",
                        "email_domain": email_dom,
                        "is_suspicious_salary": sal.is_suspicious,
                    },
                    company_trust=co_intel.trust_score,
                    recruiter_verif=rec_score,
                    is_government=False,
                    skill_mismatch=False,
                    platform_name=connector.platform_name,
                    source_url=url,
                    company_name=raw_job.company_name or "",

                )
                
                # Scam decision: score threshold or risk class
                is_scam_detected = (scoring.total_score >= 45.0 or scoring.risk_level in ("Medium Risk", "High Risk", "Scam Likely"))

                # Map RawJob to training record format
                skills_list = []
                skills_raw = raw_job.extra_fields.get("skills", "")
                if skills_raw:
                    skills_list = [s.strip() for s in skills_raw.split(",") if s.strip()]
                    
                record = {
                    "job_title": raw_job.job_title,
                    "job_description": raw_job.job_description,
                    "salary_raw": raw_job.salary,
                    "skills": skills_list,
                    "is_scam": is_scam_detected
                }
            else:
                # Map RawScamJob to training record format
                record = {
                    "job_title": raw_job.job_title,
                    "job_description": raw_job.job_description,
                    "salary_raw": raw_job.salary_raw,
                    "skills": raw_job.skills,
                    "is_scam": True
                }

            inserted = insert_model_training_data(record)
            if inserted:
                label_str = "SCAM" if record["is_scam"] else "CLEAN"
                logger.info(f"   Saved training {label_str}: {raw_job.job_title[:40]}")
                saved_count += 1
            else:
                logger.info(f"   Skipped/Duplicate training record: {raw_job.job_title[:40]}")
                skipped_count += 1

            await asyncio.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

    # Clean up browser
    if context:
        await context.close()
    if browser:
        await browser.close()
    if playwright:
        await playwright_cm.__aexit__(None, None, None)

    duration = (datetime.now() - start_time).total_seconds()
    logger.info("=" * 70)
    logger.info("INVERSE SCRAPER SUMMARY")
    logger.info("=" * 70)
    logger.info(f"Saved   : {saved_count}")
    logger.info(f"Skipped : {skipped_count}")
    logger.info(f"Failed  : {failed_count}")
    logger.info(f"Duration: {duration:.1f}s")
    logger.info("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
