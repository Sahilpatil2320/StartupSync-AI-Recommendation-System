import pandas as pd
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent.parent
RESULTS_DIR = BASE_DIR / "results"


# ============================================================
# GENERIC / LOW-VALUE INVESTOR WORDS
# ============================================================

GENERIC_INVESTOR_WORDS = {
    "the",
    "and",
    "or",
    "for",
    "with",
    "from",
    "company",
    "companies",
    "venture",
    "ventures",
    "capital",
    "fund",
    "funds",
    "partners",
    "partner",
    "group",
    "investment",
    "investments",
    "investor",
    "investors",
    "technology",
    "technologies",
    "startup",
    "startups",
    "business",
    "businesses",
    "software",
    "solutions",
    "inc",
    "llc",
    "ltd",

    # Generic profile words
    "who",
    "were",
    "was",
    "are",
    "is",
    "been",
    "invested",
    "investing",
    "founder",
    "founders",
    "female",
    "diverse",
    "new",
    "future",
    "work",
    "solo",
    "scout",

    # Location noise
    "san",
    "francisco",
    "bay",
    "area",
    "california",
    "angeles",
    "boston",
    "london",
    "york",
    "southern",
    "england",
}


# ============================================================
# URL / TRACKING / HASH NOISE
# ============================================================

URL_NOISE_WORDS = {
    "http",
    "https",
    "www",
    "com",
    "org",
    "net",
    "html",
    "php",
    "fclid",
    "gclid",
    "utm",
    "ref",
    "redirect",
}


def is_noise_token(token):
    """
    Detect URL fragments, hashes, tracking IDs and other
    low-value tokens.
    """

    token = token.lower().strip()

    if not token:
        return True

    if token in URL_NOISE_WORDS:
        return True

    # Pure numbers
    if token.isdigit():
        return True

    # Very long tokens are usually hashes / encoded URLs
    if len(token) > 35:
        return True

    # Hexadecimal-looking hashes
    if len(token) >= 8 and re.fullmatch(r"[0-9a-f]+", token):
        return True

    # Encoded / tracking-style fragments
    if token.startswith("fclid"):
        return True

    if token.startswith("gclid"):
        return True

    if token.startswith("utm"):
        return True

    return False


# ============================================================
# BASIC TEXT CLEANING
# ============================================================

def clean_text(value):

    if pd.isna(value):
        return ""

    text = str(value).lower().strip()

    text = re.sub(r"https?://", " ", text)
    text = re.sub(r"www\.", " ", text)

    # Remove punctuation
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# GENERAL TOKEN PROCESSING
# ============================================================

def get_tokens(value, remove_generic=True):

    text = clean_text(value)

    if not text:
        return set()

    tokens = set(text.split())

    cleaned = set()

    for token in tokens:

        if len(token) <= 2:
            continue

        if is_noise_token(token):
            continue

        if remove_generic and token in GENERIC_INVESTOR_WORDS:
            continue

        cleaned.add(token)

    return cleaned


def tokens_to_text(value, remove_generic=True):

    tokens = get_tokens(
        value,
        remove_generic=remove_generic
    )

    return " ".join(sorted(tokens))


# ============================================================
# DOMAIN CLEANING
# ============================================================

def clean_domain(value):

    if pd.isna(value):
        return ""

    text = str(value).lower().strip()

    # Completely ignore known Bing / search-result URLs
    if "bing.com" in text:
        return ""

    # Remove protocol
    text = re.sub(r"https?://", "", text)
    text = re.sub(r"www\.", "", text)

    # Remove path
    text = text.split("/")[0]

    # Remove query parameters
    text = text.split("?")[0]

    # Remove punctuation
    text = re.sub(r"[^a-z0-9]", " ", text)

    tokens = text.split()

    cleaned = []

    for token in tokens:

        if token in {"com", "org", "net", "io", "co", "in"}:
            continue

        if is_noise_token(token):
            continue

        cleaned.append(token)

    return " ".join(sorted(set(cleaned)))


# ============================================================
# FUNDING STAGE
# ============================================================

def normalize_stage(stage):

    if pd.isna(stage):
        return "unknown"

    text = str(stage).lower().strip()

    if not text:
        return "unknown"

    # Check specific stages first
    if "pre_seed" in text or "pre seed" in text:
        return "pre_seed"

    if "post_seed" in text or "post seed" in text:
        return "post_seed"

    if "series_a" in text or "series a" in text:
        return "series_a"

    if "series_b" in text or "series b" in text:
        return "series_b"

    if "series_c" in text or "series c" in text:
        return "series_c"

    if "series_d" in text or "series d" in text:
        return "series_d"

    if "series_e" in text or "series e" in text:
        return "series_e"

    if "series_f" in text or "series f" in text:
        return "series_f"

    if "seed" in text:
        return "seed"

    if "angel" in text:
        return "angel"

    if "venture" in text:
        return "venture"

    if "private" in text:
        return "private"

    return "unknown"


# ============================================================
# FOUNDER FEATURES
# ============================================================

def prepare_founders(df):

    result = pd.DataFrame()

    result["id"] = df["id"]
    result["name"] = df["name"]
    result["company"] = df["company"]

    result["funding_stage"] = (
        df["funding_stage"]
        .apply(normalize_stage)
    )

    # Company name
    result["company_features"] = (
        df["company"]
        .fillna("")
        .apply(
            lambda x: tokens_to_text(
                x,
                remove_generic=False
            )
        )
    )

    # Founder website/domain
    result["domain_features"] = (
        df["domain"]
        .fillna("")
        .apply(clean_domain)
    )

    # Competitors
    result["competitor_features"] = (
        df["competitors"]
        .fillna("")
        .apply(tokens_to_text)
    )

    # Ecosystem / umbrella companies
    result["ecosystem_features"] = (
        df["umbrella_companies"]
        .fillna("")
        .apply(tokens_to_text)
    )

    return result


# ============================================================
# INVESTOR FEATURES
# ============================================================

def prepare_investors(df):

    result = pd.DataFrame()

    result["id"] = df["id"]
    result["name"] = df["name"]
    result["firm_name"] = df["firm_name"]

    # Investment stages
    result["investment_stages"] = (
        df["investment_stages"]
        .fillna("")
        .apply(
            lambda x: " ".join(
                sorted(set(str(x).split()))
            )
        )
    )

    # Primary domain
    result["primary_domain"] = (
        df["primary_domain"]
        .fillna("")
        .apply(tokens_to_text)
    )

    # Secondary domains
    result["secondary_domain_features"] = (
        df["secondary_domains"]
        .fillna("")
        .apply(tokens_to_text)
    )

    # Investor tags
    result["tag_features"] = (
        df["tags"]
        .fillna("")
        .apply(tokens_to_text)
    )

    # Previous investments
    investment_history = (
        df["past_investments"].fillna("")
        + " "
        + df["notable_investments"].fillna("")
    )

    result["investment_history"] = (
        investment_history
        .apply(tokens_to_text)
    )

    # Investment thesis
    result["thesis_features"] = (
        df["investment_thesis"]
        .fillna("")
        .apply(tokens_to_text)
    )

    # Biography
    result["bio_features"] = (
        df["bio"]
        .fillna("")
        .apply(tokens_to_text)
    )

    # Keep location separate
    result["location"] = (
        df["location"]
        .fillna("")
        .apply(clean_text)
    )

    # Active investor
    result["active"] = (
        df["active"]
        .astype(str)
        .str.lower()
        .isin(["true", "1", "yes"])
        .astype(int)
    )

    return result


# ============================================================
# MAIN
# ============================================================

def main():

    founders_path = RESULTS_DIR / "processed_founders.csv"
    investors_path = RESULTS_DIR / "processed_investors.csv"

    if not founders_path.exists():
        print(f"Missing file: {founders_path}")
        return

    if not investors_path.exists():
        print(f"Missing file: {investors_path}")
        return

    founders = pd.read_csv(founders_path)
    investors = pd.read_csv(investors_path)

    print("=" * 60)
    print("FEATURE ENGINEERING")
    print("=" * 60)

    print("\nPreparing founder features...")
    founder_features = prepare_founders(founders)

    print("Preparing investor features...")
    investor_features = prepare_investors(investors)

    founder_output = RESULTS_DIR / "founder_features.csv"
    investor_output = RESULTS_DIR / "investor_features.csv"

    founder_features.to_csv(
        founder_output,
        index=False
    )

    investor_features.to_csv(
        investor_output,
        index=False
    )

    print("\nFeature engineering completed.")

    print(f"\nFounder features:")
    print(f"Rows: {len(founder_features)}")
    print(f"Columns: {len(founder_features.columns)}")

    print(f"\nInvestor features:")
    print(f"Rows: {len(investor_features)}")
    print(f"Columns: {len(investor_features.columns)}")

    print("\nCreated files:")
    print(f"  {founder_output}")
    print(f"  {investor_output}")

    print("\nFounder feature columns:")
    print(list(founder_features.columns))

    print("\nInvestor feature columns:")
    print(list(investor_features.columns))


if __name__ == "__main__":
    main()
