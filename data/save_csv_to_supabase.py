import sys
import os
import pandas as pd
from pathlib import Path

# Add Graphura to PYTHONPATH
sys.path.append(str(Path(__file__).parent.parent))

from backend.storage.supabase_client import get_client

def main():
    csv_path = Path(__file__).parent / "training" / "processed_cleaned_data.csv"
    if not csv_path.exists():
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)

    print(f"Loading CSV from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} rows.")

    sb = get_client()

    print("Clearing existing data in model_training_data table...")
    try:
        # Deleting all rows by matching anything not equal to a dummy uuid
        sb.table("model_training_data").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("Table cleared.")
    except Exception as e:
        print(f"Warning: Could not clear table (might be empty or RLS/permission issues): {e}")

    # Prepare batches
    batch_size = 500
    records = []

    print("Preparing records for upload...")
    for _, row in df.iterrows():
        title = str(row.get("title") or "").strip()
        description = str(row.get("description") or "").strip()
        
        # Skip rows with empty description or title
        if not title or not description:
            continue

        stipend = row.get("stipend")
        salary = row.get("salary")
        salary_raw = str(stipend if pd.notna(stipend) else (salary if pd.notna(salary) else "")).strip()

        skills_raw = row.get("skills")
        if pd.isna(skills_raw) or not str(skills_raw).strip():
            skills = []
        else:
            skills = [s.strip() for s in str(skills_raw).split(",") if s.strip()]

        is_scam = bool(row.get("is_scam") == 1 or row.get("is_scam") is True)

        records.append({
            "job_title": title,
            "job_description": description,
            "salary_raw": salary_raw,
            "skills": skills,
            "is_scam": is_scam
        })

    print(f"Uploading {len(records)} records in batches of {batch_size}...")
    total_uploaded = 0
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        try:
            res = sb.table("model_training_data").insert(batch).execute()
            total_uploaded += len(batch)
            print(f"   Uploaded {total_uploaded}/{len(records)} records...")
        except Exception as e:
            print(f"Error uploading batch at index {i}: {e}")
            # If upload fails, we can try uploading individually or log
            sys.exit(1)

    print("Database upload completed successfully!")

if __name__ == "__main__":
    main()
