# backend/intelligence/intelligence_engine.py

import ssl
import socket
from datetime import datetime

try:
    import whois
except ImportError:
    whois = None


class IntelligenceEngine:

    FREE_EMAIL_DOMAINS = {
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
        "protonmail.com",
        "icloud.com",
        "aol.com",
        "zoho.com"
    }

    # ==================================================
    # EMAIL HELPERS
    # ==================================================

    @staticmethod
    def extract_email_domain(email):
        try:
            return email.split("@")[1].lower().strip()
        except Exception:
            return ""

    # ==================================================
    # WHOIS CHECKER
    # ==================================================

    @staticmethod
    def get_domain_info(domain):
        if whois is None:
            return {
                "success": False,
                "error": "python-whois not installed"
            }

        try:
            data = whois.whois(domain)
            creation_date = data.creation_date

            if isinstance(creation_date, list):
                creation_date = creation_date[0]

            age_days = 0
            if creation_date:
                age_days = (datetime.now() - creation_date).days

            return {
                "success": True,
                "domain": domain,
                "registrar": data.registrar,
                "creation_date": str(creation_date),
                "domain_age_days": age_days
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    # ==================================================
    # SSL CHECKER
    # ==================================================

    @staticmethod
    def check_ssl(domain):
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=5.0) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as secure_sock:
                    cert = secure_sock.getpeercert()

            expiry = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
            days_remaining = (expiry - datetime.utcnow()).days

            return {
                "ssl_valid": True,
                "expiry_date": str(expiry),
                "days_remaining": days_remaining
            }
        except Exception as e:
            return {
                "ssl_valid": False,
                "days_remaining": 0,
                "error": str(e)
            }

    # ==================================================
    # DOMAIN ANALYZER
    # ==================================================

    @classmethod
    def analyze_domain(cls, domain):
        whois_data = cls.get_domain_info(domain)
        ssl_data = cls.check_ssl(domain)

        domain_age = whois_data.get("domain_age_days", 0)
        ssl_valid = ssl_data.get("ssl_valid", False)

        trust_score = 0

        # Domain Age Score
        if domain_age > 3650:
            trust_score += 60
        elif domain_age > 1825:
            trust_score += 50
        elif domain_age > 365:
            trust_score += 40
        elif domain_age > 180:
            trust_score += 20
        else:
            trust_score += 5

        # SSL Score
        if ssl_valid:
            trust_score += 40

        trust_score = min(trust_score, 100)

        return {
            "domain": domain,
            "registrar": whois_data.get("registrar"),
            "domain_age_days": domain_age,
            "ssl_valid": ssl_valid,
            "ssl_days_remaining": ssl_data.get("days_remaining", 0),
            "domain_trust_score": trust_score
        }

    # ==================================================
    # RECRUITER VERIFIER
    # ==================================================

    @classmethod
    def verify_recruiter(
        cls,
        recruiter_email,
        company_domain,
        domain_age_days,
        ssl_valid,
        blacklisted=False
    ):
        email_domain = cls.extract_email_domain(recruiter_email)

        # -----------------------------
        # Domain Match Score
        # -----------------------------
        if email_domain == company_domain:
            domain_match_score = 100
        elif company_domain and company_domain in email_domain:
            domain_match_score = 60
        else:
            domain_match_score = 0

        # -----------------------------
        # Email Reputation
        # -----------------------------
        if email_domain in cls.FREE_EMAIL_DOMAINS:
            email_reputation_score = 30
        else:
            email_reputation_score = 100

        # -----------------------------
        # Domain Age
        # -----------------------------
        if domain_age_days >= 3650:
            domain_age_score = 100
        elif domain_age_days >= 1825:
            domain_age_score = 90
        elif domain_age_days >= 365:
            domain_age_score = 70
        elif domain_age_days >= 180:
            domain_age_score = 50
        elif domain_age_days >= 30:
            domain_age_score = 30
        else:
            domain_age_score = 10

        # -----------------------------
        # SSL Score
        # -----------------------------
        ssl_score = 100 if ssl_valid else 20

        # -----------------------------
        # Blacklist Score
        # -----------------------------
        blacklist_score = 0 if blacklisted else 100

        # -----------------------------
        # Final Recruiter Score
        # -----------------------------
        recruiter_score = (
            domain_match_score * 0.40 +
            email_reputation_score * 0.20 +
            domain_age_score * 0.15 +
            ssl_score * 0.15 +
            blacklist_score * 0.10
        )

        recruiter_score = round(recruiter_score, 2)

        if recruiter_score >= 80:
            status = "verified"
        elif recruiter_score >= 60:
            status = "likely_genuine"
        elif recruiter_score >= 30:
            status = "suspicious"
        else:
            status = "high_risk"

        return {
            "trust_score": recruiter_score,
            "status": status,
            "domain_match": domain_match_score,
            "email_reputation": email_reputation_score,
            "domain_age_score": domain_age_score,
            "ssl_score": ssl_score,
            "blacklist_score": blacklist_score
        }
