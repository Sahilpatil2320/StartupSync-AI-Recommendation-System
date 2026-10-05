import pandas as pd
import json
import ast
import re
from pathlib import Path


# ============================================================
# StartupSync - Data Preprocessing
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATASET_DIR = PROJECT_ROOT / "separate_datasets"
RESULTS_DIR = PROJECT_ROOT / "results"


# ------------------------------------------------------------
# Utility Functions
# ------------------------------------------------------------

def clean_text(value):
    """Clean a normal text value."""

    if pd.isna(value):
        return ""

    value = str(value).strip()

    # Remove repeated whitespace
    value = re.sub(r"\s+", " ", value)

    return value


def normalize_text(value):
    """Convert text into lowercase normalized form."""

    value = clean_text(value)

    return value.lower()


def parse_list(value):
    """
    Convert JSON/Python-style list strings into a Python list.
    """

    if pd.isna(value) or str(value).strip() == "":
        return []

    value = str(value).strip()

    try:
        # Try JSON
        parsed = json.loads(value)

        if isinstance(parsed, list):
            return parsed

    except Exception:
        pass

    try:
        # Try Python literal
        parsed = ast.literal_eval(value)

        if isinstance(parsed, list):
            return parsed

    except Exception:
        pass

    # If parsing fails, treat it as a single text value
    return [value]


def list_to_text(value):
    """
    Convert a list or list-like value into clean text.
    """

    items = parse_list(value)

    cleaned_items = []

    for item in items:

        if isinstance(item, dict):

            # Handle investment objects
            if "company_name" in item:

                cleaned_items.append(
                    clean_text(item["company_name"])
                )

            else:

                cleaned_items.append(
                    " ".join(
                        str(v)
                        for v in item.values()
                    )
                )

        else:

            cleaned_items.append(
                clean_text(item)
            )

    return " ".join(
        item for item in cleaned_items if item
    )


def normalize_list_text(value):
    """
    Convert list-like data to normalized text.
    """

    return normalize_text(
        list_to_text(value)
    )


def normalize_funding_stage(value):
    """
    Convert noisy funding-round values into
    standard funding stages.
    """

    if pd.isna(value):
        return "unknown"

    text = str(value).lower().strip()

    if not text:
        return "unknown"

    # Normalize separators
    normalized = (
        text
        .replace("-", " ")
        .replace("_", " ")
        .replace("$", " ")
    )

    # Pre-seed must be checked before seed
    if "pre seed" in normalized:
        return "pre_seed"

    # Seed
    if (
        "seed" in normalized
        or "seeding" in normalized
    ):
        return "seed"

    # Series A
    if (
        "series a" in normalized
        or "round a" in normalized
        or "a series" in normalized
    ):
        return "series_a"

    # Series B
    if (
        "series b" in normalized
        or "round b" in normalized
        or "b series" in normalized
    ):
        return "series_b"

    # Series C
    if (
        "series c" in normalized
        or "round c" in normalized
    ):
        return "series_c"

    # Series D
    if (
        "series d" in normalized
        or "round d" in normalized
    ):
        return "series_d"

    # Series E
    if (
        "series e" in normalized
        or "round e" in normalized
    ):
        return "series_e"

    # Series F
    if (
        "series f" in normalized
        or "round f" in normalized
    ):
        return "series_f"

    # Angel
    if "angel" in normalized:
        return "angel"

    # Venture
    if "venture" in normalized:
        return "venture"

    # Private
    if "private" in normalized:
        return "private"

    return "unknown"

def extract_investment_stages(value):
    """
    Extract and normalize investor investment stages.

    Handles values such as:
    seed
    pre_seed
    seedseries_a
    pre_seed seed series_a
    series_a series_b
    """
    text = clean_text(value).lower()

    if not text:
        return ""

    # Normalize separators
    text = text.replace("-", "_")
    text = text.replace(" ", "_")

    # Fix common concatenated stage values
    text = re.sub(r"seedseries", "seed series", text)
    text = re.sub(r"post_seedseries", "post_seed series", text)

    # Convert separators back to spaces for detection
    text = text.replace("_", " ")

    stages = []

    # Order matters: detect specific stages first
    if "pre seed" in text:
        stages.append("pre_seed")

    if "post seed" in text:
        stages.append("post_seed")

    if "series a" in text:
        stages.append("series_a")

    if "series b" in text:
        stages.append("series_b")

    if "series c" in text:
        stages.append("series_c")

    if "series d" in text:
        stages.append("series_d")

    if "series e" in text:
        stages.append("series_e")

    if "series f" in text:
        stages.append("series_f")

    # Detect normal seed separately
    if re.search(r"\bseed\b", text):
        stages.append("seed")

    # Remove duplicates while preserving order
    stages = list(dict.fromkeys(stages))

    return " ".join(stages)


# ------------------------------------------------------------
# Founder Preprocessing
# ------------------------------------------------------------

def preprocess_founders():

    df = pd.read_excel(
        DATASET_DIR / "founders_data.xlsx"
    )

    result = pd.DataFrame()

    result["id"] = df["id"].astype(str)

    result["name"] = df["name"].apply(clean_text)

    result["company"] = df["company"].apply(clean_text)

    result["domain"] = df["domain"].apply(
        normalize_text
    )

    result["funding_year"] = pd.to_numeric(
        df["past_funding_year"],
        errors="coerce"
    )

    result["funding_round"] = df[
        "past_funding_round"
    ].apply(normalize_text)

    # NEW:
    # Convert noisy funding rounds into
    # standardized funding stages.
    result["funding_stage"] = df[
        "past_funding_round"
    ].apply(normalize_funding_stage)

    # Convert funding amount into numeric value
    result["funding_amount"] = (
        df["past_funding_amount"]
        .astype(str)
        .str.replace("$", "", regex=False)
        .str.replace(",", "", regex=False)
        .str.replace("million", "e6", regex=False)
        .str.replace("Million", "e6", regex=False)
        .str.replace("billion", "e9", regex=False)
        .str.replace("Billion", "e9", regex=False)
    )

    result["funding_amount"] = pd.to_numeric(
        result["funding_amount"],
        errors="coerce"
    )

    result["valuation"] = pd.to_numeric(
        df["valuation"],
        errors="coerce"
    )

    result["competitors"] = df[
        "competitors"
    ].apply(normalize_list_text)

    result["umbrella_companies"] = df[
        "umbrella_companies"
    ].apply(normalize_list_text)

    return result


# ------------------------------------------------------------
# Investor Preprocessing
# ------------------------------------------------------------

def preprocess_investors():

    df = pd.read_excel(
        DATASET_DIR / "investors_data.xlsx"
    )

    result = pd.DataFrame()

    result["id"] = df["id"].astype(str)

    result["name"] = df["name"].apply(
        clean_text
    )

    result["investor_type"] = df[
        "investor_type"
    ].apply(normalize_text)

    result["firm_name"] = df[
        "firm_name"
    ].apply(clean_text)

    result["location"] = df[
        "location"
    ].apply(normalize_text)

    result["primary_domain"] = df[
        "primary_domain"
    ].apply(normalize_text)

    result["secondary_domains"] = df[
        "secondary_domains"
    ].apply(normalize_list_text)

    result["investment_stages"] = df[
        "investment_stage_pref"
    ].apply(extract_investment_stages)

    result["past_investments"] = df[
        "past_investments"
    ].apply(normalize_list_text)

    result["notable_investments"] = df[
        "notable_investments"
    ].apply(normalize_list_text)

    result["active"] = df[
        "is_active_investing"
    ].fillna(False)

    result["bio"] = df[
        "short_bio"
    ].apply(normalize_text)

    result["investment_thesis"] = df[
        "investment_thesis"
    ].apply(normalize_text)

    result["tags"] = df[
        "tags"
    ].apply(normalize_list_text)

    return result


# ------------------------------------------------------------
# Mentor Preprocessing
# ------------------------------------------------------------

def preprocess_mentors():

    df = pd.read_csv(
        DATASET_DIR / "mentors.csv"
    )

    result = pd.DataFrame()

    result["id"] = df["mentor_id"].apply(
        clean_text
    )

    result["name"] = df["mentor_name"].apply(
        clean_text
    )

    result["expertise"] = df[
        "expertise"
    ].apply(normalize_text)

    result["skills"] = df[
        "skills"
    ].apply(normalize_text)

    result["industry"] = df[
        "industry"
    ].apply(normalize_text)

    result["domain"] = df[
        "domain"
    ].apply(normalize_text)

    result["experience_years"] = pd.to_numeric(
        df["experience_years"],
        errors="coerce"
    )

    result["location"] = df[
        "location"
    ].apply(normalize_text)

    result["interests"] = df[
        "interests"
    ].apply(normalize_text)

    return result


# ------------------------------------------------------------
# Student Preprocessing
# ------------------------------------------------------------

def preprocess_students():

    df = pd.read_csv(
        DATASET_DIR / "students.csv"
    )

    result = pd.DataFrame()

    result["id"] = df[
        "Student ID"
    ].apply(clean_text)

    result["name"] = df[
        "Name"
    ].apply(clean_text)

    result["branch"] = df[
        "Branch"
    ].apply(normalize_text)

    result["gpa"] = pd.to_numeric(
        df["Average GPA"],
        errors="coerce"
    )

    result["skills"] = df[
        "Skills"
    ].apply(normalize_text)

    result["clubs"] = df[
        "Clubs"
    ].apply(normalize_text)

    result["internship_done"] = df[
        "Internship Done"
    ].apply(normalize_text)

    result["internship_domain"] = df[
        "Internship Domain"
    ].apply(normalize_text)

    result["placement_domain"] = df[
        "Placement Domain"
    ].apply(normalize_text)

    result["alumni_path"] = df[
        "Alumni Path"
    ].apply(normalize_text)

    return result


# ------------------------------------------------------------
# Startup Preprocessing
# ------------------------------------------------------------

def preprocess_startups():

    df = pd.read_excel(
        DATASET_DIR /
        "StartupSync_650_Startup_Dataset.xlsx"
    )

    result = pd.DataFrame()

    result["id"] = df[
        "startup_id"
    ].apply(clean_text)

    result["name"] = df[
        "startup_name"
    ].apply(clean_text)

    result["industry"] = df[
        "industry_category"
    ].apply(normalize_text)

    result["location"] = df[
        "location"
    ].apply(normalize_text)

    result["funding_stage"] = df[
        "funding_stage"
    ].apply(normalize_text)

    result["funding_amount"] = pd.to_numeric(
        df["funding_amount_usd"],
        errors="coerce"
    )

    result["investors"] = df[
        "investors"
    ].apply(normalize_text)

    result["required_skills"] = df[
        "required_skills"
    ].apply(normalize_text)

    result["recommended_roles"] = df[
        "recommended_roles"
    ].apply(normalize_text)

    result["tags"] = df[
        "recommendation_tags"
    ].apply(normalize_text)

    return result


# ------------------------------------------------------------
# Main
# ------------------------------------------------------------

def main():

    print("=" * 70)
    print("STARTUPSYNC DATA PREPROCESSING")
    print("=" * 70)

    RESULTS_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # Process datasets
    founders = preprocess_founders()
    investors = preprocess_investors()
    mentors = preprocess_mentors()
    students = preprocess_students()
    startups = preprocess_startups()

    # Save processed datasets
    founders.to_csv(
        RESULTS_DIR / "processed_founders.csv",
        index=False
    )

    investors.to_csv(
        RESULTS_DIR / "processed_investors.csv",
        index=False
    )

    mentors.to_csv(
        RESULTS_DIR / "processed_mentors.csv",
        index=False
    )

    students.to_csv(
        RESULTS_DIR / "processed_students.csv",
        index=False
    )

    startups.to_csv(
        RESULTS_DIR / "processed_startups.csv",
        index=False
    )

    # Print summary
    print("\nProcessed datasets:")

    print(
        f"Founders : {len(founders)} rows"
    )

    print(
        f"Investors: {len(investors)} rows"
    )

    print(
        f"Mentors  : {len(mentors)} rows"
    )

    print(
        f"Students : {len(students)} rows"
    )

    print(
        f"Startups : {len(startups)} rows"
    )

    print("\nSaved to:")
    print(RESULTS_DIR)

    print("\n" + "=" * 70)
    print("PREPROCESSING COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()