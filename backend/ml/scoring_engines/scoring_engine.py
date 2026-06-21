"""
scoring_engine.py  (UPDATED)
Core fraud detection engine with:
  - Dynamic keyword loading from Supabase keyword_dictionary table
  - User report impact scoring (crowdsourced signals)
  - Final score: 0-100

Score composition:
    Company trust       28%
    Recruiter verify    23%
    Social media risk   19%
    Keyword risk        15%
    Salary realism       8%
    User report impact   7%   ← NEW

Bonuses / penalties unchanged.
"""

import re
from dataclasses import dataclass, field
from typing import Optional


# ============================================================================
# CONFIGURATION
# ============================================================================

WEIGHTS = {
    "company":     0.28,
    "recruiter":   0.23,
    "social":      0.19,
    "keyword":     0.15,
    "salary":      0.08,
    "user_report": 0.07,   # NEW
}

GOVERNMENT_BONUS       = -20.0
SKILL_MISMATCH_PENALTY =  15.0

PLATFORM_TRUST_BONUS = {
    "Internshala":          -15.0,
    "LinkedIn":             -10.0,
    "Naukri":               -10.0,
    "Foundit":              -10.0,
    "Shine":                 -5.0,
    "NCS (Govt. of India)": -25.0,
}

PERSONAL_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "yahoo.in", "hotmail.com",
    "outlook.com", "rediffmail.com", "rediff.com",
    "live.com", "icloud.com", "protonmail.com",
    "yandex.com", "aol.com",
}

DISPOSABLE_EMAIL_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "tempmail.com",
    "throwaway.email", "yopmail.com", "sharklasers.com",
    "10minutemail.com", "trashmail.com", "fakeinbox.com",
    "maildrop.cc", "dispostable.com", "mintemail.com",
}


# ============================================================================
# KEYWORD CACHE  (loaded once from DB, fallback to built-in)
# ============================================================================

_keyword_cache: Optional[list[dict]] = None


def _load_keywords() -> list[dict]:
    """Load keywords from DB (cached). Falls back to seeder list."""
    global _keyword_cache
    if _keyword_cache is not None:
        return _keyword_cache

    try:
        from backend.ml.scoring_engines.keyword_dictionary_seeder import (
            get_keywords_from_db,
        )
        _keyword_cache = get_keywords_from_db()
    except Exception:
        from backend.ml.scoring_engines.keyword_dictionary_seeder import (
            KEYWORD_DICTIONARY,
        )
        _keyword_cache = KEYWORD_DICTIONARY

    return _keyword_cache


def refresh_keyword_cache() -> int:
    """Force-reload keywords from DB. Returns count."""
    global _keyword_cache
    _keyword_cache = None
    kws = _load_keywords()
    return len(kws)


# ============================================================================
# USER REPORT SCORING  (NEW)
# ============================================================================

def compute_user_report_score(
    source_url: str = "",
    company_name: str = "",
    sb_client=None,
) -> tuple[float, list[str]]:
    """
    Score based on crowdsourced user reports for a job/company.

    Logic:
        - Count verified/pending reports matching this URL or company name
        - Each verified report contributes more than a pending one
        - Capped at 100 (maps to 7% weight in final score)

    Returns:
        (raw_score 0-100, list of flag strings)
    """
    if not sb_client:
        try:
            from backend.storage.supabase_client import get_client
            sb_client = get_client()
        except Exception:
            return 0.0, []

    flags = []
    report_score = 0.0

    try:
        # Query by URL
        url_reports = []
        if source_url:
            res = (
                sb_client.table("user_reports")
                .select("status")
                .eq("job_url", source_url)
                .execute()
            )
            url_reports = res.data or []

        # Query by company name
        company_reports = []
        if company_name:
            res = (
                sb_client.table("user_reports")
                .select("status")
                .ilike("company_name", f"%{company_name.strip()}%")
                .execute()
            )
            company_reports = res.data or []

        all_reports = url_reports + company_reports

        verified_count = sum(1 for r in all_reports if r.get("status") == "reviewed")
        pending_count  = sum(1 for r in all_reports if r.get("status") == "pending")

        # Scoring: verified reports are stronger signal
        report_score += verified_count * 25.0   # each verified = +25
        report_score += pending_count  * 10.0   # each pending  = +10
        report_score  = min(100.0, report_score)

        if verified_count > 0:
            flags.append(
                f"{verified_count} verified user report(s) flagged this job"
            )
        if pending_count > 0:
            flags.append(
                f"{pending_count} pending user report(s) exist for this job"
            )

    except Exception as e:
        flags.append(f"Could not fetch user reports: {e}")

    return round(report_score, 2), flags


# ============================================================================
# DATA STRUCTURE
# ============================================================================

@dataclass
class ScoreBreakdown:
    """Detailed breakdown for explainable AI."""
    company_risk_raw:     float = 0.0
    recruiter_risk_raw:   float = 0.0
    social_risk_raw:      float = 0.0
    keyword_risk_raw:     float = 0.0
    salary_risk_raw:      float = 0.0
    user_report_risk_raw: float = 0.0      # NEW

    company_risk_weighted:     float = 0.0
    recruiter_risk_weighted:   float = 0.0
    social_risk_weighted:      float = 0.0
    keyword_risk_weighted:     float = 0.0
    salary_risk_weighted:      float = 0.0
    user_report_risk_weighted: float = 0.0  # NEW

    total_score: float = 0.0
    risk_level:  str   = "Safe"

    risk_factors:     list = field(default_factory=list)
    positive_factors: list = field(default_factory=list)
    matched_keywords: list = field(default_factory=list)

    government_bonus_applied:  bool = False
    mismatch_penalty_applied:  bool = False
    platform_bonus_applied:    bool = False
    user_reports_found:        bool = False  # NEW


# ============================================================================
# MAIN SCORING FUNCTION
# ============================================================================

def compute_fraud_score(
    job: dict,
    company_trust:   float = 50.0,
    recruiter_verif: float = 30.0,
    is_government:   bool  = False,
    skill_mismatch:  bool  = False,
    platform_name:   str   = "",
    source_url:      str   = "",
    company_name:    str   = "",
    sb_client=None,
) -> ScoreBreakdown:
    """
    Compute fraud score (0-100) with user report integration.

    New params vs old version:
        source_url:  Job URL (for user report lookup)
        company_name: Company name (for user report lookup)
        sb_client:   Supabase client (optional; auto-fetched if None)
    """
    b   = ScoreBreakdown()
    kws = _load_keywords()

    desc                 = (job.get("job_description") or "").lower()
    salary_raw           = (job.get("salary_raw")       or "").lower()
    email_domain         = (job.get("email_domain")     or "").lower()
    is_suspicious_salary = job.get("is_suspicious_salary", False)

    # ------------------------------------------------------------------
    # Category 1: Company risk
    # ------------------------------------------------------------------
    b.company_risk_raw      = max(0.0, 100.0 - company_trust)
    b.company_risk_weighted = b.company_risk_raw * WEIGHTS["company"]

    if company_trust < 10:
        b.risk_factors.append("Company domain does not exist")
    elif company_trust < 30:
        b.risk_factors.append("Company has no verifiable online presence")
    elif company_trust < 50:
        b.risk_factors.append("Limited company verification data")
    elif company_trust >= 80:
        b.positive_factors.append("Highly verified company")

    # ------------------------------------------------------------------
    # Category 2: Recruiter risk
    # ------------------------------------------------------------------
    b.recruiter_risk_raw = max(0.0, 100.0 - recruiter_verif)

    if email_domain in DISPOSABLE_EMAIL_DOMAINS:
        b.recruiter_risk_raw = min(100.0, b.recruiter_risk_raw + 30.0)
        b.risk_factors.append(f"Disposable email address ({email_domain})")
    elif email_domain in PERSONAL_EMAIL_DOMAINS:
        b.recruiter_risk_raw = min(100.0, b.recruiter_risk_raw + 15.0)
        b.risk_factors.append(f"Personal email contact ({email_domain})")
    elif email_domain and "." in email_domain:
        b.positive_factors.append(f"Corporate email used ({email_domain})")

    b.recruiter_risk_weighted = b.recruiter_risk_raw * WEIGHTS["recruiter"]

    if recruiter_verif < 20:
        b.risk_factors.append("Recruiter identity cannot be verified")
    elif recruiter_verif >= 80:
        b.positive_factors.append("Recruiter verified (corporate email + LinkedIn)")

    # ------------------------------------------------------------------
    # Category 3: Social media risk
    # ------------------------------------------------------------------
    social_checks = [
        (r't\.me/|telegram\.me/|join.*telegram',        80.0, "Telegram contact in job description"),
        (r'wa\.me/|whatsapp|whats\s*app',               75.0, "WhatsApp contact in job description"),
        (r'instagram\.com/|dm.*insta|insta.*dm',        50.0, "Instagram DM as application channel"),
        (r'facebook\.com/|message.*facebook|fb\.com',   40.0, "Facebook message as application channel"),
    ]

    for pattern, penalty, label in social_checks:
        if re.search(pattern, desc):
            b.social_risk_raw = min(100.0, b.social_risk_raw + penalty)
            b.risk_factors.append(label)

    b.social_risk_weighted = b.social_risk_raw * WEIGHTS["social"]

    # ------------------------------------------------------------------
    # Category 4: Keyword risk  ← now DB-driven
    # ------------------------------------------------------------------
    matched_with_weight: list[tuple[str, float]] = []

    for kw_record in kws:
        phrase  = kw_record.get("keyword", "").lower().strip()
        weight  = float(kw_record.get("weight", 0.0))
        if not phrase:
            continue
        if phrase in desc:
            matched_with_weight.append((phrase, weight))
            b.matched_keywords.append(phrase)

    if matched_with_weight:
        # Positive keywords reduce raw score; negative weights are legitimate
        scam_matches   = [(p, w) for p, w in matched_with_weight if w > 0]
        legit_matches  = [(p, w) for p, w in matched_with_weight if w < 0]

        if scam_matches:
            max_severity = max(w for _, w in scam_matches)
            # Extra penalty for multiple matches
            multi_bonus  = min(20.0, len(scam_matches) * 4.0)
            b.keyword_risk_raw = min(100.0, max_severity + multi_bonus)

            top3 = sorted(scam_matches, key=lambda x: -x[1])[:3]
            for phrase, _ in top3:
                b.risk_factors.append(f'Suspicious phrase: "{phrase}"')

        if legit_matches:
            reduction = min(30.0, sum(abs(w) for _, w in legit_matches))
            b.keyword_risk_raw = max(0.0, b.keyword_risk_raw - reduction)
            b.positive_factors.append(
                f"{len(legit_matches)} professional/legitimate keywords detected"
            )

    b.keyword_risk_weighted = b.keyword_risk_raw * WEIGHTS["keyword"]

    # ------------------------------------------------------------------
    # Category 5: Salary risk
    # ------------------------------------------------------------------
    if is_suspicious_salary:
        b.salary_risk_raw = 80.0
        b.risk_factors.append("Unrealistic salary pattern detected")

    if re.search(r'earn\s+[\d,]+\s*(daily|per\s*day)', desc):
        b.salary_risk_raw = max(b.salary_risk_raw, 70.0)
        b.risk_factors.append("Unrealistic earnings claim in description")

    if "unlimited" in salary_raw or "uncapped" in salary_raw:
        b.salary_risk_raw = max(b.salary_risk_raw, 50.0)

    b.salary_risk_weighted = b.salary_risk_raw * WEIGHTS["salary"]

    # ------------------------------------------------------------------
    # Category 6: User Report impact  ← NEW
    # ------------------------------------------------------------------
    ur_score, ur_flags = compute_user_report_score(
        source_url=source_url or job.get("source_url", ""),
        company_name=company_name or job.get("company_name", ""),
        sb_client=sb_client,
    )
    b.user_report_risk_raw      = ur_score
    b.user_report_risk_weighted = ur_score * WEIGHTS["user_report"]

    if ur_flags:
        b.user_reports_found = True
        b.risk_factors.extend(ur_flags)

    # ------------------------------------------------------------------
    # Total
    # ------------------------------------------------------------------
    total = (
        b.company_risk_weighted      +
        b.recruiter_risk_weighted    +
        b.social_risk_weighted       +
        b.keyword_risk_weighted      +
        b.salary_risk_weighted       +
        b.user_report_risk_weighted
    )

    # Bonuses / penalties
    if is_government:
        total = max(0.0, total + GOVERNMENT_BONUS)
        b.government_bonus_applied = True
        b.positive_factors.append("Verified government portal (NCS)")

    if skill_mismatch:
        total = min(100.0, total + SKILL_MISMATCH_PENALTY)
        b.mismatch_penalty_applied = True
        b.risk_factors.append("Job title mentions skills not in description")

    if platform_name in PLATFORM_TRUST_BONUS:
        bonus = PLATFORM_TRUST_BONUS[platform_name]
        total = max(0.0, total + bonus)
        b.platform_bonus_applied = True
        if bonus <= -10:
            b.positive_factors.append(
                f"Verified platform trust adjustment ({platform_name})"
            )

    # Email domain final adjustment
    if email_domain:
        if email_domain in DISPOSABLE_EMAIL_DOMAINS:
            total += 20.0
        elif email_domain in PERSONAL_EMAIL_DOMAINS:
            total += 10.0
        elif company_trust >= 80:
            total -= 15.0
            b.positive_factors.append(f"Trusted corporate domain: {email_domain}")
        else:
            total -= 5.0

    b.total_score = round(min(100.0, max(0.0, total)), 2)
    b.risk_level  = compute_risk_level(b.total_score)

    # Deduplicate
    b.risk_factors     = list(dict.fromkeys(b.risk_factors))
    b.positive_factors = list(dict.fromkeys(b.positive_factors))

    return b


# ============================================================================
# HELPER FUNCTIONS (unchanged API)
# ============================================================================

def compute_risk_level(score: float) -> str:
    if score <= 20:  return "Safe"
    elif score <= 40: return "Low Risk"
    elif score <= 60: return "Medium Risk"
    elif score <= 80: return "High Risk"
    else:             return "Scam Likely"


def format_score_report(breakdown: ScoreBreakdown) -> str:
    risk_tag = {
        "Safe":        "[SAFE]  ",
        "Low Risk":    "[LOW]   ",
        "Medium Risk": "[MED]   ",
        "High Risk":   "[HIGH]  ",
        "Scam Likely": "[SCAM]  ",
    }.get(breakdown.risk_level, "[?]     ")

    lines = [
        f"\n{risk_tag}FRAUD SCORE: {breakdown.total_score}/100 ({breakdown.risk_level})",
        "=" * 60,
        "\nCATEGORY BREAKDOWN:",
        f"  Company Risk    : {breakdown.company_risk_raw:5.1f} x 28% = {breakdown.company_risk_weighted:5.2f}",
        f"  Recruiter Risk  : {breakdown.recruiter_risk_raw:5.1f} x 23% = {breakdown.recruiter_risk_weighted:5.2f}",
        f"  Social Risk     : {breakdown.social_risk_raw:5.1f} x 19% = {breakdown.social_risk_weighted:5.2f}",
        f"  Keyword Risk    : {breakdown.keyword_risk_raw:5.1f} x 15% = {breakdown.keyword_risk_weighted:5.2f}",
        f"  Salary Risk     : {breakdown.salary_risk_raw:5.1f} x  8% = {breakdown.salary_risk_weighted:5.2f}",
        f"  User Reports    : {breakdown.user_report_risk_raw:5.1f} x  7% = {breakdown.user_report_risk_weighted:5.2f}",
    ]

    if breakdown.risk_factors:
        lines.append("\nRISK FACTORS:")
        for f in breakdown.risk_factors:
            lines.append(f"  - {f}")

    if breakdown.positive_factors:
        lines.append("\nPOSITIVE FACTORS:")
        for f in breakdown.positive_factors:
            lines.append(f"  - {f}")

    if breakdown.matched_keywords:
        lines.append(f"\nMATCHED KEYWORDS: {', '.join(breakdown.matched_keywords[:5])}")

    if breakdown.government_bonus_applied:
        lines.append(f"\nGovernment bonus applied: {GOVERNMENT_BONUS}")
    if breakdown.mismatch_penalty_applied:
        lines.append(f"\nSkill mismatch penalty: +{SKILL_MISMATCH_PENALTY}")
    if breakdown.platform_bonus_applied:
        lines.append("\nPlatform trust bonus applied")
    if breakdown.user_reports_found:
        lines.append("\nUser report signals included in scoring")

    return "\n".join(lines)


def passes_keyword_rules(
    job_title: str,
    job_description: str,
    is_scam_scraper: bool = False,
) -> bool:
    """
    Rule-based keyword gate before ML processing.
    Now uses DB keywords for scam scraper checks.
    """
    title = (job_title or "").lower().strip()
    desc  = (job_description or "").lower().strip()

    if len(title) < 5 or len(desc) < 100:
        return False

    BLOCK_KEYWORDS = {
        "access denied", "captcha", "attention required",
        "security check", "page not found", "error 503",
        "gateway timeout", "internal server error",
        "robot", "blocked", "enable javascript",
    }
    for kw in BLOCK_KEYWORDS:
        if kw in title or kw in desc[:300]:
            return False

    if is_scam_scraper:
        # Use DB keywords (scam-positive ones) + hard-coded fallback
        try:
            db_scam_kws = {
                r["keyword"].lower()
                for r in _load_keywords()
                if float(r.get("weight", 0)) > 30.0
            }
        except Exception:
            db_scam_kws = set()

        FALLBACK_SCAM = {
            "part time", "data entry", "work from home",
            "whatsapp", "telegram", "typing", "copy paste",
            "earn daily", "weekly payout", "deposit",
            "registration fee", "processing fee", "fake job",
            "scam", "fraud", "form filling", "ad posting",
        }
        all_scam_kws = db_scam_kws | FALLBACK_SCAM
        return any(kw in title or kw in desc for kw in all_scam_kws)

    else:
        LEGIT_TITLE_KEYWORDS = {
            "developer", "engineer", "analyst", "manager",
            "intern", "designer", "executive", "associate",
            "consultant", "specialist", "admin", "lead",
            "architect", "officer", "writer", "representative",
            "coordinator", "scientist", "researcher", "director",
            "assistant", "accountant", "operator", "technician",
        }
        LEGIT_DESC_KEYWORDS = {
            "skills", "experience", "requirements",
            "responsibilities", "qualification", "eligibility",
            "role", "duties", "apply", "candidate", "knowledge",
            "salary", "stipend", "benefits", "location",
        }
        has_valid_title = any(tkw in title for tkw in LEGIT_TITLE_KEYWORDS)
        has_valid_desc  = any(dkw in desc  for dkw in LEGIT_DESC_KEYWORDS)
        return has_valid_title and has_valid_desc