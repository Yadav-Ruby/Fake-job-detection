"""
train_models.py
Train multiple ML models for job fraud detection.
Usage: python -m backend.ml.train_models
"""

import json
import random
import numpy as np
import pandas as pd
from pathlib import Path
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    roc_auc_score,
    f1_score,
)
from sklearn.preprocessing import StandardScaler

import xgboost as xgb

from .feature_extractor import (
    build_feature_dataframe,
    extract_labels,
)
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# ============================================================================
# CONFIGURATION
# ============================================================================

MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)


# ============================================================================
# SYNTHETIC SCAM DATA GENERATION
# ============================================================================

SCAM_TEMPLATES = [
    """
    URGENT HIRING! {role} position available!
    Earn Rs {amount} {period} working from home!
    No experience needed. Anyone can apply!
    Pay just Rs {fee} registration fee to confirm your slot.
    Limited seats available! Hurry up!
    Contact us on WhatsApp: +91-{phone}
    Or join our Telegram channel: t.me/jobchannel{num}
    Send your resume to: hr{num}@gmail.com
    """,
    """
    Looking for {role}! Network marketing opportunity!
    Unlimited earning potential. Guaranteed salary Rs {amount}/month.
    Direct selling experience preferred but not required.
    Pay refundable security deposit of Rs {fee}.
    100% job guarantee after training.
    DM us on Instagram or WhatsApp +91-{phone}
    """,
    """
    {role} needed for bitcoin trading firm!
    Earn lakhs per week! Forex trading expertise.
    No experience required. We provide free training (Rs {fee} fee applies).
    Apply on Telegram: t.me/cryptojobs{num}
    Email: trading{num}@yahoo.com
    """,
    """
    Urgent {role} required for MLM business!
    Pyramid structure with unlimited income.
    Earn daily by recruiting others.
    Limited slots! Last chance to join!
    Initial investment: Rs {fee} (refundable)
    Guaranteed monthly income: Rs {amount}
    Contact HR on WhatsApp: +91-{phone}
    """,
    """
    {role} position! Immediate joining!
    Pay Rs {fee} training fee to get certified.
    100% job placement guarantee after training.
    Stipend during training: Rs {amount}
    Apply now or never! Limited seats!
    WhatsApp: +91-{phone}
    Telegram: t.me/training{num}
    Email: training{num}@gmail.com
    """,
]

SCAM_ROLES = [
    "Data Entry Operator", "Customer Support", "Marketing Executive",
    "Business Development", "Telecaller", "Receptionist",
    "Computer Operator", "Office Assistant", "Sales Representative",
]


def generate_synthetic_scam(num: int) -> dict:
    template = random.choice(SCAM_TEMPLATES)
    role = random.choice(SCAM_ROLES)

    description = template.format(
        role=role,
        amount=random.choice(["50,000", "1,00,000", "75,000", "2,00,000"]),
        period=random.choice(["daily", "weekly", "per day"]),
        fee=random.choice(["500", "999", "1500", "2500", "5000"]),
        phone=random.randint(9000000000, 9999999999),
        num=num,
    )

    return {
        "job_title": f"{role} - Urgent Hiring!!!",
        "job_description": description.strip(),
        "skills_required": [],
        "skill_categories": {},
        "salary_min": 0,
        "salary_max": random.choice([0, 50000000, 100000000]),
        "salary_raw": random.choice([
            "Earn 50k daily", "Unlimited", "Best in industry",
            "Rs 1 lakh per week", "Negotiable"
        ]),
        "city": random.choice(["Remote", "Anywhere", "Pan India", ""]),
        "state": "",
        "country": "India",
        "mode": "Remote",
        "platform_name": random.choice([
            "Unknown", "Random Site", "FakeSite.com", ""
        ]),
        "company_name": random.choice([
            "ABC IT Solutions Pvt Ltd",
            "XYZ Consultancy Services",
            "Tech Solutions Group",
            "ABC Software Solutions",
        ]),
        "scam_score": random.uniform(80, 99),
        "scam_risk_level": "Scam Likely",
        "company_trust_score": random.uniform(5, 20),
        "recruiter_verification_score": random.uniform(5, 20),
    }


def generate_synthetic_dataset(num_scams: int = 50) -> list:
    return [generate_synthetic_scam(i) for i in range(num_scams)]


# ============================================================================
# SYNTHETIC LEGIT JOB GENERATION
# ============================================================================

LEGIT_TEMPLATES = [
    """
    {role} position open at {company}.
    Responsibilities:
    - Design, develop and maintain scalable systems
    - Collaborate with cross-functional teams
    - Mentor junior engineers and conduct code reviews
    Requirements:
    - {years}+ years of professional experience
    - Strong knowledge of Python, Java, or Go
    - Excellent problem-solving skills
    - Bachelor's or Master's degree in CS or related field
    Benefits:
    - Competitive salary and performance bonus
    - Health insurance for self and family
    - Provident fund and gratuity
    - ESOPs and stock options
    - Professional development budget and mentorship program
    Apply via our careers portal. Qualified candidates will be contacted for interview.
    """,
    """
    We are hiring an experienced {role} at {company}.
    What you will do:
    - Build production-grade software for millions of users
    - Drive technical decisions and architecture
    - Work with modern cloud infrastructure (AWS / GCP / Azure)
    What we look for:
    - {years}+ years experience in software development
    - Hands-on with distributed systems and microservices
    - Strong fundamentals in data structures and algorithms
    What we offer:
    - Industry-leading salary package
    - Comprehensive health insurance and wellness programs
    - Provident fund, ESOP, performance bonus
    - Hybrid work model and flexible hours
    - Continuous learning budget and training programs
    Interview process: 1 screening + 2 technical + 1 system design + 1 HR round.
    """,
    """
    {company} is hiring {role}s for our growing team.
    Job description:
    - Develop and ship features end-to-end
    - Participate in design and code reviews
    - Improve performance, reliability and quality of our products
    Required qualifications:
    - {years}+ years of relevant professional experience
    - Solid CS fundamentals and clean coding practices
    - Experience with SQL/NoSQL databases and REST APIs
    Compensation and benefits:
    - Best-in-industry salary
    - Comprehensive medical insurance, life and accident cover
    - Provident fund and gratuity
    - ESOPs / RSUs
    - Learning and development support
    Submit your application via our official careers page.
    """,
]

LEGIT_ROLES = [
    "Software Engineer", "Senior Software Engineer", "Backend Developer",
    "Frontend Developer", "Full Stack Developer", "Data Scientist",
    "Machine Learning Engineer", "DevOps Engineer", "SRE",
    "Product Manager", "Engineering Manager", "QA Engineer",
    "Mobile Developer", "Cloud Engineer", "Data Engineer",
]

LEGIT_COMPANIES = [
    ("Microsoft India", "microsoft.com"),
    ("Google India", "google.com"),
    ("Amazon Development Center", "amazon.com"),
    ("Flipkart Internet Pvt Ltd", "flipkart.com"),
    ("Razorpay", "razorpay.com"),
    ("Swiggy", "swiggy.in"),
    ("Zomato", "zomato.com"),
    ("PhonePe", "phonepe.com"),
    ("Freshworks", "freshworks.com"),
    ("Tata Consultancy Services", "tcs.com"),
    ("Infosys", "infosys.com"),
    ("Wipro", "wipro.com"),
]


def generate_synthetic_legit(num: int) -> dict:
    template = random.choice(LEGIT_TEMPLATES)
    role = random.choice(LEGIT_ROLES)
    company, domain = random.choice(LEGIT_COMPANIES)
    years = random.choice([2, 3, 4, 5, 6, 7, 8])

    description = template.format(role=role, company=company, years=years)

    salary_min = random.choice([800000, 1200000, 1500000, 1800000, 2200000])
    salary_max = salary_min + random.choice([400000, 800000, 1200000, 1600000])

    return {
        "job_title": role,
        "job_description": description.strip(),
        "skills_required": random.sample(
            ["python", "java", "sql", "aws", "docker", "kubernetes",
             "react", "node.js", "spring", "postgresql", "redis", "kafka"],
            k=random.randint(4, 8)
        ),
        "skill_categories": {},
        "salary_min": salary_min,
        "salary_max": salary_max,
        "salary_raw": f"{salary_min // 100000}-{salary_max // 100000} LPA",
        "city": random.choice(["Bengaluru", "Hyderabad", "Pune", "Gurgaon", "Mumbai", "Chennai", "Noida"]),
        "state": random.choice(["Karnataka", "Telangana", "Maharashtra", "Haryana", "Tamil Nadu", "Uttar Pradesh"]),
        "country": "India",
        "mode": random.choice(["On-site", "Hybrid", "Remote"]),
        "platform_name": random.choice(["LinkedIn", "Naukri", "Indeed", "Shine"]),
        "company_name": company,
        "recruiter_email": f"careers@{domain}",
        "scam_score": random.uniform(0, 15),
        "scam_risk_level": "Safe",
        "company_trust_score": random.uniform(75, 95),
        "recruiter_verification_score": random.uniform(70, 95),
    }


def generate_synthetic_legit_dataset(num_legit: int = 50) -> list:
    return [generate_synthetic_legit(i) for i in range(num_legit)]


# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_random_forest(X_train, y_train, X_test, y_test) -> tuple:
    print("\n" + "=" * 70)
    print("TRAINING RANDOM FOREST")
    print("=" * 70)

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    print(f"\nAccuracy: {accuracy:.2%}")
    print(f"F1 Score: {f1:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    feature_importance = pd.DataFrame({
        'feature': X_train.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False).head(15)

    print("\nTOP 15 IMPORTANT FEATURES:")
    print(feature_importance.to_string(index=False))

    return model, accuracy, f1


def train_xgboost(X_train, y_train, X_test, y_test) -> tuple:
    print("\n" + "=" * 70)
    print("TRAINING XGBOOST")
    print("=" * 70)

    n_safe = (y_train == 0).sum()
    n_scam = (y_train == 1).sum()
    scale_pos_weight = n_safe / max(1, n_scam)

    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        eval_metric='logloss',
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    model.fit(X_train, y_train, verbose=False)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    try:
        auc = roc_auc_score(y_test, y_proba)
        print(f"\nAccuracy: {accuracy:.2%}")
        print(f"F1 Score: {f1:.4f}")
        print(f"AUC-ROC:  {auc:.4f}")
    except ValueError:
        print(f"\nAccuracy: {accuracy:.2%}")
        print(f"F1 Score: {f1:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    return model, accuracy, f1


def train_isolation_forest(X_train) -> object:
    print("\n" + "=" * 70)
    print("TRAINING ISOLATION FOREST (Anomaly Detection)")
    print("=" * 70)

    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        max_samples='auto',
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    model.fit(X_train)

    predictions = model.predict(X_train)
    n_anomalies = (predictions == -1).sum()
    print(f"\nDetected {n_anomalies}/{len(predictions)} anomalies ({n_anomalies/len(predictions):.1%})")

    return model


# ============================================================================
# MAIN PIPELINE
# ============================================================================

def main():
    print("=" * 70)
    print("GRAPHURA ML TRAINING PIPELINE")
    print("=" * 70)

    # Step 1: Load real jobs from Supabase
    print("\nStep 1: Loading real jobs from Supabase...")

    try:
        from ..scraper.storage.supabase_client import get_client
        sb = get_client()

        response = sb.table("jobs").select(
            "*, companies(company_trust_score), recruiters(recruiter_verification_score)"
        ).execute()

        real_jobs = response.data

        for job in real_jobs:
            if job.get("companies"):
                job["company_trust_score"] = job["companies"].get("company_trust_score", 50)
            if job.get("recruiters"):
                job["recruiter_verification_score"] = job["recruiters"].get("recruiter_verification_score", 30)

        print(f"   Loaded {len(real_jobs)} real jobs from Supabase")

    except Exception as e:
        print(f"   Could not load from Supabase: {e}")
        print(f"   Continuing with synthetic data only...")
        real_jobs = []

    # Step 2: Generate synthetic scam jobs
    print("\nStep 2: Generating synthetic scam jobs...")
    num_scams = max(50, len(real_jobs) * 2)
    synthetic_scams = generate_synthetic_dataset(num_scams)
    print(f"   Generated {len(synthetic_scams)} synthetic scam jobs")

    # Step 2b: Generate synthetic legit jobs
    print("\nStep 2b: Generating synthetic legit (safe) jobs...")
    num_legit_needed = max(50, num_scams - len(real_jobs))
    synthetic_legit = generate_synthetic_legit_dataset(num_legit_needed)
    print(f"   Generated {len(synthetic_legit)} synthetic legit jobs")

    # Step 3: Combine datasets
    all_jobs = real_jobs + synthetic_scams + synthetic_legit
    print(f"\nStep 3: Combined dataset")
    print(f"   Total jobs:      {len(all_jobs)}")
    print(f"   Real:            {len(real_jobs)}")
    print(f"   Synthetic scams: {len(synthetic_scams)}")
    print(f"   Synthetic legit: {len(synthetic_legit)}")

    # Step 4: Extract features
    print("\nStep 4: Extracting features...")
    X = build_feature_dataframe(all_jobs, fit_tfidf=True)
    y_df = extract_labels(all_jobs)
    y = y_df['is_scam'].values

    print(f"   Features shape: {X.shape}")
    print(f"   Labels: {(y == 0).sum()} safe, {(y == 1).sum()} scam")

    if len(np.unique(y)) < 2:
        print("\nERROR: Only one class found in labels.")
        print("   Cannot train binary classifiers without both safe and scam jobs.")
        print("   Check the extract_labels() function in feature_extractor.py.")
        return

    # Step 5: Train/Test split
    print("\nStep 5: Splitting train/test (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y,
    )

    print(f"   Train: {X_train.shape}, Scams: {y_train.sum()}")
    print(f"   Test:  {X_test.shape}, Scams: {y_test.sum()}")

    # Step 6: Scale features
    scaler = StandardScaler()
    scaler.fit(X_train)

    # Step 7: Train models
    rf_model, rf_acc, rf_f1 = train_random_forest(X_train, y_train, X_test, y_test)
    xgb_model, xgb_acc, xgb_f1 = train_xgboost(X_train, y_train, X_test, y_test)
    iso_model = train_isolation_forest(X_train)

    # Step 8: Save models
    print("\nStep 8: Saving trained models...")

    joblib.dump(rf_model, MODELS_DIR / "random_forest.pkl")
    joblib.dump(xgb_model, MODELS_DIR / "xgboost.pkl")
    joblib.dump(iso_model, MODELS_DIR / "isolation_forest.pkl")
    joblib.dump(scaler, MODELS_DIR / "scaler.pkl")

    feature_columns = list(X.columns)
    with open(MODELS_DIR / "feature_columns.json", "w") as f:
        json.dump(feature_columns, f)

    metadata = {
        "models": {
            "random_forest": {
                "accuracy": float(rf_acc),
                "f1_score": float(rf_f1),
                "path": str(MODELS_DIR / "random_forest.pkl")
            },
            "xgboost": {
                "accuracy": float(xgb_acc),
                "f1_score": float(xgb_f1),
                "path": str(MODELS_DIR / "xgboost.pkl")
            },
            "isolation_forest": {
                "path": str(MODELS_DIR / "isolation_forest.pkl")
            }
        },
        "training_data": {
            "total_jobs": len(all_jobs),
            "real_jobs": len(real_jobs),
            "synthetic_scams": len(synthetic_scams),
            "synthetic_legit": len(synthetic_legit),
            "features": len(feature_columns)
        },
        "trained_at": pd.Timestamp.now().isoformat()
    }

    with open(MODELS_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"   Saved: random_forest.pkl, xgboost.pkl, isolation_forest.pkl")
    print(f"   Saved: scaler.pkl, feature_columns.json, metadata.json")

    # Step 9: Final summary
    print("\n" + "=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)
    print(f"\nMODEL PERFORMANCE COMPARISON:")
    print(f"   {'Model':<25s} {'Accuracy':<12s} {'F1 Score'}")
    print(f"   {'-' * 25} {'-' * 12} {'-' * 10}")
    print(f"   {'Random Forest':<25s} {rf_acc:.2%}        {rf_f1:.4f}")
    print(f"   {'XGBoost':<25s} {xgb_acc:.2%}        {xgb_f1:.4f}")
    print(f"   {'Isolation Forest':<25s} (anomaly detection)")

    if xgb_acc > rf_acc:
        print(f"\nWINNER: XGBoost ({xgb_acc:.2%})")
    else:
        print(f"\nWINNER: Random Forest ({rf_acc:.2%})")

    print(f"\nModels saved to: {MODELS_DIR}/")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()