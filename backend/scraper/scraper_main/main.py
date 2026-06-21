"""
main.py
Master orchestrator for Graphura's job scraper.

Pipeline per job:
    1. location_normalizer  -> Clean city/state
    2. skill_extractor      -> Extract skills from text
    3. salary_parser        -> Parse messy salary strings
    4. scoring_engine       -> Compute fraud score
    5. company_trust        -> Score company trust
    6. recruiter_verifier   -> Verify recruiter identity
    7. deduplicator         -> Prevent duplicates (hash + URL)
    8. supabase_client      -> Save to cloud database

Usage:
    python -m backend.scraper.main
"""

import backend.utils.patch_playwright
from backend.utils.antidetection import apply_antidetection
import asyncio
import hashlib
import random
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from decouple import config as env
from loguru import logger
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

from .connectors import CONNECTOR_REGISTRY
from .connectors.base import BaseConnector

from backend.ml.scoring_engines.location_normalizer import normalize_location
from backend.ml.scoring_engines.skill_extractor    import extract_skills, detect_skill_title_mismatch
from backend.ml.scoring_engines.salary_parser      import parse_salary
from backend.ml.scoring_engines.scoring_engine     import (
    compute_fraud_score,
    compute_risk_level,
    format_score_report,
    passes_keyword_rules,
)
from backend.ml.scoring_engines.company_trust      import compute_company_trust
from backend.ml.scoring_engines.recruiter_verifier import verify_recruiter
from backend.ml.scoring_engines.deduplicator       import make_job_hash, Deduplicator

from backend.storage.supabase_client import (
    get_client,
    upsert_company,
    upsert_recruiter,
    insert_job,
    get_existing_job_hashes,
    get_job_count,
)


# ============================================================================
# CONFIGURATION
# ============================================================================

HEADLESS_MODE     = env("HEADLESS_MODE", default="True").lower() == "true"
JOBS_PER_QUERY    = int(env("JOBS_PER_QUERY", default=25))
MIN_DELAY         = float(env("MIN_DELAY", default=4))
MAX_DELAY         = float(env("MAX_DELAY", default=8))
SEARCH_KEYWORDS   = [k.strip() for k in env("SEARCH_KEYWORDS", default="software engineer").split(",")]
SEARCH_LOCATION   = env("SEARCH_LOCATION", default="India")
ENABLED_PLATFORMS = [p.strip().lower() for p in env("ENABLED_PLATFORMS", default="internshala").split(",")]

Path("logs").mkdir(exist_ok=True)

logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | {message}",
    level="INFO"
)
logger.add(
    "logs/advanced_scraper_{time:YYYY-MM-DD}.log",
    rotation="1 day",
    retention="7 days",
    level="DEBUG"
)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
]

VIEWPORT_POOL = [
    {"width": 1366, "height": 768},
    {"width": 1440, "height": 900},
    {"width": 1536, "height": 864},
    {"width": 1920, "height": 1080},
]

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
    "temporarily unavailable",
    "rate limit exceeded",
]


# ============================================================================
# UTILITIES
# ============================================================================

def hash_email(email: str) -> str:
    """Convert email to SHA256 hash for GDPR compliance."""
    if not email or "@" not in email:
        return ""
    return "sha256:" + hashlib.sha256(email.lower().encode()).hexdigest()[:16]


def extract_email_domain(email: str) -> str:
    """Extract domain from email."""
    if not email or "@" not in email:
        return ""
    return email.split("@", 1)[1].lower().strip()


def extract_email_from_text(text: str) -> str:
    """Find first email in text."""
    if not text:
        return ""
    match = re.search(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', text)
    return match.group() if match else ""


def is_error_page(raw_job) -> bool:
    """Detect if scraped content is an error page rather than a real job."""
    title = (raw_job.job_title or "").lower().strip()
    desc  = (raw_job.job_description or "").lower().strip()

    if not title and not desc:
        return True

    for indicator in ERROR_PAGE_INDICATORS:
        if indicator in title or indicator in desc[:300]:
            return True

    if len(title) < 5:
        return True

    if len(desc) < 30:
        return True

    return False


def fetch_html_static(url: str) -> Optional[str]:
    """Helper to fetch HTML statically with custom headers to prevent blocks."""
    import httpx
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    try:
        with httpx.Client(headers=headers, follow_redirects=True, timeout=10.0) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                text = resp.text.lower()
                for indicator in ERROR_PAGE_INDICATORS:
                    if indicator in text:
                        logger.warning(f"Static fetch for {url} returned error page/captcha matching '{indicator}'")
                        return None
                return resp.text
            else:
                logger.warning(f"Static fetch for {url} returned HTTP {resp.status_code}")
    except Exception as e:
        logger.debug(f"Static fetch failed for {url}: {e}")
    return None


# ============================================================================
# JOB PROCESSING
# ============================================================================

async def process_single_job(
    raw_job,
    connector,
    deduplicator: Deduplicator,
    stats: dict,
) -> bool:
    """Process ONE scraped job through the entire pipeline."""
    try:
        if is_error_page(raw_job):
            logger.debug(f"Error page skipped: {raw_job.source_url}")
            stats["failed"] += 1
            return False

        # Apply rule-based keyword filtering for legit scraper
        if not passes_keyword_rules(raw_job.job_title or "", raw_job.job_description or "", is_scam_scraper=False):
            logger.info(f"Skipping job since it does not pass legit keyword rules: {raw_job.job_title[:40]} | URL: {raw_job.source_url}")
            stats["skipped"] += 1
            return False

        # Fast path: skip URL we have already seen
        if deduplicator.is_url_seen(raw_job.source_url):
            logger.debug(f"URL already in DB: {raw_job.source_url}")
            stats["skipped"] += 1
            return False

        location = normalize_location(raw_job.location or "")

        skill_data = extract_skills(
            title=raw_job.job_title or "",
            description=raw_job.job_description or ""
        )

        skill_mismatch = detect_skill_title_mismatch(
            title=raw_job.job_title or "",
            skills=skill_data["skills"],
        )

        salary = parse_salary(raw_job.salary or "")

        email = extract_email_from_text(raw_job.job_description or "")
        email_domain = extract_email_domain(email)
        email_h = hash_email(email)

        company_intel = compute_company_trust(
            company_name=raw_job.company_name or "",
            employee_count=0,
            has_linkedin=False,
        )

        recruiter_score, recruiter_flags = verify_recruiter(
            name=raw_job.recruiter_name or "",
            title=raw_job.recruiter_title or "",
            email_domain=email_domain,
            linkedin_url="",
            company_domain=company_intel.domain,
        )

        is_government = bool(raw_job.extra_fields.get("is_government", False))

        job_for_scoring = {
            "job_description":      raw_job.job_description or "",
            "salary_raw":           raw_job.salary or "",
            "email_domain":         email_domain,
            "is_suspicious_salary": salary.is_suspicious,
        }
        
        score_breakdown = compute_fraud_score(
            job=job_for_scoring,
            company_trust=company_intel.trust_score,
            recruiter_verif=recruiter_score,
            is_government=is_government,
            skill_mismatch=skill_mismatch,
            platform_name=connector.platform_name,
            source_url=raw_job.source_url,        
            company_name=raw_job.company_name or "", 
        )

        job_hash = make_job_hash(
            company=raw_job.company_name or "",
            title=raw_job.job_title or "",
            city=location.city,
            salary_raw=raw_job.salary or "",
        )

        if deduplicator.is_duplicate(job_hash):
            logger.debug(f"Duplicate hash: {raw_job.job_title[:40]}")
            stats["skipped"] += 1
            return False

        company_id = upsert_company(
            name=raw_job.company_name or "Unknown",
            intel=company_intel,
        )

        recruiter_id = upsert_recruiter(
            name=raw_job.recruiter_name or "",
            title=raw_job.recruiter_title or "",
            email_domain=email_domain,
            email_hash=email_h,
            linkedin_url="",
            verification_score=recruiter_score,
            verification_flags=recruiter_flags,
        )

        job_quality = max(0, 100 - score_breakdown.total_score)

        job_record = {
            "job_hash":              job_hash,
            "job_title":             raw_job.job_title or "Unknown",
            "company_id":            company_id,
            "recruiter_id":          recruiter_id,
            "city":                  location.city,
            "state":                 location.state,
            "country":               location.country,
            "location_raw":          raw_job.location or "",
            "mode":                  raw_job.mode or "Unknown",
            "salary_min":            salary.min_amount,
            "salary_max":            salary.max_amount,
            "salary_raw":            raw_job.salary or "",
            "job_description":       raw_job.job_description or "",
            "skills_required":       skill_data["skills"],
            "skill_count":           skill_data["skill_count"],
            "skill_categories":      skill_data["skill_categories"],
            "scam_score":            score_breakdown.total_score,
            "scam_risk_level":       score_breakdown.risk_level,
            "risk_factors":          score_breakdown.risk_factors,
            "job_quality_score":     job_quality,
            "source_url":            raw_job.source_url,
            "platform_name":         connector.platform_name,
            "posted_date":           raw_job.posted_date or "",
            "social_media_mentions": "",
        }

        inserted = insert_job(job_record)

        if inserted:
            # Mark BOTH the content hash AND the URL as seen
            deduplicator.mark_seen(job_hash, url=raw_job.source_url)
            stats["saved"] += 1

            risk_tag = {
                "Safe":        "[SAFE]  ",
                "Low Risk":    "[LOW]   ",
                "Medium Risk": "[MED]   ",
                "High Risk":   "[HIGH]  ",
                "Scam Likely": "[SCAM]  ",
            }.get(score_breakdown.risk_level, "[?]     ")

            logger.info(
                f"{risk_tag}[{connector.platform_name}] "
                f"{raw_job.job_title[:40]:40s} | "
                f"Score: {score_breakdown.total_score:5.1f} | "
                f"{score_breakdown.risk_level}"
            )

            if score_breakdown.risk_level in ("High Risk", "Scam Likely"):
                stats["high_risk"] += 1
                logger.warning(f"   Flags: {', '.join(score_breakdown.risk_factors[:3])}")

            return True
        else:
            # Insert failed (likely DB conflict). Mark URL seen to avoid retrying.
            deduplicator.mark_url_seen(raw_job.source_url)
            stats["failed"] += 1
            return False

    except Exception as e:
        logger.error(f"Error processing job {raw_job.source_url}: {e}")
        stats["failed"] += 1
        return False


# ============================================================================
# PLATFORM SCRAPING
# ============================================================================

async def scrape_platform(
    connector: BaseConnector,
    deduplicator: Deduplicator,
    playwright,
) -> dict:
    """Scrape one platform using its connector."""
    stats = {
        "platform":  connector.platform_name,
        "saved":     0,
        "skipped":   0,
        "failed":    0,
        "high_risk": 0,
    }

    browser = None
    context = None

    if playwright:
        try:
            browser = await playwright.chromium.launch(
                headless=HEADLESS_MODE,
                args=[
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--lang=en-IN",
                ]
            )

            # If the connector exposes a custom fingerprint (e.g. LinkedIn rotation),
            # use it. Otherwise fall back to random pool selection here.
            if hasattr(connector, "get_browser_fingerprint"):
                fp = connector.get_browser_fingerprint()
                context = await browser.new_context(
                    user_agent  = fp.get("user_agent",  random.choice(USER_AGENTS)),
                    viewport    = fp.get("viewport",    random.choice(VIEWPORT_POOL)),
                    locale      = fp.get("locale",      "en-IN"),
                    timezone_id = fp.get("timezone_id", "Asia/Kolkata"),
                )
            else:
                context = await browser.new_context(
                    user_agent  = random.choice(USER_AGENTS),
                    viewport    = random.choice(VIEWPORT_POOL),
                    locale      = "en-IN",
                    timezone_id = "Asia/Kolkata",
                )
        except Exception as e:
            logger.warning(f"Failed to launch browser: {e}. Falling back to static scraping.")
            browser = None
            context = None

    try:
        if context:
            # Apply anti-detection stealth system
            await apply_antidetection(context)
            # Warm-up
            warmup = await context.new_page()
            await stealth_async(warmup)
            await connector.pre_search_hook(warmup)
            await warmup.close()

        # Phase 1: Collect URLs
        all_job_urls = []
        search_urls = connector.search_urls(SEARCH_KEYWORDS, SEARCH_LOCATION)

        for search_url in search_urls:
            logger.info(f"[{connector.platform_name}] Searching (BS4): {search_url}")
            links = []
            html = fetch_html_static(search_url)
            if html:
                try:
                    links = connector.extract_job_links_bs4(html, search_url)
                except Exception as e:
                    logger.debug(f"   BS4 search parse error: {e}")
            
            if links:
                logger.info(f"   [BS4] Found {len(links)} jobs")
                all_job_urls.extend(links)
            else:
                if context:
                    logger.info(f"   [BS4] Failed/No links. Falling back to Playwright...")
                    search_page = await context.new_page()
                    try:
                        await stealth_async(search_page)
                        await search_page.goto(
                            search_url,
                            wait_until="domcontentloaded",
                            timeout=30000
                        )
                        await asyncio.sleep(random.uniform(2, 4))

                        links = await connector.extract_job_links(search_page)
                        logger.info(f"   [Playwright] Found {len(links)} jobs")
                        all_job_urls.extend(links)

                    except Exception as e:
                        logger.warning(f"   Search failed: {e}")

                    finally:
                        await search_page.close()
                else:
                    logger.warning(f"   [BS4] Failed/No links. Playwright not available.")

            await asyncio.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

        # Deduplicate URLs in batch and filter ones already in DB
        unique_urls = list(dict.fromkeys(all_job_urls))
        before_filter = len(unique_urls)
        unique_urls = [u for u in unique_urls if not deduplicator.is_url_seen(u)]
        filtered_out = before_filter - len(unique_urls)

        unique_urls = unique_urls[:JOBS_PER_QUERY * len(SEARCH_KEYWORDS)]

        logger.info(
            f"[{connector.platform_name}] Processing {len(unique_urls)} new URLs "
            f"(filtered {filtered_out} already-seen)"
        )
        stats["skipped"] += filtered_out

        # Phase 2: Process each job
        for i, url in enumerate(unique_urls, 1):
            raw_job = None
            
            # Try BeautifulSoup first
            html = fetch_html_static(url)
            if html:
                try:
                    raw_job = connector.extract_job_data_bs4(html, url)
                    if raw_job:
                        logger.info(f"   [BS4] Scraped successfully: {url}")
                except Exception as e:
                    logger.debug(f"   BS4 job parse error: {e}")
                    
            # Fallback to Playwright if BS4 failed
            if raw_job is None:
                if context:
                    logger.info(f"   [BS4] Failed/Blocked. Falling back to Playwright for: {url}")
                    job_page = await context.new_page()
                    try:
                        await stealth_async(job_page)
                        await job_page.goto(
                            url,
                            wait_until="domcontentloaded",
                            timeout=25000
                        )
                        await asyncio.sleep(random.uniform(1.5, 3))

                        raw_job = await connector.extract_job_data(job_page, url)
                        await connector.post_extract_hook(job_page)

                    except Exception as e:
                        logger.warning(f"   Job error: {e}")
                    finally:
                        await job_page.close()
                else:
                    logger.warning(f"   [BS4] Failed/Blocked. Playwright not available for: {url}")
                    stats["failed"] += 1
                    continue

            if raw_job is None:
                logger.debug(f"   No data extracted (both BS4 & Playwright failed): {url}")
                stats["failed"] += 1
                continue

            await process_single_job(raw_job, connector, deduplicator, stats)
            await asyncio.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()

    return stats


# ============================================================================
# MAIN ORCHESTRATOR
# ============================================================================

async def main():
    """Run the entire scrape pipeline."""
    start_time = datetime.now()

    logger.info("=" * 70)
    logger.info("GRAPHURA SCRAPER - Starting")
    logger.info("=" * 70)
    logger.info(f"Platforms : {', '.join(ENABLED_PLATFORMS)}")
    logger.info(f"Keywords  : {', '.join(SEARCH_KEYWORDS)}")
    logger.info(f"Per query : {JOBS_PER_QUERY}")
    logger.info(f"Delays    : {MIN_DELAY}-{MAX_DELAY}s")
    logger.info(f"Headless  : {HEADLESS_MODE}")
    logger.info("=" * 70)

    # Connect to Supabase
    try:
        sb = get_client()
        initial_count = get_job_count()
        logger.info(f"Supabase connected. Jobs in DB: {initial_count}")
    except Exception as e:
        logger.error(f"Supabase connection failed: {e}")
        return

    # Load existing hashes AND URLs into a single deduplicator
    deduplicator = Deduplicator()
    loaded_hashes = deduplicator.load_from_supabase(sb)
    loaded_urls   = deduplicator.load_urls_from_supabase(sb)
    logger.info(f"Loaded {loaded_hashes} hashes and {loaded_urls} URLs for dedup")

    # Run scrapers
    all_stats = []

    playwright = None
    playwright_ctx = None
    try:
        playwright_ctx = async_playwright()
        playwright = await playwright_ctx.__aenter__()
    except Exception as e:
        logger.warning(f"Playwright initialization failed/bypassed (expected on path syntax): {e}")
        playwright = None

    try:
        for platform_key in ENABLED_PLATFORMS:
            if platform_key not in CONNECTOR_REGISTRY:
                logger.warning(f"Unknown platform: {platform_key}")
                continue

            connector_class = CONNECTOR_REGISTRY[platform_key]
            connector = connector_class({
                "JOBS_PER_QUERY": JOBS_PER_QUERY,
                "MIN_DELAY":      MIN_DELAY,
                "MAX_DELAY":      MAX_DELAY,
            })

            logger.info(f"\n{'-' * 70}")
            logger.info(f"Starting: {connector.platform_name}")
            logger.info(f"{'-' * 70}")

            try:
                stats = await scrape_platform(connector, deduplicator, playwright)
                all_stats.append(stats)
            except Exception as e:
                logger.error(f"Platform {platform_key} crashed: {e}")
                all_stats.append({
                    "platform":  platform_key,
                    "saved":     0,
                    "skipped":   0,
                    "failed":    0,
                    "high_risk": 0,
                })
    finally:
        if playwright_ctx and playwright:
            await playwright_ctx.__aexit__(None, None, None)

    # Final report
    duration = (datetime.now() - start_time).total_seconds()
    final_count = get_job_count()

    logger.info("\n" + "=" * 70)
    logger.info("SCRAPE SUMMARY")
    logger.info("=" * 70)

    total_saved = 0
    total_skipped = 0
    total_failed = 0
    total_high_risk = 0

    for s in all_stats:
        logger.info(
            f"  {s['platform']:25s} | "
            f"Saved: {s['saved']:4d} | "
            f"Skipped: {s['skipped']:4d} | "
            f"Failed: {s['failed']:4d} | "
            f"High-risk: {s['high_risk']:3d}"
        )
        total_saved     += s["saved"]
        total_skipped   += s["skipped"]
        total_failed    += s["failed"]
        total_high_risk += s["high_risk"]

    logger.info("-" * 70)
    logger.info(
        f"  {'TOTAL':25s} | "
        f"Saved: {total_saved:4d} | "
        f"Skipped: {total_skipped:4d} | "
        f"Failed: {total_failed:4d} | "
        f"High-risk: {total_high_risk:3d}"
    )

    logger.info(f"\nDuration: {duration:.1f}s")
    logger.info(f"DB: {initial_count} -> {final_count} ({final_count - initial_count:+d} new)")

    deduplicator.print_stats()

    logger.info("\n" + "=" * 70)
    logger.info("Scraping complete")
    logger.info("=" * 70)


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    asyncio.run(main())