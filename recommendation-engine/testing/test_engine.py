import pandas as pd
import random

from founder_to_investor import recommend_investors


# ============================================================
# Load Data
# ============================================================

founders = pd.read_csv(
    "results/processed_founders.csv"
)

investors = pd.read_csv(
    "results/processed_investors.csv"
)


# ============================================================
# Select Valid Founders
# ============================================================

valid_founders = founders[
    (founders["funding_stage"].notna()) &
    (founders["funding_stage"].str.lower() != "unknown") &
    (founders["company"].notna()) &
    (founders["company"].str.strip() != "") &
    (founders["competitors"].notna()) &
    (founders["competitors"].str.strip() != "")
].copy()


# Remove obviously noisy Bing domains

valid_founders = valid_founders[
    ~valid_founders["domain"]
    .fillna("")
    .str.contains(
        "bing.com",
        case=False,
        na=False
    )
]


# ============================================================
# Random Founder
# ============================================================

founder = valid_founders.sample(
    n=1
).iloc[0]


# ============================================================
# Display Founder
# ============================================================

print()

print("RANDOM TEST FOUNDER")
print("=" * 70)

print(
    "Founder ID    :",
    founder["id"]
)

print(
    "Company       :",
    founder["company"]
)

print(
    "Domain        :",
    founder["domain"]
)

print(
    "Funding Stage :",
    founder["funding_stage"]
)

print(
    "Competitors   :",
    founder["competitors"]
)

print(
    "Umbrella      :",
    founder["umbrella_companies"]
)


# ============================================================
# Generate Recommendations
# ============================================================

recommendations = recommend_investors(
    founder,
    investors,
    top_n=5
)


# ============================================================
# Display Recommendations
# ============================================================

print()

print("TOP 5 INVESTOR RECOMMENDATIONS")
print("=" * 70)


for index, row in recommendations.iterrows():

    print()

    print(
        f"Rank #{index + 1}"
    )

    print(
        "Investor            :",
        row["investor_name"]
    )

    print(
        "Firm                :",
        row["firm_name"]
    )

    print(
        "Compatibility Score :",
        f'{row["compatibility_score"]:.2f}%'
    )


print()

print("=" * 70)