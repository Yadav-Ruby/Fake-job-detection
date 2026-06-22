import sys
import os
import json
import random
import re
import warnings
import time
import hashlib
import numpy as np
import pandas as pd
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import joblib

REQUIRED_PACKAGES = {
    "pandas": "pandas",
    "numpy": "numpy",
    "sklearn": "scikit-learn",
    "xgboost": "xgboost",
    "nltk": "nltk",
    "joblib": "joblib",
    "spacy": "spacy",
    "textstat": "textstat",
    "sentence_transformers": "sentence-transformers",
    "shap": "shap"
}

missing_deps = []
for module_name, pip_name in REQUIRED_PACKAGES.items():
    try:
        __import__(module_name)
    except ImportError:
        missing_deps.append((module_name, pip_name))

if missing_deps:
    for module_name, pip_name in missing_deps:
        print(f"Missing dependency: {pip_name}")
        print(f"Run:")
        print(f"pip install {pip_name}\n")
    sys.exit(1)

try:
    import nltk
    for resource in ["tokenizers/punkt", "tokenizers/punkt_tab", "corpora/stopwords"]:
        try:
            nltk.data.find(resource)
        except LookupError:
            res_name = resource.split("/")[-1]
            print(f"Downloading missing NLTK resource: {res_name}...")
            nltk.download(res_name, quiet=True)
except Exception as e:
    print(f"Warning: NLTK initialization failed: {e}")

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_score,
)
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
    load_dataset_from_csv,
)
from .nlp_engine import prepare_ml_text

warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

CACHE_DIR = Path(__file__).parent / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

LABEL_NOISE_RATE = 0.15
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)


def apply_label_noise(
    y: np.ndarray,
    noise_rate: float = LABEL_NOISE_RATE,
    seed: int = RANDOM_SEED,
) -> np.ndarray:
    rng = np.random.RandomState(seed)
    y_noisy = y.copy()
    n_flip = int(len(y_noisy) * noise_rate)
    if n_flip == 0:
        return y_noisy
    flip_idx = rng.choice(len(y_noisy), size=n_flip, replace=False)
    y_noisy[flip_idx] = 1 - y_noisy[flip_idx]
    return y_noisy


def _get_cache_key(csv_path: Path) -> str:
    hasher = hashlib.md5()
    hasher.update(str(csv_path.stat().st_mtime).encode())
    hasher.update(str(csv_path.stat().st_size).encode())
    return hasher.hexdigest()[:12]


def _cache_path(key: str) -> Path:
    return CACHE_DIR / f"features_{key}.npz"


def save_feature_cache(
    key, X_train, X_test,
    y_train, y_test,
    y_train_orig, y_test_orig,
    feature_cols,
):
    cache_file = _cache_path(key)
    np.savez_compressed(
        cache_file,
        X_train=X_train.values,
        X_test=X_test.values,
        y_train=y_train,
        y_test=y_test,
        y_train_orig=y_train_orig,
        y_test_orig=y_test_orig,
        feature_cols=np.array(feature_cols),
    )
    print(f"   Features cached -> {cache_file.name}")


def load_feature_cache(key):
    cache_file = _cache_path(key)
    if not cache_file.exists():
        return None

    print(f"   Loading features from cache ({cache_file.name})...")
    data = np.load(cache_file, allow_pickle=True)
    feature_cols = list(data["feature_cols"])

    X_train = pd.DataFrame(data["X_train"], columns=feature_cols)
    X_test = pd.DataFrame(data["X_test"], columns=feature_cols)
    y_train = data["y_train"]
    y_test = data["y_test"]
    y_train_orig = data["y_train_orig"]
    y_test_orig = data["y_test_orig"]

    return X_train, X_test, y_train, y_test, y_train_orig, y_test_orig, feature_cols


def parallel_prepare_text(jobs: list, max_workers: int = 4) -> list:
    cleaned_jobs = [dict(job) for job in jobs]
    texts = [job.get("job_description", "") or "" for job in cleaned_jobs]

    print(f"   Cleaning {len(texts)} descriptions with {max_workers} workers...")

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(prepare_ml_text, t): i for i, t in enumerate(texts)}
        cleaned_texts = [""] * len(texts)
        for future in as_completed(futures):
            idx = futures[future]
            try:
                cleaned_texts[idx] = future.result()
            except Exception:
                cleaned_texts[idx] = texts[idx]

    for job, text in zip(cleaned_jobs, cleaned_texts):
        job["job_description"] = text

    return cleaned_jobs


def parallel_get_keywords(jobs: list, max_workers: int = 4) -> list:
    from .nlp_engine import get_matched_keywords

    print(f"   Extracting keywords from {len(jobs)} jobs with {max_workers} workers...")

    def _process(job):
        desc = job.get("job_description", "") or ""
        keywords = get_matched_keywords(desc)
        return {
            "job_title": job.get("job_title", "Unknown"),
            "matched_keywords": ", ".join(keywords),
            "keyword_count": len(keywords),
        }

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(_process, jobs))

    return results


def run_cross_validation(X, y) -> dict:
    print("\n" + "=" * 70)
    print("CROSS VALIDATION (Dynamic-Fold Stratified)")
    print("=" * 70)

    class_counts = np.bincount(y)
    min_class_count = np.min(class_counts) if len(class_counts) > 0 else 0
    n_splits = min(5, min_class_count)

    if n_splits < 2:
        print(
            f"Skipping cross-validation: too few samples per class "
            f"(min class count = {min_class_count})"
        )
        return {
            "rf_cv_f1_mean": 0.0,
            "rf_cv_f1_std": 0.0,
            "xgb_cv_f1_mean": 0.0,
            "xgb_cv_f1_std": 0.0,
        }

    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=RANDOM_SEED)

    rf_model = RandomForestClassifier(
        n_estimators=80,
        max_depth=8,
        min_samples_split=10,
        min_samples_leaf=4,
        max_features="sqrt",
        class_weight="balanced",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    xgb_model = xgb.XGBClassifier(
        n_estimators=20,
        max_depth=2,
        learning_rate=0.05,
        subsample=0.7,
        colsample_bytree=0.7,
        reg_alpha=1.0,
        reg_lambda=2.0,
        eval_metric="logloss",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    rf_scores = cross_val_score(rf_model, X, y, cv=cv, scoring="f1_weighted")
    xgb_scores = cross_val_score(xgb_model, X, y, cv=cv, scoring="f1_weighted")

    print(f"Random Forest CV F1: {rf_scores.mean():.4f} (+/- {rf_scores.std():.4f})")
    print(f"XGBoost       CV F1: {xgb_scores.mean():.4f} (+/- {xgb_scores.std():.4f})")

    return {
        "rf_cv_f1_mean": float(rf_scores.mean()),
        "rf_cv_f1_std": float(rf_scores.std()),
        "xgb_cv_f1_mean": float(xgb_scores.mean()),
        "xgb_cv_f1_std": float(xgb_scores.std()),
    }


def train_random_forest(X_train, y_train, X_test, y_test) -> tuple:
    print("\n" + "=" * 70)
    print("TRAINING RANDOM FOREST")
    print("=" * 70)

    model = RandomForestClassifier(
        n_estimators=80,
        max_depth=8,
        min_samples_split=10,
        min_samples_leaf=4,
        max_features="sqrt",
        class_weight="balanced",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print(f"\nAccuracy: {accuracy:.2%}")
    print(f"F1 Score: {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    feature_importance = pd.DataFrame({
        "feature": X_train.columns,
        "importance": model.feature_importances_,
    }).sort_values("importance", ascending=False).head(15)

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
        n_estimators=20,
        max_depth=2,
        learning_rate=0.05,
        subsample=0.7,
        colsample_bytree=0.7,
        reg_alpha=1.0,
        reg_lambda=2.0,
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    model.fit(X_train, y_train, verbose=False)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

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
        max_samples="auto",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    model.fit(X_train)

    predictions = model.predict(X_train)
    n_anomalies = (predictions == -1).sum()
    print(
        f"\nDetected {n_anomalies}/{len(predictions)} anomalies "
        f"({n_anomalies / len(predictions):.1%})"
    )

    return model


def main():
    total_start = time.time()

    print("=" * 70)
    print("GRAPHURA ML TRAINING PIPELINE")
    print("=" * 70)

    print("\nStep 1: Loading jobs from Supabase database...")
    from backend.storage.supabase_client import get_client
    try:
        sb = get_client()
        all_jobs = []
        limit = 1000
        start = 0
        print("   Fetching training data from Supabase (paginated)...")
        while True:
            end = start + limit - 1
            res = sb.table("model_training_data").select("*").range(start, end).execute()
            if not res.data:
                break
            for row in res.data:
                title = row.get("job_title") or "Untitled"
                description = row.get("job_description") or ""
                skills_array = row.get("skills") or []
                salary_str = row.get("salary_raw") or ""
                is_scam_val = 1 if row.get("is_scam") else 0
                
                try:
                    stipend_val = 0.0
                    if salary_str:
                        nums = re.findall(r"\d+", salary_str.replace(",", ""))
                        if nums:
                            stipend_val = float(nums[0])
                except Exception:
                    stipend_val = 0.0

                all_jobs.append({
                    "job_title": title,
                    "job_description": description,
                    "skills_required": skills_array,
                    "skill_categories": {},
                    "salary_min": stipend_val,
                    "salary_max": stipend_val,
                    "salary_raw": salary_str,
                    "city": "Remote",
                    "state": "",
                    "country": "India",
                    "mode": "Remote",
                    "platform_name": "Unknown",
                    "company_name": "Unknown",
                    "company_website": "",
                    "email_domain": "",
                    "is_scam": is_scam_val,
                    "scam_score": 100.0 if is_scam_val == 1 else 0.0,
                    "scam_risk_level": "Scam Likely" if is_scam_val == 1 else "Safe",
                    "company_trust_score": 50.0,
                    "recruiter_verification_score": 30.0
                })
            
            if len(res.data) < limit:
                break
            start += limit

        print(f"   Loaded {len(all_jobs)} jobs from Supabase database.")
    except Exception as e:
        print(f"ERROR loading dataset from Supabase: {e}")
        sys.exit(1)

    if not all_jobs:
        print("ERROR: Dataset is empty.")
        sys.exit(1)

    print("\nStep 2: Creating labels...")
    y_df = extract_labels(all_jobs)
    y = y_df["is_scam"].values
    print(f"   Labels: {(y == 0).sum()} safe, {(y == 1).sum()} scam")

    if len(np.unique(y)) < 2:
        print("\nERROR: Only one class found. Cannot train classifiers.")
        return

    print("\nStep 3: Splitting raw jobs (80/20)...")
    jobs_train, jobs_test, y_train, y_test = train_test_split(
        all_jobs, y,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y,
    )
    print(f"   Train jobs: {len(jobs_train)}")
    print(f"   Test jobs:  {len(jobs_test)}")

    y_train_orig = y_train.copy()
    y_test_orig = y_test.copy()

    n_flipped_train = int(len(y_train) * LABEL_NOISE_RATE)
    y_train = apply_label_noise(y_train, noise_rate=LABEL_NOISE_RATE, seed=RANDOM_SEED)
    y_test = apply_label_noise(y_test, noise_rate=LABEL_NOISE_RATE, seed=RANDOM_SEED + 1)
    print(
        f"   Applied {LABEL_NOISE_RATE:.0%} label noise "
        f"({n_flipped_train} flipped) to simulate real-world noise"
    )

    print("\nStep 4: Extracting features...")
    cache_key = f"db_{len(all_jobs)}"
    cached_data = load_feature_cache(cache_key)

    if cached_data is not None:
        X_train, X_test, y_train, y_test, \
            y_train_orig, y_test_orig, feature_cols = cached_data
        print("   Cache hit. Feature extraction skipped.")
    else:
        feat_start = time.time()
        cpu_count = min(4, os.cpu_count() or 2)

        jobs_train_cleaned = parallel_prepare_text(jobs_train, max_workers=cpu_count)
        jobs_test_cleaned = parallel_prepare_text(jobs_test, max_workers=cpu_count)

        print("   Building feature matrix (train)...")
        X_train = build_feature_dataframe(jobs_train_cleaned, fit_tfidf=True)

        print("   Building feature matrix (test)...")
        X_test = build_feature_dataframe(jobs_test_cleaned, fit_tfidf=False)

        for col in X_train.columns:
            if col not in X_test.columns:
                X_test[col] = 0
        X_test = X_test[X_train.columns]

        feature_cols = list(X_train.columns)

        save_feature_cache(
            cache_key,
            X_train, X_test,
            y_train, y_test,
            y_train_orig, y_test_orig,
            feature_cols,
        )

        print(f"   Feature extraction took {time.time() - feat_start:.1f}s")

    print(f"   Train Features: {X_train.shape}")
    print(f"   Test Features:  {X_test.shape}")

    cv_results = run_cross_validation(X_train, y_train)

    scaler = StandardScaler()
    scaler.fit(X_train)

    rf_model, rf_acc, rf_f1 = train_random_forest(X_train, y_train, X_test, y_test)
    xgb_model, xgb_acc, xgb_f1 = train_xgboost(X_train, y_train, X_test, y_test)
    iso_model = train_isolation_forest(X_train)

    print("\nSaving trained models...")
    joblib.dump(rf_model, MODELS_DIR / "random_forest.pkl")
    joblib.dump(xgb_model, MODELS_DIR / "xgboost.pkl")
    joblib.dump(iso_model, MODELS_DIR / "isolation_forest.pkl")
    joblib.dump(scaler, MODELS_DIR / "scaler.pkl")

    embedding_model_path = MODELS_DIR / "embedding_model"
    if not embedding_model_path.exists():
        print("Saving SentenceTransformer embedding model locally...")
        try:
            from sentence_transformers import SentenceTransformer
            emb_model = SentenceTransformer("all-MiniLM-L6-v2")
            emb_model.save(str(embedding_model_path))
            print("   Embedding model saved.")
        except Exception as e:
            print(f"   Warning: Could not save SentenceTransformer: {e}")
    else:
        print("   SentenceTransformer embedding model already saved.")

    print("Saving features.csv and labels.csv...")
    pd.concat([X_train, X_test], ignore_index=True).to_csv(
        MODELS_DIR / "features.csv", index=False
    )
    pd.DataFrame({
        "is_scam": np.concatenate([y_train_orig, y_test_orig])
    }).to_csv(MODELS_DIR / "labels.csv", index=False)

    print("Saving matched_keywords.csv...")
    cpu_count = min(4, os.cpu_count() or 2)
    pd.DataFrame(
        parallel_get_keywords(all_jobs, max_workers=cpu_count)
    ).to_csv(MODELS_DIR / "matched_keywords.csv", index=False)

    feature_columns = list(X_train.columns)
    with open(MODELS_DIR / "feature_columns.json", "w") as f:
        json.dump(feature_columns, f)

    metadata = {
        "models": {
            "random_forest": {
                "accuracy": float(rf_acc),
                "f1_score": float(rf_f1),
                "path": str(MODELS_DIR / "random_forest.pkl"),
            },
            "xgboost": {
                "accuracy": float(xgb_acc),
                "f1_score": float(xgb_f1),
                "path": str(MODELS_DIR / "xgboost.pkl"),
            },
            "isolation_forest": {
                "path": str(MODELS_DIR / "isolation_forest.pkl"),
            },
        },
        "cross_validation": cv_results,
        "training_data": {
            "total_jobs": len(all_jobs),
            "features": len(feature_columns),
        },
        "trained_at": pd.Timestamp.now().isoformat(),
    }
    with open(MODELS_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"   Saved: random_forest.pkl, xgboost.pkl, isolation_forest.pkl")
    print(f"   Saved: scaler.pkl, feature_columns.json, metadata.json")
    print(f"   Saved: features.csv, labels.csv, matched_keywords.csv")

    print("\n" + "=" * 70)
    print(f"TRAINING COMPLETE  |  Total time: {time.time() - total_start:.1f}s")
    print("=" * 70)


if __name__ == "__main__":
    main()