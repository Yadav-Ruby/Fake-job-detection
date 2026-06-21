"""
keyword_dictionary_seeder.py
Seeds the keyword_dictionary table in Supabase with comprehensive
scam keywords: unigrams, bigrams, trigrams, and n-grams.

Run once:
    python -m backend.ml.scoring_engines.keyword_dictionary_seeder
"""

from backend.storage.supabase_client import get_client
from loguru import logger


# ============================================================================
# COMPREHENSIVE KEYWORD DICTIONARY
# Categories:
#   payment_scam      - Fee/deposit demands
#   earning_scam      - Unrealistic income claims
#   urgency_tactics   - Pressure/urgency language
#   social_media_scam - WhatsApp/Telegram/Instagram hiring
#   crypto_mlm        - Crypto, MLM, pyramid schemes
#   vague_offer       - No experience, anyone can apply
#   identity_risk     - Suspicious recruiter signals
#   positive_signal   - NEGATIVE weight (legitimate markers)
# ============================================================================

KEYWORD_DICTIONARY = [

    # =========================================================================
    # PAYMENT SCAM - Fee demands (highest severity)
    # =========================================================================
    # Unigrams
    {"keyword": "deposit",               "weight": 70.0, "category": "payment_scam"},
    {"keyword": "fee",                   "weight": 40.0, "category": "payment_scam"},
    {"keyword": "charges",               "weight": 30.0, "category": "payment_scam"},
    {"keyword": "payment",               "weight": 25.0, "category": "payment_scam"},
    {"keyword": "refundable",            "weight": 50.0, "category": "payment_scam"},
    {"keyword": "non-refundable",        "weight": 80.0, "category": "payment_scam"},

    # Bigrams
    {"keyword": "registration fee",      "weight": 95.0, "category": "payment_scam"},
    {"keyword": "joining fee",           "weight": 92.0, "category": "payment_scam"},
    {"keyword": "training fee",          "weight": 90.0, "category": "payment_scam"},
    {"keyword": "application fee",       "weight": 88.0, "category": "payment_scam"},
    {"keyword": "processing fee",        "weight": 85.0, "category": "payment_scam"},
    {"keyword": "course fee",            "weight": 75.0, "category": "payment_scam"},
    {"keyword": "security deposit",      "weight": 80.0, "category": "payment_scam"},
    {"keyword": "caution deposit",       "weight": 80.0, "category": "payment_scam"},
    {"keyword": "advance payment",       "weight": 82.0, "category": "payment_scam"},
    {"keyword": "pay first",             "weight": 85.0, "category": "payment_scam"},
    {"keyword": "upfront payment",       "weight": 85.0, "category": "payment_scam"},
    {"keyword": "initial payment",       "weight": 78.0, "category": "payment_scam"},
    {"keyword": "kit charges",           "weight": 80.0, "category": "payment_scam"},
    {"keyword": "material charges",      "weight": 75.0, "category": "payment_scam"},
    {"keyword": "id charges",            "weight": 85.0, "category": "payment_scam"},
    {"keyword": "card charges",          "weight": 80.0, "category": "payment_scam"},
    {"keyword": "uniform charges",       "weight": 75.0, "category": "payment_scam"},

    # Trigrams
    {"keyword": "pay to apply",               "weight": 95.0, "category": "payment_scam"},
    {"keyword": "pay to work",                "weight": 95.0, "category": "payment_scam"},
    {"keyword": "pay to register",            "weight": 95.0, "category": "payment_scam"},
    {"keyword": "pay to get job",             "weight": 98.0, "category": "payment_scam"},
    {"keyword": "refundable security deposit","weight": 82.0, "category": "payment_scam"},
    {"keyword": "fully refundable deposit",   "weight": 80.0, "category": "payment_scam"},
    {"keyword": "one time fee",               "weight": 78.0, "category": "payment_scam"},
    {"keyword": "small registration fee",     "weight": 92.0, "category": "payment_scam"},
    {"keyword": "nominal registration fee",   "weight": 92.0, "category": "payment_scam"},
    {"keyword": "only registration fee",      "weight": 93.0, "category": "payment_scam"},
    {"keyword": "training and placement fee", "weight": 88.0, "category": "payment_scam"},
    {"keyword": "interview registration fee", "weight": 96.0, "category": "payment_scam"},

    # =========================================================================
    # EARNING SCAM - Unrealistic income claims
    # =========================================================================
    # Unigrams
    {"keyword": "guaranteed",            "weight": 45.0, "category": "earning_scam"},
    {"keyword": "unlimited",             "weight": 55.0, "category": "earning_scam"},
    {"keyword": "uncapped",              "weight": 50.0, "category": "earning_scam"},

    # Bigrams
    {"keyword": "earn daily",            "weight": 80.0, "category": "earning_scam"},
    {"keyword": "daily income",          "weight": 75.0, "category": "earning_scam"},
    {"keyword": "daily earnings",        "weight": 75.0, "category": "earning_scam"},
    {"keyword": "daily payment",         "weight": 72.0, "category": "earning_scam"},
    {"keyword": "earn weekly",           "weight": 70.0, "category": "earning_scam"},
    {"keyword": "weekly payout",         "weight": 68.0, "category": "earning_scam"},
    {"keyword": "weekly payment",        "weight": 65.0, "category": "earning_scam"},
    {"keyword": "unlimited earning",     "weight": 80.0, "category": "earning_scam"},
    {"keyword": "unlimited income",      "weight": 80.0, "category": "earning_scam"},
    {"keyword": "guaranteed income",     "weight": 75.0, "category": "earning_scam"},
    {"keyword": "guaranteed salary",     "weight": 70.0, "category": "earning_scam"},
    {"keyword": "guaranteed earnings",   "weight": 72.0, "category": "earning_scam"},
    {"keyword": "guaranteed placement",  "weight": 65.0, "category": "earning_scam"},
    {"keyword": "passive income",        "weight": 60.0, "category": "earning_scam"},
    {"keyword": "residual income",       "weight": 60.0, "category": "earning_scam"},
    {"keyword": "instant money",         "weight": 75.0, "category": "earning_scam"},
    {"keyword": "instant cash",          "weight": 75.0, "category": "earning_scam"},
    {"keyword": "easy money",            "weight": 72.0, "category": "earning_scam"},
    {"keyword": "quick money",           "weight": 70.0, "category": "earning_scam"},
    {"keyword": "make money",            "weight": 55.0, "category": "earning_scam"},
    {"keyword": "extra income",          "weight": 45.0, "category": "earning_scam"},
    {"keyword": "side income",           "weight": 40.0, "category": "earning_scam"},
    {"keyword": "part time income",      "weight": 45.0, "category": "earning_scam"},

    # Trigrams / n-grams
    {"keyword": "earn from home",              "weight": 65.0, "category": "earning_scam"},
    {"keyword": "work from home earn",         "weight": 70.0, "category": "earning_scam"},
    {"keyword": "earn money from home",        "weight": 72.0, "category": "earning_scam"},
    {"keyword": "earn without investment",     "weight": 78.0, "category": "earning_scam"},
    {"keyword": "earn per day",                "weight": 75.0, "category": "earning_scam"},
    {"keyword": "earn 50000 per day",          "weight": 95.0, "category": "earning_scam"},
    {"keyword": "lakh per day",                "weight": 95.0, "category": "earning_scam"},
    {"keyword": "lakh per week",               "weight": 92.0, "category": "earning_scam"},
    {"keyword": "100 percent job guarantee",   "weight": 75.0, "category": "earning_scam"},
    {"keyword": "100% job guarantee",          "weight": 75.0, "category": "earning_scam"},
    {"keyword": "job guarantee after training","weight": 70.0, "category": "earning_scam"},
    {"keyword": "guaranteed job after course", "weight": 72.0, "category": "earning_scam"},
    {"keyword": "no limit on earnings",        "weight": 80.0, "category": "earning_scam"},
    {"keyword": "sky is the limit",            "weight": 65.0, "category": "earning_scam"},

    # =========================================================================
    # URGENCY TACTICS - Pressure language
    # =========================================================================
    # Bigrams
    {"keyword": "urgent hiring",         "weight": 35.0, "category": "urgency_tactics"},
    {"keyword": "urgent requirement",    "weight": 35.0, "category": "urgency_tactics"},
    {"keyword": "immediate joining",     "weight": 30.0, "category": "urgency_tactics"},
    {"keyword": "immediate vacancy",     "weight": 32.0, "category": "urgency_tactics"},
    {"keyword": "limited seats",         "weight": 40.0, "category": "urgency_tactics"},
    {"keyword": "limited slots",         "weight": 40.0, "category": "urgency_tactics"},
    {"keyword": "hurry up",              "weight": 45.0, "category": "urgency_tactics"},
    {"keyword": "apply immediately",     "weight": 35.0, "category": "urgency_tactics"},
    {"keyword": "last chance",           "weight": 50.0, "category": "urgency_tactics"},
    {"keyword": "today only",            "weight": 55.0, "category": "urgency_tactics"},
    {"keyword": "closing soon",          "weight": 35.0, "category": "urgency_tactics"},
    {"keyword": "seats filling",         "weight": 45.0, "category": "urgency_tactics"},
    {"keyword": "first come",            "weight": 35.0, "category": "urgency_tactics"},
    {"keyword": "act fast",              "weight": 50.0, "category": "urgency_tactics"},
    {"keyword": "don't miss",            "weight": 45.0, "category": "urgency_tactics"},
    {"keyword": "do not miss",           "weight": 45.0, "category": "urgency_tactics"},

    # Trigrams
    {"keyword": "apply now or never",         "weight": 65.0, "category": "urgency_tactics"},
    {"keyword": "limited seats available",     "weight": 50.0, "category": "urgency_tactics"},
    {"keyword": "seats filling up fast",       "weight": 55.0, "category": "urgency_tactics"},
    {"keyword": "only few seats left",         "weight": 52.0, "category": "urgency_tactics"},
    {"keyword": "immediate joining required",  "weight": 38.0, "category": "urgency_tactics"},
    {"keyword": "walk in interview tomorrow",  "weight": 30.0, "category": "urgency_tactics"},
    {"keyword": "last day to apply",           "weight": 35.0, "category": "urgency_tactics"},

    # =========================================================================
    # SOCIAL MEDIA SCAM - Informal hiring channels
    # =========================================================================
    # Unigrams
    {"keyword": "whatsapp",              "weight": 65.0, "category": "social_media_scam"},
    {"keyword": "telegram",              "weight": 70.0, "category": "social_media_scam"},

    # Bigrams
    {"keyword": "apply whatsapp",        "weight": 85.0, "category": "social_media_scam"},
    {"keyword": "whatsapp resume",       "weight": 85.0, "category": "social_media_scam"},
    {"keyword": "whatsapp number",       "weight": 70.0, "category": "social_media_scam"},
    {"keyword": "telegram channel",      "weight": 78.0, "category": "social_media_scam"},
    {"keyword": "telegram group",        "weight": 75.0, "category": "social_media_scam"},
    {"keyword": "join telegram",         "weight": 72.0, "category": "social_media_scam"},
    {"keyword": "apply telegram",        "weight": 85.0, "category": "social_media_scam"},
    {"keyword": "dm instagram",          "weight": 72.0, "category": "social_media_scam"},
    {"keyword": "instagram dm",          "weight": 72.0, "category": "social_media_scam"},
    {"keyword": "message facebook",      "weight": 65.0, "category": "social_media_scam"},
    {"keyword": "facebook message",      "weight": 65.0, "category": "social_media_scam"},
    {"keyword": "contact whatsapp",      "weight": 80.0, "category": "social_media_scam"},

    # Trigrams
    {"keyword": "contact hr on whatsapp",   "weight": 90.0, "category": "social_media_scam"},
    {"keyword": "send cv on whatsapp",      "weight": 90.0, "category": "social_media_scam"},
    {"keyword": "send resume on whatsapp",  "weight": 90.0, "category": "social_media_scam"},
    {"keyword": "apply on telegram",        "weight": 88.0, "category": "social_media_scam"},
    {"keyword": "join our telegram group",  "weight": 82.0, "category": "social_media_scam"},
    {"keyword": "join our telegram channel","weight": 80.0, "category": "social_media_scam"},
    {"keyword": "dm us on instagram",       "weight": 78.0, "category": "social_media_scam"},
    {"keyword": "apply via whatsapp",       "weight": 88.0, "category": "social_media_scam"},
    {"keyword": "call or whatsapp",         "weight": 75.0, "category": "social_media_scam"},
    {"keyword": "whatsapp for more details","weight": 72.0, "category": "social_media_scam"},
    {"keyword": "message us on facebook",   "weight": 68.0, "category": "social_media_scam"},

    # =========================================================================
    # CRYPTO / MLM / PYRAMID SCHEMES
    # =========================================================================
    # Unigrams
    {"keyword": "mlm",                   "weight": 80.0, "category": "crypto_mlm"},
    {"keyword": "pyramid",               "weight": 85.0, "category": "crypto_mlm"},
    {"keyword": "forex",                 "weight": 65.0, "category": "crypto_mlm"},
    {"keyword": "cryptocurrency",        "weight": 60.0, "category": "crypto_mlm"},
    {"keyword": "bitcoin",               "weight": 70.0, "category": "crypto_mlm"},

    # Bigrams
    {"keyword": "network marketing",     "weight": 68.0, "category": "crypto_mlm"},
    {"keyword": "direct selling",        "weight": 60.0, "category": "crypto_mlm"},
    {"keyword": "crypto trading",        "weight": 72.0, "category": "crypto_mlm"},
    {"keyword": "bitcoin trading",       "weight": 75.0, "category": "crypto_mlm"},
    {"keyword": "forex trading",         "weight": 70.0, "category": "crypto_mlm"},
    {"keyword": "binary options",        "weight": 80.0, "category": "crypto_mlm"},
    {"keyword": "chain marketing",       "weight": 80.0, "category": "crypto_mlm"},
    {"keyword": "refer earn",            "weight": 60.0, "category": "crypto_mlm"},
    {"keyword": "recruit earn",          "weight": 72.0, "category": "crypto_mlm"},
    {"keyword": "downline commission",   "weight": 80.0, "category": "crypto_mlm"},
    {"keyword": "upline downline",       "weight": 82.0, "category": "crypto_mlm"},
    {"keyword": "team building",         "weight": 35.0, "category": "crypto_mlm"},

    # Trigrams
    {"keyword": "multi level marketing",      "weight": 78.0, "category": "crypto_mlm"},
    {"keyword": "pyramid scheme",             "weight": 95.0, "category": "crypto_mlm"},
    {"keyword": "earn by referring others",   "weight": 75.0, "category": "crypto_mlm"},
    {"keyword": "earn per referral",          "weight": 70.0, "category": "crypto_mlm"},
    {"keyword": "recruit and earn",           "weight": 75.0, "category": "crypto_mlm"},
    {"keyword": "bring more people earn",     "weight": 78.0, "category": "crypto_mlm"},
    {"keyword": "no trading experience needed","weight": 70.0, "category": "crypto_mlm"},

    # =========================================================================
    # VAGUE OFFER - Suspiciously low bar / no qualification needed
    # =========================================================================
    # Bigrams
    {"keyword": "no experience",         "weight": 25.0, "category": "vague_offer"},
    {"keyword": "anyone apply",          "weight": 30.0, "category": "vague_offer"},
    {"keyword": "no qualification",      "weight": 35.0, "category": "vague_offer"},
    {"keyword": "no degree",             "weight": 30.0, "category": "vague_offer"},
    {"keyword": "any qualification",     "weight": 30.0, "category": "vague_offer"},
    {"keyword": "fresher welcome",       "weight": 10.0, "category": "vague_offer"},
    {"keyword": "copy paste",            "weight": 60.0, "category": "vague_offer"},
    {"keyword": "data entry",            "weight": 30.0, "category": "vague_offer"},
    {"keyword": "form filling",          "weight": 55.0, "category": "vague_offer"},
    {"keyword": "ad posting",            "weight": 65.0, "category": "vague_offer"},
    {"keyword": "link posting",          "weight": 65.0, "category": "vague_offer"},
    {"keyword": "sms sending",           "weight": 70.0, "category": "vague_offer"},
    {"keyword": "typing work",           "weight": 55.0, "category": "vague_offer"},
    {"keyword": "simple typing",         "weight": 58.0, "category": "vague_offer"},
    {"keyword": "online typing",         "weight": 60.0, "category": "vague_offer"},
    {"keyword": "part time",             "weight": 20.0, "category": "vague_offer"},
    {"keyword": "home based",            "weight": 25.0, "category": "vague_offer"},
    {"keyword": "work anywhere",         "weight": 20.0, "category": "vague_offer"},

    # Trigrams
    {"keyword": "no experience needed",           "weight": 28.0, "category": "vague_offer"},
    {"keyword": "no experience required",         "weight": 28.0, "category": "vague_offer"},
    {"keyword": "experience not required",        "weight": 28.0, "category": "vague_offer"},
    {"keyword": "10th 12th pass",                 "weight": 30.0, "category": "vague_offer"},
    {"keyword": "10th pass can apply",            "weight": 32.0, "category": "vague_offer"},
    {"keyword": "anyone can apply",               "weight": 32.0, "category": "vague_offer"},
    {"keyword": "freshers can apply",             "weight": 12.0, "category": "vague_offer"},
    {"keyword": "work from mobile",               "weight": 70.0, "category": "vague_offer"},
    {"keyword": "work from phone",                "weight": 70.0, "category": "vague_offer"},
    {"keyword": "work on mobile",                 "weight": 68.0, "category": "vague_offer"},
    {"keyword": "simple online work",             "weight": 65.0, "category": "vague_offer"},
    {"keyword": "easy online work",               "weight": 65.0, "category": "vague_offer"},
    {"keyword": "part time work from home",       "weight": 45.0, "category": "vague_offer"},
    {"keyword": "home based data entry",          "weight": 65.0, "category": "vague_offer"},
    {"keyword": "online data entry work",         "weight": 60.0, "category": "vague_offer"},
    {"keyword": "no investment required",         "weight": 50.0, "category": "vague_offer"},
    {"keyword": "without any investment",         "weight": 52.0, "category": "vague_offer"},

    # =========================================================================
    # IDENTITY RISK - Suspicious recruiter signals
    # =========================================================================
    # Bigrams
    {"keyword": "personal email",        "weight": 35.0, "category": "identity_risk"},
    {"keyword": "gmail contact",         "weight": 40.0, "category": "identity_risk"},
    {"keyword": "yahoo contact",         "weight": 40.0, "category": "identity_risk"},
    {"keyword": "share aadhar",          "weight": 75.0, "category": "identity_risk"},
    {"keyword": "share pan",             "weight": 70.0, "category": "identity_risk"},
    {"keyword": "bank details",          "weight": 75.0, "category": "identity_risk"},
    {"keyword": "account details",       "weight": 72.0, "category": "identity_risk"},
    {"keyword": "otp share",             "weight": 90.0, "category": "identity_risk"},
    {"keyword": "share otp",             "weight": 90.0, "category": "identity_risk"},
    {"keyword": "verify account",        "weight": 65.0, "category": "identity_risk"},
    {"keyword": "activate account",      "weight": 60.0, "category": "identity_risk"},

    # Trigrams
    {"keyword": "share your bank details",    "weight": 90.0, "category": "identity_risk"},
    {"keyword": "share your aadhar card",     "weight": 85.0, "category": "identity_risk"},
    {"keyword": "share your pan card",        "weight": 82.0, "category": "identity_risk"},
    {"keyword": "send your otp",             "weight": 95.0, "category": "identity_risk"},
    {"keyword": "share the otp",             "weight": 95.0, "category": "identity_risk"},
    {"keyword": "pay after getting job",     "weight": 80.0, "category": "identity_risk"},
    {"keyword": "money back guarantee",      "weight": 65.0, "category": "identity_risk"},

    # =========================================================================
    # POSITIVE SIGNALS - Legitimate job markers (NEGATIVE weight = reduces score)
    # =========================================================================
    # Bigrams
    {"keyword": "health insurance",      "weight": -20.0, "category": "positive_signal"},
    {"keyword": "provident fund",        "weight": -20.0, "category": "positive_signal"},
    {"keyword": "professional development","weight": -15.0,"category": "positive_signal"},
    {"keyword": "career growth",         "weight": -12.0, "category": "positive_signal"},
    {"keyword": "annual bonus",          "weight": -15.0, "category": "positive_signal"},
    {"keyword": "performance bonus",     "weight": -15.0, "category": "positive_signal"},
    {"keyword": "stock options",         "weight": -18.0, "category": "positive_signal"},
    {"keyword": "learning budget",       "weight": -15.0, "category": "positive_signal"},
    {"keyword": "mentorship program",    "weight": -15.0, "category": "positive_signal"},
    {"keyword": "structured training",   "weight": -12.0, "category": "positive_signal"},
    {"keyword": "competitive salary",    "weight": -10.0, "category": "positive_signal"},
    {"keyword": "interview process",     "weight": -15.0, "category": "positive_signal"},
    {"keyword": "background check",      "weight": -10.0, "category": "positive_signal"},
    {"keyword": "offer letter",          "weight": -12.0, "category": "positive_signal"},
    {"keyword": "employment contract",   "weight": -15.0, "category": "positive_signal"},

    # Trigrams
    {"keyword": "apply via careers page",        "weight": -20.0, "category": "positive_signal"},
    {"keyword": "apply through official website", "weight": -20.0, "category": "positive_signal"},
    {"keyword": "equal opportunity employer",     "weight": -18.0, "category": "positive_signal"},
    {"keyword": "esop equity options",            "weight": -18.0, "category": "positive_signal"},
    {"keyword": "health insurance family",        "weight": -22.0, "category": "positive_signal"},
    {"keyword": "gratuity provident fund",        "weight": -22.0, "category": "positive_signal"},
    {"keyword": "interview scheduled after",      "weight": -15.0, "category": "positive_signal"},
    {"keyword": "no charges no fee",              "weight": -25.0, "category": "positive_signal"},
    {"keyword": "completely free to apply",       "weight": -25.0, "category": "positive_signal"},
    {"keyword": "zero registration fee",          "weight": -25.0, "category": "positive_signal"},
]


# ============================================================================
# SEEDER FUNCTION
# ============================================================================

def seed_keyword_dictionary(clear_existing: bool = False) -> dict:
    """
    Seed the keyword_dictionary table.

    Args:
        clear_existing: If True, truncate table before inserting.
                        WARNING: Destructive operation.

    Returns:
        dict with inserted/skipped/failed counts
    """
    sb = get_client()
    stats = {"inserted": 0, "skipped": 0, "failed": 0}

    print("=" * 70)
    print("KEYWORD DICTIONARY SEEDER")
    print("=" * 70)
    print(f"Total keywords to seed: {len(KEYWORD_DICTIONARY)}")

    if clear_existing:
        try:
            sb.table("keyword_dictionary").delete().neq("id", 0).execute()
            print("Cleared existing keywords.")
        except Exception as e:
            print(f"Warning: Could not clear table: {e}")

    # Batch upsert in chunks of 50
    chunk_size = 50
    chunks = [
        KEYWORD_DICTIONARY[i:i + chunk_size]
        for i in range(0, len(KEYWORD_DICTIONARY), chunk_size)
    ]

    for chunk in chunks:
        try:
            result = (
                sb.table("keyword_dictionary")
                .upsert(chunk, on_conflict="keyword")
                .execute()
            )
            stats["inserted"] += len(result.data) if result.data else 0
        except Exception as e:
            logger.warning(f"Chunk insert failed: {e}")
            # Try one by one
            for kw_record in chunk:
                try:
                    existing = (
                        sb.table("keyword_dictionary")
                        .select("id")
                        .eq("keyword", kw_record["keyword"])
                        .limit(1)
                        .execute()
                    )
                    if existing.data:
                        stats["skipped"] += 1
                        continue
                    sb.table("keyword_dictionary").insert(kw_record).execute()
                    stats["inserted"] += 1
                except Exception as inner:
                    logger.warning(f"Failed to insert '{kw_record['keyword']}': {inner}")
                    stats["failed"] += 1

    print(f"\nResults:")
    print(f"  Inserted : {stats['inserted']}")
    print(f"  Skipped  : {stats['skipped']}")
    print(f"  Failed   : {stats['failed']}")
    print("=" * 70)

    return stats


def get_keywords_from_db() -> list[dict]:
    """
    Fetch all keywords from the keyword_dictionary table.

    Returns:
        List of dicts: [{"keyword": str, "weight": float, "category": str}]
    """
    sb = get_client()
    try:
        result = sb.table("keyword_dictionary").select("*").execute()
        return result.data or []
    except Exception as e:
        logger.warning(f"Could not fetch keywords from DB: {e}. Using built-in list.")
        return KEYWORD_DICTIONARY


def get_scam_keywords_only() -> list[dict]:
    """Return only scam-signal keywords (positive weight)."""
    keywords = get_keywords_from_db()
    return [k for k in keywords if k.get("weight", 0) > 0]


def get_positive_keywords_only() -> list[dict]:
    """Return only legitimate-signal keywords (negative weight)."""
    keywords = get_keywords_from_db()
    return [k for k in keywords if k.get("weight", 0) < 0]


if __name__ == "__main__":
    seed_keyword_dictionary(clear_existing=False)