import pandas as pd
import re


# ============================================================
# StartupSync - Recommendation Dataset Audit
# ============================================================

FOUNDERS_FILE = "results/processed_founders.csv"
INVESTORS_FILE = "results/processed_investors.csv"


# ------------------------------------------------------------
# Utility
# ------------------------------------------------------------

def usable_count(series):
    """
    Count non-empty and non-unknown values.
    """

    values = series.fillna("").astype(str).str.strip()

    return (
        (values != "") &
        (values.str.lower() != "unknown")
    ).sum()


def unique_count(series):
    """
    Count unique non-empty values.
    """

    values = (
        series
        .fillna("")
        .astype(str)
        .str.strip()
    )

    values = values[
        (values != "") &
        (values.str.lower() != "unknown")
    ]

    return values.nunique()


def repeated_token_count(series):
    """
    Find frequently repeated tokens.
    """

    counter = {}

    for value in series.fillna("").astype(str):

        words = re.findall(
            r"[a-zA-Z0-9]+",
            value.lower()
        )

        for word in set(words):

            if len(word) < 3:
                continue

            counter[word] = (
                counter.get(word, 0) + 1
            )

    return sorted(
        counter.items(),
        key=lambda x: x[1],
        reverse=True
    )


# ============================================================
# Load Data
# ============================================================

founders = pd.read_csv(
    FOUNDERS_FILE
)

investors = pd.read_csv(
    INVESTORS_FILE
)


# ============================================================
# Founder Audit
# ============================================================

print()
print("=" * 70)
print("FOUNDER DATASET AUDIT")
print("=" * 70)

print(
    "Total founders:",
    len(founders)
)

print()

founder_fields = [
    "company",
    "domain",
    "funding_stage",
    "competitors",
    "umbrella_companies"
]

for field in founder_fields:

    usable = usable_count(
        founders[field]
    )

    unique = unique_count(
        founders[field]
    )

    print(
        f"{field:<22} "
        f"Usable: {usable:<4} "
        f"Unique: {unique:<4}"
    )


# ------------------------------------------------------------
# Founder Funding Stage Distribution
# ------------------------------------------------------------

print()
print("Founder Funding Stage Distribution")
print("-" * 70)

print(
    founders["funding_stage"]
    .fillna("missing")
    .value_counts()
    .to_string()
)


# ------------------------------------------------------------
# Founder Domain Quality
# ------------------------------------------------------------

print()
print("Founder Domain Quality")
print("-" * 70)

domain = (
    founders["domain"]
    .fillna("")
    .astype(str)
    .str.lower()
)

bing_count = domain.str.contains(
    "bing.com",
    na=False
).sum()

http_count = domain.str.contains(
    "http",
    na=False
).sum()

empty_domain = (
    domain.str.strip() == ""
).sum()

print(
    "Bing/noisy domains :",
    bing_count
)

print(
    "URL-style domains  :",
    http_count
)

print(
    "Empty domains      :",
    empty_domain
)


# ------------------------------------------------------------
# Founder Repeated Tokens
# ------------------------------------------------------------

print()
print("Most Repeated Founder Competitor Tokens")
print("-" * 70)

competitor_tokens = repeated_token_count(
    founders["competitors"]
)

for word, count in competitor_tokens[:15]:

    print(
        f"{word:<25} {count}"
    )


# ============================================================
# Investor Audit
# ============================================================

print()
print("=" * 70)
print("INVESTOR DATASET AUDIT")
print("=" * 70)

print(
    "Total investors:",
    len(investors)
)

print()

investor_fields = [
    "primary_domain",
    "secondary_domains",
    "investment_stages",
    "past_investments",
    "notable_investments",
    "bio",
    "investment_thesis",
    "tags",
    "location"
]

for field in investor_fields:

    usable = usable_count(
        investors[field]
    )

    unique = unique_count(
        investors[field]
    )

    print(
        f"{field:<22} "
        f"Usable: {usable:<4} "
        f"Unique: {unique:<4}"
    )


# ------------------------------------------------------------
# Investor Stage Distribution
# ------------------------------------------------------------

print()
print("Investor Investment Stage Distribution")
print("-" * 70)

stage_tokens = []

for value in investors[
    "investment_stages"
].fillna(""):

    stage_tokens.extend(
        str(value).split()
    )

stage_counts = pd.Series(
    stage_tokens
).value_counts()

print(
    stage_counts.to_string()
)


# ------------------------------------------------------------
# Investor Repeated Tags
# ------------------------------------------------------------

print()
print("Most Repeated Investor Tags")
print("-" * 70)

tag_tokens = repeated_token_count(
    investors["tags"]
)

for word, count in tag_tokens[:20]:

    print(
        f"{word:<30} {count}"
    )


# ------------------------------------------------------------
# Investor Repeated Investment Names
# ------------------------------------------------------------

print()
print("Most Repeated Past Investment Tokens")
print("-" * 70)

investment_tokens = repeated_token_count(
    investors["past_investments"]
)

for word, count in investment_tokens[:20]:

    print(
        f"{word:<30} {count}"
    )


# ============================================================
# Recommendation Feature Summary
# ============================================================

print()
print("=" * 70)
print("RECOMMENDATION FEATURE SUMMARY")
print("=" * 70)

print()
print("Founder → Investor")

print()
print("Strong candidate features:")
print("1. Funding stage")
print("2. Investor domains")
print("3. Investor tags")
print("4. Investment thesis")
print("5. Previous investments")

print()
print("Potentially weak/noisy features:")
print("1. Founder website/domain")
print("2. Company name")
print("3. Competitor names")
print("4. Umbrella company names")

print()
print("=" * 70)
print("AUDIT COMPLETED")
print("=" * 70)