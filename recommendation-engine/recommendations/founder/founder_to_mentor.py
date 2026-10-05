import pandas as pd
import numpy as np

from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import sys


# ============================================================
# PATHS
# ============================================================

CURRENT_DIR = Path(__file__).resolve().parent
BASE_DIR = CURRENT_DIR.parent.parent.parent
RESULTS_DIR = BASE_DIR / "results"

ENGINE_DIR = BASE_DIR / "recommendation-engine"

if str(ENGINE_DIR) not in sys.path:
    sys.path.append(str(ENGINE_DIR))

from features.industry_mapper import IndustryMapper


# ============================================================
# HELPERS
# ============================================================

def safe_text(value):
    """Convert missing values to clean lowercase text."""

    if pd.isna(value):
        return ""

    return str(value).strip().lower()


def tokenize(value):
    """
    Convert text into a set of useful tokens.
    Handles commas, semicolons and common separators.
    """

    text = safe_text(value)

    for char in [",", ";", "|", "/", "\\", "-", "_"]:
        text = text.replace(char, " ")

    return {
        token
        for token in text.split()
        if len(token) > 1
    }


def text_similarity(source_texts, target_texts):
    """
    TF-IDF cosine similarity between source and target records.
    """

    source_texts = [
        safe_text(x) for x in source_texts
    ]

    target_texts = [
        safe_text(x) for x in target_texts
    ]

    all_texts = source_texts + target_texts

    if not any(x.strip() for x in all_texts):
        return np.zeros(
            (len(source_texts), len(target_texts))
        )

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True
    )

    matrix = vectorizer.fit_transform(all_texts)

    source_matrix = matrix[
        :len(source_texts)
    ]

    target_matrix = matrix[
        len(source_texts):
    ]

    return cosine_similarity(
        source_matrix,
        target_matrix
    )


# ============================================================
# INDUSTRY COMPATIBILITY
# ============================================================

INDUSTRY_ALIASES = {

    "healthtech / healthcare": [
        "health",
        "healthcare",
        "healthtech",
        "health it",
        "healthit",
        "medical",
        "biotech",
        "pharma"
    ],

    "fintech / finance": [
        "fintech",
        "finance",
        "financial",
        "banking",
        "payments"
    ],

    "agritech": [
        "agritech",
        "agtech",
        "agriculture",
        "farming"
    ],

    "foodtech / food & beverage": [
        "food",
        "foodtech",
        "beverage",
        "restaurant"
    ],

    "e-commerce / retail": [
        "e commerce",
        "ecommerce",
        "commerce",
        "retail",
        "shopping"
    ],

    "saas / enterprise tech": [
        "saas",
        "enterprise",
        "b2b"
    ],

    "technology / digital services": [
        "technology",
        "tech",
        "software",
        "digital",
        "it",
        "information technology"
    ],

    "cybersecurity": [
        "cybersecurity",
        "cyber",
        "security",
        "information security"
    ],

    "edtech / education": [
        "education",
        "edtech",
        "learning",
        "training"
    ],

    "cleantech / sustainability": [
        "cleantech",
        "clean energy",
        "sustainability",
        "climate",
        "energy"
    ],

    "automotive / autotech": [
        "automotive",
        "automobile",
        "autotech",
        "vehicle",
        "mobility"
    ],

    "logistics / mobility": [
        "logistics",
        "transportation",
        "mobility",
        "supply chain"
    ],

    "real estate / proptech": [
        "real estate",
        "proptech",
        "property"
    ],

    "media / entertainment": [
        "media",
        "entertainment",
        "content",
        "gaming"
    ],

    "traveltech / hospitality": [
        "travel",
        "tourism",
        "hospitality",
        "hotel"
    ]
}


def normalize_industry(value):
    text = safe_text(value)

    for canonical, aliases in INDUSTRY_ALIASES.items():

        for alias in aliases:

            if alias in text:
                return canonical

    return text


def industry_compatibility(
    founder_industries,
    mentor_industry
):
    """
    Calculate industry compatibility between founder
    predicted industries and mentor industry.
    """

    mentor_industry = normalize_industry(
        mentor_industry
    )

    if not mentor_industry:
        return 0.0

    best_score = 0.0

    for prediction in founder_industries:

        predicted = normalize_industry(
            prediction["industry"]
        )

        confidence = float(
            prediction.get("confidence", 0)
        )

        if predicted == mentor_industry:

            score = confidence

        else:

            # Technology is a broad compatibility category.
            if (
                predicted == "technology / digital services"
                and mentor_industry
                in {
                    "saas / enterprise tech",
                    "cybersecurity"
                }
            ):
                score = confidence * 0.75

            elif (
                mentor_industry
                == "technology / digital services"
                and predicted
                in {
                    "saas / enterprise tech",
                    "cybersecurity"
                }
            ):
                score = confidence * 0.75

            else:
                score = 0.0

        best_score = max(
            best_score,
            score
        )

    return min(best_score, 1.0)


# ============================================================
# FOUNDER â†’ MENTOR ENGINE
# ============================================================

class FounderMentorEngine:

    def __init__(self):

        founder_path = (
            RESULTS_DIR /
            "founder_features.csv"
        )

        mentor_path = (
            RESULTS_DIR /
            "processed_mentors.csv"
        )

        if not founder_path.exists():
            raise FileNotFoundError(
                f"Missing file: {founder_path}"
            )

        if not mentor_path.exists():
            raise FileNotFoundError(
                f"Missing file: {mentor_path}"
            )

        # ----------------------------------------------------
        # Load data
        # ----------------------------------------------------

        self.founders = pd.read_csv(
            founder_path
        ).fillna("")

        self.mentors = pd.read_csv(
            mentor_path
        ).fillna("")

        print(
            f"Loaded {len(self.founders)} founders"
        )

        print(
            f"Loaded {len(self.mentors)} mentors"
        )

        # ----------------------------------------------------
        # Industry Mapper
        # ----------------------------------------------------

        print(
            "\nInitializing industry mapper..."
        )

        self.industry_mapper = (
            IndustryMapper()
        )

        # ----------------------------------------------------
        # Founder text
        # ----------------------------------------------------

        self.founder_text = (
            self.founders["company_features"]
            + " "
            + self.founders["domain_features"]
            + " "
            + self.founders["competitor_features"]
            + " "
            + self.founders["ecosystem_features"]
        )

        # ----------------------------------------------------
        # Mentor text
        # ----------------------------------------------------

        self.mentor_text = (
            self.mentors["expertise"]
            + " "
            + self.mentors["skills"]
            + " "
            + self.mentors["industry"]
            + " "
            + self.mentors["domain"]
            + " "
            + self.mentors["interests"]
        )

        # ----------------------------------------------------
        # TF-IDF similarity
        # ----------------------------------------------------

        print(
            "\nBuilding Founder â†’ Mentor similarity matrix..."
        )

        self.text_similarity_matrix = (
            text_similarity(
                self.founder_text,
                self.mentor_text
            )
        )

        # ----------------------------------------------------
        # Individual similarity signals
        # ----------------------------------------------------

        self.expertise_similarity = (
            text_similarity(
                self.founders[
                    "domain_features"
                ],
                self.mentors[
                    "expertise"
                ]
            )
        )

        self.skills_similarity = (
            text_similarity(
                self.founder_text,
                self.mentors[
                    "skills"
                ]
            )
        )

        self.interest_similarity = (
            text_similarity(
                self.founder_text,
                self.mentors[
                    "interests"
                ]
            )
        )

        print(
            "Similarity matrices created."
        )

    # ========================================================
    # INDUSTRY SCORES
    # ========================================================

    def calculate_industry_scores(
        self,
        founder_id
    ):

        matching = self.founders[
            self.founders["id"].astype(str)
            == str(founder_id)
        ]

        if matching.empty:
            return (
                np.zeros(len(self.mentors)),
                []
            )

        predictions = (
            self.industry_mapper
            .predict_industries(
                founder_id,
                top_n=5
            )
        )

        if not predictions:
            return (
                np.zeros(len(self.mentors)),
                []
            )

        scores = []

        for _, mentor in self.mentors.iterrows():

            score = industry_compatibility(
                predictions,
                mentor["industry"]
            )

            scores.append(score)

        scores = np.array(scores)

        return scores, predictions

    # ========================================================
    # SKILL OVERLAP
    # ========================================================

    def calculate_skill_overlap(
        self,
        founder_index,
        mentor_index
    ):

        founder = self.founders.iloc[
            founder_index
        ]

        mentor = self.mentors.iloc[
            mentor_index
        ]

        founder_tokens = set()

        for column in [
            "company_features",
            "domain_features",
            "competitor_features",
            "ecosystem_features"
        ]:
            founder_tokens.update(
                tokenize(founder[column])
            )

        mentor_tokens = set()

        for column in [
            "skills",
            "expertise",
            "domain",
            "interests"
        ]:
            mentor_tokens.update(
                tokenize(mentor[column])
            )

        if not founder_tokens or not mentor_tokens:
            return 0.0

        intersection = (
            founder_tokens &
            mentor_tokens
        )

        union = (
            founder_tokens |
            mentor_tokens
        )

        if not union:
            return 0.0

        return len(intersection) / len(union)

    # ========================================================
    # EXPERIENCE SCORE
    # ========================================================

    def experience_score(
        self,
        experience_years
    ):

        try:
            years = float(
                experience_years
            )
        except:
            return 0.0

        # More experience is useful,
        # but we cap the contribution.
        return min(
            years / 20.0,
            1.0
        )

    # ========================================================
    # FINAL SCORE
    # ========================================================

    def calculate_score(
        self,
        founder_index,
        mentor_index,
        industry_scores
    ):

        industry_score = float(
            industry_scores[
                mentor_index
            ]
        )

        general_similarity = float(
            self.text_similarity_matrix[
                founder_index,
                mentor_index
            ]
        )

        expertise_score = float(
            self.expertise_similarity[
                founder_index,
                mentor_index
            ]
        )

        skills_score = float(
            self.skills_similarity[
                founder_index,
                mentor_index
            ]
        )

        interest_score = float(
            self.interest_similarity[
                founder_index,
                mentor_index
            ]
        )

        skill_overlap = self.calculate_skill_overlap(
            founder_index,
            mentor_index
        )

        mentor = self.mentors.iloc[
            mentor_index
        ]

        experience = self.experience_score(
            mentor["experience_years"]
        )

        # ----------------------------------------------------
        # Weighted recommendation score
        # ----------------------------------------------------

        final_score = (

            industry_score * 0.30

            + general_similarity * 0.20

            + expertise_score * 0.15

            + skills_score * 0.15

            + skill_overlap * 0.10

            + interest_score * 0.05

            + experience * 0.05
        )

        return min(
            max(final_score, 0.0),
            1.0
        )

    # ========================================================
    # RECOMMEND MENTORS
    # ========================================================

    def recommend_mentors(
        self,
        founder_id,
        top_n=5
    ):

        matching = self.founders[
            self.founders["id"].astype(str)
            == str(founder_id)
        ]

        if matching.empty:
            return [], []

        founder_index = (
            matching.index[0]
        )

        # ----------------------------------------------------
        # Industry compatibility
        # ----------------------------------------------------

        (
            industry_scores,
            industries
        ) = self.calculate_industry_scores(
            founder_id
        )

        recommendations = []

        # ----------------------------------------------------
        # Score every mentor
        # ----------------------------------------------------

        for mentor_index in range(
            len(self.mentors)
        ):

            mentor = self.mentors.iloc[
                mentor_index
            ]

            score = self.calculate_score(
                founder_index,
                mentor_index,
                industry_scores
            )

            recommendations.append({

                "mentor_id":
                    mentor["id"],

                "mentor_name":
                    mentor["name"],

                "expertise":
                    mentor["expertise"],

                "skills":
                    mentor["skills"],

                "industry":
                    mentor["industry"],

                "domain":
                    mentor["domain"],

                "experience_years":
                    mentor[
                        "experience_years"
                    ],

                "location":
                    mentor["location"],

                "interests":
                    mentor["interests"],

                "industry_score":
                    round(
                        float(
                            industry_scores[
                                mentor_index
                            ]
                        ) * 100,
                        2
                    ),

                "score":
                    score,

                "score_percentage":
                    round(
                        score * 100,
                        2
                    )
            })

        # ----------------------------------------------------
        # Sort
        # ----------------------------------------------------

        recommendations.sort(
            key=lambda x: (
                -x["score"],
                str(
                    x["mentor_name"]
                )
            )
        )

        return (
            recommendations[:top_n],
            industries
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("FOUNDER â†’ MENTOR RECOMMENDATION")
    print("=" * 70)

    engine = FounderMentorEngine()

    # --------------------------------------------------------
    # Use first founder
    # --------------------------------------------------------

    founder = engine.founders.iloc[0]

    founder_id = founder["id"]

    print(
        f"\nFounder: {founder['name']}"
    )

    print(
        f"Company: {founder['company']}"
    )

    print(
        f"ID: {founder_id}"
    )

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    recommendations, industries = (
        engine.recommend_mentors(
            founder_id=founder_id,
            top_n=5
        )
    )

    # --------------------------------------------------------
    # Industries
    # --------------------------------------------------------

    print("\nPredicted Industries:")

    if not industries:

        print(
            "No industry prediction found."
        )

    else:

        for i, industry in enumerate(
            industries,
            1
        ):

            print(
                f"{i}. "
                f"{industry['industry']} "
                f"({industry['confidence']:.2%})"
            )

    # --------------------------------------------------------
    # Top mentors
    # --------------------------------------------------------

    print("\nTop 5 Mentors:")

    if not recommendations:

        print(
            "No mentor recommendations found."
        )

        return

    for i, mentor in enumerate(
        recommendations,
        1
    ):

        print(
            f"\n{i}. "
            f"{mentor['mentor_name']}"
        )

        print(
            f"   Expertise: "
            f"{mentor['expertise']}"
        )

        print(
            f"   Skills: "
            f"{mentor['skills']}"
        )

        print(
            f"   Industry: "
            f"{mentor['industry']}"
        )

        print(
            f"   Experience: "
            f"{mentor['experience_years']} years"
        )

        print(
            f"   Industry Compatibility: "
            f"{mentor['industry_score']:.2f}%"
        )

        print(
            f"   Overall Compatibility: "
            f"{mentor['score_percentage']:.2f}%"
        )


if __name__ == "__main__":
    main()

