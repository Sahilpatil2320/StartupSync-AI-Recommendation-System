import pandas as pd
import numpy as np

from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RESULTS_DIR = BASE_DIR / "results"


# ============================================================
# TEXT HELPER
# ============================================================

def safe_text(value):

    if pd.isna(value):
        return ""

    return str(value).strip().lower()


# ============================================================
# INDUSTRY MAPPER
# ============================================================

class IndustryMapper:

    def __init__(self):

        startup_path = (
            RESULTS_DIR /
            "processed_startups.csv"
        )

        founder_path = (
            RESULTS_DIR /
            "founder_features.csv"
        )

        if not startup_path.exists():
            raise FileNotFoundError(
                f"Missing file: {startup_path}"
            )

        if not founder_path.exists():
            raise FileNotFoundError(
                f"Missing file: {founder_path}"
            )

        self.startups = pd.read_csv(
            startup_path
        )

        self.founders = pd.read_csv(
            founder_path
        )

        self.startups = (
            self.startups.fillna("")
        )

        self.founders = (
            self.founders.fillna("")
        )

        print(
            f"Loaded {len(self.startups)} startups"
        )

        print(
            f"Loaded {len(self.founders)} founders"
        )

        # ----------------------------------------------------
        # Build startup semantic text
        # ----------------------------------------------------

        self.startup_text = (
            self.startups["name"]
            + " "
            + self.startups["industry"]
            + " "
            + self.startups["required_skills"]
            + " "
            + self.startups["recommended_roles"]
            + " "
            + self.startups["tags"]
        ).apply(safe_text)

        # ----------------------------------------------------
        # Build TF-IDF corpus
        # ----------------------------------------------------

        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True
        )

        self.startup_matrix = (
            self.vectorizer.fit_transform(
                self.startup_text
            )
        )

        print(
            "Startup semantic index created."
        )

    # ========================================================
    # BUILD FOUNDER TEXT
    # ========================================================

    def build_founder_text(self, founder):

        return safe_text(
            founder["company_features"]
            + " "
            + founder["domain_features"]
            + " "
            + founder["competitor_features"]
            + " "
            + founder["ecosystem_features"]
        )

    # ========================================================
    # PREDICT INDUSTRIES
    # ========================================================

    def predict_industries(
        self,
        founder_id,
        top_n=5
    ):

        matching = self.founders[
            self.founders["id"].astype(str)
            == str(founder_id)
        ]

        if matching.empty:
            return []

        founder = matching.iloc[0]

        founder_text = self.build_founder_text(
            founder
        )

        if not founder_text.strip():
            return []

        founder_vector = (
            self.vectorizer.transform(
                [founder_text]
            )
        )

        similarities = cosine_similarity(
            founder_vector,
            self.startup_matrix
        )[0]

        # ----------------------------------------------------
        # Take strongest startup matches
        # ----------------------------------------------------

        # ----------------------------------------------------
        # Keep only startups with actual semantic similarity
        # ----------------------------------------------------

        positive_indices = np.where(
            similarities > 0
        )[0]

        if len(positive_indices) == 0:
            return []

        top_indices = positive_indices[
            np.argsort(
                similarities[positive_indices]
            )[::-1]
        ][:30]

        matched_startups = (
            self.startups.iloc[top_indices]
            .copy()
        )

        matched_startups["similarity"] = (
            similarities[top_indices]
        )

        # ----------------------------------------------------
        # Aggregate similarity by industry
        # ----------------------------------------------------

        industry_scores = {}

        for _, startup in matched_startups.iterrows():

            industry = safe_text(
                startup["industry"]
            )

            if not industry:
                continue

            score = float(
                startup["similarity"]
            )

            if industry not in industry_scores:
                industry_scores[industry] = []

            industry_scores[industry].append(
                score
            )

        results = []

        for industry, scores in (
            industry_scores.items()
        ):

            # Average of matched startup scores
            average_score = np.mean(scores)

            # Best matching startup score
            best_score = np.max(scores)

            # Number of supporting startups
            support_count = len(scores)

            # Combined industry confidence
            confidence = (
                average_score * 0.70
                + best_score * 0.20
                + min(
                    support_count / 10,
                    1.0
                ) * 0.10
            )

            results.append({

                "industry": industry,

                "confidence": float(
                    confidence
                ),

                "supporting_startups":
                    support_count,

                "best_similarity":
                    float(best_score)
            })

        results.sort(
            key=lambda x: (
                -x["confidence"],
                -x["supporting_startups"]
            )
        )

        return results[:top_n]


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    mapper = IndustryMapper()

    founder = mapper.founders.iloc[0]

    print("\n" + "=" * 70)
    print("FOUNDER â†’ INDUSTRY MAPPING")
    print("=" * 70)

    print(
        f"\nFounder: {founder['name']}"
    )

    print(
        f"Company: {founder['company']}"
    )

    print(
        f"Funding Stage: "
        f"{founder['funding_stage']}"
    )

    print("\nPredicted industries:\n")

    industries = mapper.predict_industries(
        founder_id=founder["id"],
        top_n=5
    )

    if not industries:

        print(
            "No reliable industry signal found."
        )

    else:

        for position, result in enumerate(
            industries,
            start=1
        ):

            print(
                f"{position}. "
                f"{result['industry']}"
            )

            print(
                f"   Confidence: "
                f"{result['confidence'] * 100:.2f}%"
            )

            print(
                f"   Supporting startups: "
                f"{result['supporting_startups']}"
            )

            print(
                f"   Best similarity: "
                f"{result['best_similarity'] * 100:.2f}%"
            )

            print()
