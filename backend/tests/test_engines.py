"""
test_engines.py
Unit tests for Graphura scraper processing engines.
"""

import unittest
from backend.ml.scoring_engines.recruiter_verifier import verify_recruiter
from backend.ml.scoring_engines.salary_parser import parse_salary
from backend.ml.scoring_engines.location_normalizer import normalize_location
from backend.ml.scoring_engines.scoring_engine import passes_keyword_rules

class TestEngines(unittest.TestCase):

    def test_recruiter_verifier(self):
        # Test high trust recruiter
        score, flags = verify_recruiter(
            name="John Doe",
            title="HR Manager",
            email_domain="corporate.com",
            linkedin_url="https://linkedin.com/in/johndoe",
            company_domain="corporate.com"
        )
        self.assertGreaterEqual(score, 60)
        
        # Test low trust / scam generic recruiter
        score_scam, flags_scam = verify_recruiter(
            name="HR Team",
            title="",
            email_domain="gmail.com",
            linkedin_url="",
            company_domain=""
        )
        self.assertLess(score_scam, 40)
        self.assertTrue("personal_email" in flags_scam or "generic_name" in flags_scam)

    def test_salary_parser(self):
        # Test standard monthly salary (annualized: 25k * 12 = 300k)
        res = parse_salary("Rs. 25,000 / month")
        self.assertEqual(res.min_amount, 300000.0)
        self.assertEqual(res.max_amount, 300000.0)
        self.assertFalse(res.is_suspicious)
        
        # Test high suspicious salary
        res_susp = parse_salary("Earn 50000 daily")
        self.assertTrue(res_susp.is_suspicious)

    def test_passes_keyword_rules(self):
        # Test legit job posting
        legit_title = "Python Software Engineer Intern"
        legit_desc = "We are looking for a Python developer intern. Requirements: knowledge of Python, django/flask, and database skills."
        self.assertTrue(passes_keyword_rules(legit_title, legit_desc, is_scam_scraper=False))
        self.assertFalse(passes_keyword_rules(legit_title, legit_desc, is_scam_scraper=True))

        # Test scam job posting
        scam_title = "Work from home part time data entry job"
        scam_desc = "Earn daily 2000 to 5000 INR from home. Apply on WhatsApp. No qualification needed, simple copy paste or typing work."
        self.assertTrue(passes_keyword_rules(scam_title, scam_desc, is_scam_scraper=True))
        self.assertFalse(passes_keyword_rules(scam_title, scam_desc, is_scam_scraper=False))

    def test_location_normalizer(self):
        loc = normalize_location("Delhi NCR, India")
        self.assertTrue(loc.city in ["Delhi", "New Delhi"])
        self.assertEqual(loc.country, "India")

if __name__ == "__main__":
    unittest.main()
