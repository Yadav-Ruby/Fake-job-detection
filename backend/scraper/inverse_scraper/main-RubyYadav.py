"""
inverse_scraper/main.py
Master orchestrator for Graphura's inverse scraper to collect scam jobs for ML training.

Usage:
    python -m backend.scraper.inverse_scraper.main
"""

import asyncio
import random
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from decouple import config as env
from loguru import logger

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
            logger.warning(f"Unknown platform name: {name}")
            continue

        connector = connector_class({
            "JOBS_PER_QUERY": JOBS_PER_QUERY,
            "MIN_DELAY":      MIN_DELAY,
            "MAX_DELAY":      MAX_DELAY,
        })
        
        logger.info(f"\n{'-' * 70}")
        logger.info(f"Inverse Scraper Run: {connector.platform_name}")
        logger.info(f"{'-' * 70}")

        # 3. Generate and search URLs statically
        all_scam_links = []
        search_urls = connector.search_urls(KEYWORDS, "India")

        for s_url in search_urls:
            logger.info(f"   Searching (BS4): {s_url}")
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

    # Scraper iteration complete

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
