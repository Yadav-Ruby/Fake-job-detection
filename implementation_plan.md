# Graphura Job Scam & Fraud Detection - Implementation Guide & Phased Plan

This document serves as the guide for creating, running, and completing the Graphura Job Scam & Fraud Detection platform.

---

## 💻 Frontend Analysis & Current Status

### Status: **100% Completed & Operational**
We analyzed, renamed, and built the frontend module:
1. **Renamed Project**: Changed branding references from "TrueJob" and "ApplySafe" to **"Graphura Job Scam & Fraud Detection"** (or **"Graphura"**) in configuration files, package manifests, lay-outs, navbars, footers, and profile views.
2. **Build Success**: Installed and updated all dependency packages (`lucide-react`, `recharts`, `zustand`, `framer-motion`, etc.) and verified that Next.js 16 compiles and exports cleanly into a static directory (`frontend/out`).
3. **API Integration**: FastAPI now mounts `frontend/out` to serve the Next.js pages statically on `http://localhost:8000/`. All integration tests pass successfully.

---

## 🗓️ Phased Implementation Plan

### Phase 1: Database Schema & Architecture (Supabase)
- Deploy and configure the database schema inside the Supabase PostgreSQL console.
- **Key Tables**:
  - **`user_profiles`**: Linked to `auth.users` for platform moderation permissions (`user`, `admin`, `super_admin`).
  - **`companies`**: Holds company website URLs, domains, and trust metrics.
  - **`recruiters`**: Verifies recruiter details against corporate domains.
  - **`jobs`**: Main directory storing title, description, raw salary, and location.
  - **`risk_scores`**: Holds sub-component scoring outputs.
  - **`user_reports`**: Direct user-flagged scam reports.
  - **`keyword_dictionary`**: Weights for scam keywords.

### Phase 2: Scraper Development
- **Scraper A (Main Scraper)**: Scrapes jobs from LinkedIn, Internshala, NCS, and Shine.
  - **Verify Scam Page**: Accepts user URLs for real-time analysis.
  - **Job Directory Search**: Scrapes on-demand when users filter jobs by domain.
- **Scraper B (Inverse Scraper)**: Specifically targets known fraud/scam pages to gather scam records for training datasets.

> [!TIP]
> **Scraping Tool Suggestion (Playwright vs. BeautifulSoup):**
> - **BeautifulSoup** is lightweight and ideal for static pages (like simple directories or standard HTML job detail endpoints).
> - **Playwright** (with `playwright-stealth`) is required for Single Page Applications (SPA) and Javascript-hydrated apps like **NCS** and **Shine.com**, and for bypassing bot firewalls on portals like **LinkedIn**.
> - **Recommendation**: Use BeautifulSoup as the fast default for static links, but route React/SPA URLs through Playwright to ensure dynamic content is loaded.

### Phase 3: Data Collection & Preparation
- **Training Data**:
  - **Legitimate Jobs**: 28,000 pre-scraped clean job posts.
  - **Scam Jobs**: 5,000–12,000 posts collected using the **Inverse Scraper**.
- **Scraped Data**: Real-time inputs from URL scans and active company lookup tables.

### Phase 4: Model Training & Evaluation
- Clean description text using NLP pre-processing.
- Extract ~146 numeric/boolean features (description text TF-IDF, email matches, salary outliers).
- Train five classifiers: Naive Bayes, Isolation Forest, Logistic Regression, Random Forest, and XGBoost.
- Perform cross-validation and achieve Target F1 & Recall metrics > 0.85.

### Phase 5: Integration & Connection
- Connect Frontend pages with FastAPI middleware.
- Configure scoring formulas combining heuristic rule engines (40%) and ML predictors (60%).
