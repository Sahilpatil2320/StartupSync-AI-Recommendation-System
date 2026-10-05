import os
import re
import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RESULTS_DIR = os.path.join(BASE_DIR, "results")


# ============================================================
# LOAD DATA
# ============================================================

INVESTOR_FILE = os.path.join(
    RESULTS_DIR,
    "investor_features.csv"
)

FOUNDER_FILE = os.path.join(
    RESULTS_DIR,
    "founder_features.csv"
)


# ============================================================
# INDUSTRY KEYWORDS
# ============================================================

INDUSTRY_KEYWORDS = {

    "healthtech / healthcare": [
        "health",
        "healthcare",
        "medical",
        "medicine",
        "hospital",
        "healthtech",
        "biotech",
        "pharma",
        "diagnostic",
        "clinical",
        "patient",
        "wellness",
        "telehealth",
        "digital health"
    ],

    "fintech / finance": [
        "fintech",
        "finance",
        "financial",
        "banking",
        "payments",
        "payment",
        "insurance",
        "insurtech",
        "lending",
        "credit",
        "wealth",
        "investment"
    ],

    "agritech": [
        "agtech",
        "agriculture",
        "agritech",
        "farming",
        "farm",
        "food",
        "crop"
    ],

    "foodtech / food & beverage": [
        "food",
        "beverage",
        "restaurant",
        "grocery",
        "foodtech"
    ],

    "e-commerce / retail": [
        "commerce",
        "ecommerce",
        "e-commerce",
        "retail",
        "marketplace",
        "shopping",
        "consumer"
    ],

    "saas / enterprise tech": [
        "saas",
        "enterprise",
        "b2b",
        "software",
        "business software",
        "enterprise software"
    ],

    "logistics / mobility": [
        "logistics",
        "transportation",
        "mobility",
        "shipping",
        "delivery",
        "fleet",
        "supply chain"
    ],

    "real estate / proptech": [
        "real estate",
        "estate",
        "property",
        "proptech",
        "housing",
        "construction"
    ],

    "media / entertainment": [
        "media",
        "entertainment",
        "content",
        "music",
        "video",
        "gaming",
        "games"
    ],

    "cleantech / sustainability": [
        "cleantech",
        "clean tech",
        "climatetech",
        "climate",
        "sustainability",
        "energy",
        "renewable",
        "solar",
        "environment"
    ],

    "edtech / education": [
        "education",
        "edtech",
        "learning",
        "school",
        "student",
        "training",
        "university"
    ],

    "cybersecurity": [
        "security",
        "cybersecurity",
        "cyber",
        "infosec",
        "privacy",
        "identity"
    ],

    "automotive / autotech": [
        "automotive",
        "automobile",
        "car",
        "vehicle",
        "mobility",
        "ev",
        "electric vehicle"
    ],

    "traveltech / hospitality": [
        "travel",
        "tourism",
        "hospitality",
        "hotel",
        "booking",
        "vacation"
    ],

    "technology / digital services": [
        "technology",
        "tech",
        "software",
        "cloud",
        "developer",
        "infrastructure",
        "digital",
        "platform",
        "internet",
        "api"
    ]
}


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def clean_text(value):
    """
    Convert any value into clean lowercase text.
    """

    if pd.isna(value):
        return ""

    value = str(value).lower()

    value = re.sub(
        r"[^a-z0-9\s\-\/]",
        " ",
        value
    )

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


def tokenize(text):
    """
    Convert text into a set of words.
    """

    text = clean_text(text)

    if not text:
        return set()

    return set(text.split())


# ============================================================
# INVESTOR -> FOUNDER ENGINE
# ============================================================

class InvestorFounderEngine:

    def __init__(self):

        print("Loading Investor â†’ Founder recommendation engine...")

        self.load_data()

        self.prepare_data()

        self.build_similarity()

        # IMPORTANT:
        # Create IndustryMapper only ONCE.
        # Previously it was being created repeatedly
        # for every founder.
        self.build_industry_predictions()


    # ========================================================
    # LOAD DATA
    # ========================================================

    def load_data(self):

        self.investors = pd.read_csv(
            INVESTOR_FILE
        )

        self.founders = pd.read_csv(
            FOUNDER_FILE
        )

        print(
            f"Loaded {len(self.investors)} investors"
        )

        print(
            f"Loaded {len(self.founders)} founders"
        )


    # ========================================================
    # PREPARE DATA
    # ========================================================

    def prepare_data(self):

        # Make sure important columns exist.

        investor_columns = [
            "investment_stages",
            "primary_domain",
            "secondary_domain_features",
            "tag_features",
            "investment_history",
            "thesis_features",
            "bio_features",
            "location",
            "active"
        ]

        for column in investor_columns:

            if column not in self.investors.columns:

                self.investors[column] = ""


        founder_columns = [
            "funding_stage",
            "company_features",
            "domain_features",
            "competitor_features",
            "ecosystem_features"
        ]

        for column in founder_columns:

            if column not in self.founders.columns:

                self.founders[column] = ""


        # Clean text fields.

        for column in investor_columns:

            self.investors[column] = (
                self.investors[column]
                .fillna("")
                .astype(str)
                .apply(clean_text)
            )


        for column in founder_columns:

            self.founders[column] = (
                self.founders[column]
                .fillna("")
                .astype(str)
                .apply(clean_text)
            )


    # ========================================================
    # BUILD INVESTOR -> FOUNDER TF-IDF SIMILARITY
    # ========================================================

    def build_similarity(self):

        print(
            "\nBuilding Investor â†’ Founder similarity matrix..."
        )

        investor_text = []

        for _, investor in self.investors.iterrows():

            text = " ".join([
                investor["primary_domain"],
                investor["secondary_domain_features"],
                investor["tag_features"],
                investor["investment_history"],
                investor["thesis_features"],
                investor["bio_features"],
                investor["location"],
                investor["investment_stages"]
            ])

            investor_text.append(text)


        founder_text = []

        for _, founder in self.founders.iterrows():

            text = " ".join([
                founder["company_features"],
                founder["domain_features"],
                founder["competitor_features"],
                founder["ecosystem_features"],
                founder["funding_stage"]
            ])

            founder_text.append(text)


        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1
        )


        combined_text = (
            investor_text +
            founder_text
        )


        matrix = self.vectorizer.fit_transform(
            combined_text
        )


        investor_matrix = matrix[
            :len(investor_text)
        ]

        founder_matrix = matrix[
            len(investor_text):
        ]


        self.similarity_matrix = cosine_similarity(
            investor_matrix,
            founder_matrix
        )


        print(
            "Similarity matrix created."
        )


    # ========================================================
    # BUILD INDUSTRY PREDICTIONS
    # ========================================================

    def build_industry_predictions(self):

        print(
            "\nBuilding founder industry predictions..."
        )

        import sys
        from pathlib import Path

        ENGINE_DIR = Path(__file__).resolve().parent.parent.parent

        if str(ENGINE_DIR) not in sys.path:
            sys.path.append(str(ENGINE_DIR))

        from features.industry_mapper import IndustryMapper

        # Create IndustryMapper ONLY ONCE.

        self.industry_mapper = IndustryMapper()

        self.founder_industries = {}


        # Calculate industry predictions for
        # every founder and store them.

        for _, founder in self.founders.iterrows():

            try:

                predictions = (
                    self.industry_mapper.predict_industries(
                        founder["id"],
                        top_n=5
                    )
                )

                self.founder_industries[
                    founder["id"]
                ] = predictions

            except Exception:

                self.founder_industries[
                    founder["id"]
                ] = []


        print(
            "Founder industry predictions created."
        )


    # ========================================================
    # GET FOUNDER INDUSTRIES
    # ========================================================

    def predict_founder_industries(
        self,
        founder
    ):

        return self.founder_industries.get(
            founder["id"],
            []
        )


    # ========================================================
    # STAGE MATCH
    # ========================================================

    def stage_match(
        self,
        investor,
        founder
    ):

        investor_stages = tokenize(
            investor["investment_stages"]
        )

        founder_stage = clean_text(
            founder["funding_stage"]
        )


        if not investor_stages:
            return 0.0


        if not founder_stage:
            return 0.0


        founder_stage = founder_stage.replace(
            "-",
            "_"
        )


        # Direct stage match.

        if founder_stage in investor_stages:

            return 1.0


        # Handle common aliases.

        aliases = {

            "pre_seed": [
                "preseed",
                "pre_seed",
                "pre seed"
            ],

            "series_a": [
                "series_a",
                "seriesa",
                "series a"
            ],

            "series_b": [
                "series_b",
                "seriesb",
                "series b"
            ],

            "series_c": [
                "series_c",
                "seriesc",
                "series c"
            ]
        }


        for standard_stage, values in aliases.items():

            if founder_stage in values:

                for investor_stage in investor_stages:

                    if investor_stage in values:

                        return 1.0


        return 0.0


    # ========================================================
    # INDUSTRY MATCH
    # ========================================================

    def industry_match(
        self,
        investor,
        founder
    ):

        predictions = (
            self.predict_founder_industries(
                founder
            )
        )


        if not predictions:

            return 0.0


        # Investor text.

        investor_text = " ".join([
            investor["primary_domain"],
            investor["secondary_domain_features"],
            investor["tag_features"],
            investor["investment_history"],
            investor["thesis_features"],
            investor["bio_features"]
        ])


        investor_text = clean_text(
            investor_text
        )


        investor_tokens = tokenize(
            investor_text
        )


        if not investor_tokens:

            return 0.0


        best_score = 0.0


        # IndustryMapper returns dictionaries.

        for prediction in predictions:

            if isinstance(
                prediction,
                dict
            ):

                industry = (
                    prediction.get(
                        "industry",
                        ""
                    )
                )

                industry_confidence = (
                    prediction.get(
                        "confidence",
                        0
                    )
                )

            else:

                continue


            industry = clean_text(
                industry
            )


            if not industry:
                continue


            keywords = (
                INDUSTRY_KEYWORDS.get(
                    industry,
                    []
                )
            )


            if not keywords:
                continue


            matched = 0

            for keyword in keywords:

                keyword = clean_text(
                    keyword
                )

                if not keyword:
                    continue


                if " " in keyword:

                    if keyword in investor_text:

                        matched += 1

                else:

                    if keyword in investor_tokens:

                        matched += 1


            if matched == 0:
                continue


            keyword_score = (
                matched /
                len(keywords)
            )


            # Industry mapper confidence is expected
            # to be percentage-like in many cases.
            # Normalize it safely.

            confidence = float(
                industry_confidence
            )


            if confidence > 1:

                confidence = (
                    confidence / 100.0
                )


            confidence = max(
                0.0,
                min(
                    confidence,
                    1.0
                )
            )


            score = (
                keyword_score * 0.60
                +
                confidence * 0.40
            )


            best_score = max(
                best_score,
                score
            )


        return best_score


    # ========================================================
    # HISTORY MATCH
    # ========================================================

    def history_match(
        self,
        investor,
        founder
    ):

        history_text = " ".join([
            investor["investment_history"],
            investor["tag_features"]
        ])


        history_text = clean_text(
            history_text
        )


        if not history_text:
            return 0.0


        founder_text = " ".join([
            founder["company_features"],
            founder["domain_features"],
            founder["competitor_features"]
        ])


        founder_text = clean_text(
            founder_text
        )


        if not founder_text:
            return 0.0


        investor_tokens = tokenize(
            history_text
        )

        founder_tokens = tokenize(
            founder_text
        )


        if not investor_tokens:
            return 0.0

        if not founder_tokens:
            return 0.0


        overlap = (
            investor_tokens
            &
            founder_tokens
        )


        return (
            len(overlap)
            /
            max(
                1,
                len(founder_tokens)
            )
        )


    # ========================================================
    # ECOSYSTEM MATCH
    # ========================================================

    def ecosystem_match(
        self,
        investor,
        founder
    ):

        investor_text = " ".join([
            investor["primary_domain"],
            investor["secondary_domain_features"],
            investor["location"],
            investor["tag_features"]
        ])


        founder_text = " ".join([
            founder["ecosystem_features"],
            founder["competitor_features"]
        ])


        investor_tokens = tokenize(
            investor_text
        )

        founder_tokens = tokenize(
            founder_text
        )


        if not investor_tokens:
            return 0.0

        if not founder_tokens:
            return 0.0


        overlap = (
            investor_tokens
            &
            founder_tokens
        )


        if not overlap:
            return 0.0


        return (
            len(overlap)
            /
            max(
                1,
                len(founder_tokens)
            )
        )


    # ========================================================
    # GENERAL TF-IDF MATCH
    # ========================================================

    def general_similarity(
        self,
        investor_index,
        founder_index
    ):

        return float(
            self.similarity_matrix[
                investor_index,
                founder_index
            ]
        )


    # ========================================================
    # ACTIVE INVESTOR SCORE
    # ========================================================

    def active_score(
        self,
        investor
    ):

        value = clean_text(
            investor["active"]
        )


        if value in [
            "true",
            "yes",
            "1",
            "active"
        ]:

            return 1.0


        if value in [
            "false",
            "no",
            "0",
            "inactive"
        ]:

            return 0.0


        return 0.5


    # ========================================================
    # RECOMMEND FOUNDERS
    # ========================================================

    def recommend_founders(
        self,
        investor_id,
        top_n=5
    ):

        # Find investor.

        investor_matches = self.investors[
            self.investors["id"].astype(str)
            ==
            str(investor_id)
        ]


        if investor_matches.empty:

            print(
                f"Investor ID {investor_id} not found."
            )

            return []


        investor_index = (
            investor_matches.index[0]
        )


        investor = (
            self.investors.loc[
                investor_index
            ]
        )


        recommendations = []


        for founder_index, founder in (
            self.founders.iterrows()
        ):

            # --------------------------------------------
            # Stage
            # --------------------------------------------

            stage_score = (
                self.stage_match(
                    investor,
                    founder
                )
            )


            # --------------------------------------------
            # Industry
            # --------------------------------------------

            industry_score = (
                self.industry_match(
                    investor,
                    founder
                )
            )


            # --------------------------------------------
            # General similarity
            # --------------------------------------------

            general_score = (
                self.general_similarity(
                    investor_index,
                    founder_index
                )
            )


            # --------------------------------------------
            # History
            # --------------------------------------------

            history_score = (
                self.history_match(
                    investor,
                    founder
                )
            )


            # --------------------------------------------
            # Ecosystem
            # --------------------------------------------

            ecosystem_score = (
                self.ecosystem_match(
                    investor,
                    founder
                )
            )


            # --------------------------------------------
            # Active
            # --------------------------------------------

            active_score = (
                self.active_score(
                    investor
                )
            )


            # --------------------------------------------
            # FINAL SCORE
            # --------------------------------------------

            final_score = (

                stage_score * 0.25

                +

                industry_score * 0.25

                +

                general_score * 0.20

                +

                history_score * 0.15

                +

                ecosystem_score * 0.10

                +

                active_score * 0.05
            )


            recommendations.append({

                "founder_id":
                    founder["id"],

                "founder_name":
                    founder["name"],

                "company":
                    founder["company"],

                "funding_stage":
                    founder["funding_stage"],

                "industry_score":
                    round(
                        industry_score * 100,
                        2
                    ),

                "stage_score":
                    round(
                        stage_score * 100,
                        2
                    ),

                "general_score":
                    round(
                        general_score * 100,
                        2
                    ),

                "history_score":
                    round(
                        history_score * 100,
                        2
                    ),

                "ecosystem_score":
                    round(
                        ecosystem_score * 100,
                        2
                    ),

                "score":
                    round(
                        final_score,
                        4
                    ),

                "score_percentage":
                    round(
                        final_score * 100,
                        2
                    )
            })


        # Sort highest score first.

        recommendations.sort(
            key=lambda x: x["score"],
            reverse=True
        )


        return recommendations[:top_n]


    # ========================================================
    # DISPLAY RECOMMENDATIONS
    # ========================================================

    def display_recommendations(
        self,
        investor_id,
        top_n=5
    ):

        investor_matches = self.investors[
            self.investors["id"].astype(str)
            ==
            str(investor_id)
        ]


        if investor_matches.empty:

            print(
                "Investor not found."
            )

            return


        investor = (
            investor_matches.iloc[0]
        )


        print(
            "\n"
            + "=" * 70
        )

        print(
            "INVESTOR â†’ FOUNDER RECOMMENDATION"
        )

        print(
            "=" * 70
        )


        print(
            f"Investor : {investor['name']}"
        )

        print(
            f"Firm     : {investor['firm_name']}"
        )

        print(
            f"ID       : {investor['id']}"
        )

        print(
            f"Stages   : {investor['investment_stages']}"
        )


        recommendations = (
            self.recommend_founders(
                investor_id,
                top_n
            )
        )


        if not recommendations:

            print(
                "\nNo recommendations found."
            )

            return


        print(
            "\nTop Recommended Founders:\n"
        )


        for index, rec in enumerate(
            recommendations,
            start=1
        ):

            print(
                f"{index}. "
                f"{rec['founder_name']} "
                f"â†’ "
                f"{rec['company']}"
            )

            print(
                f"   Funding Stage : "
                f"{rec['funding_stage']}"
            )

            print(
                f"   Industry      : "
                f"{rec['industry_score']}%"
            )

            print(
                f"   Stage Match   : "
                f"{rec['stage_score']}%"
            )

            print(
                f"   Similarity    : "
                f"{rec['general_score']}%"
            )

            print(
                f"   History       : "
                f"{rec['history_score']}%"
            )

            print(
                f"   Ecosystem     : "
                f"{rec['ecosystem_score']}%"
            )

            print(
                f"   Overall Score : "
                f"{rec['score_percentage']}%"
            )

            print()


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    engine = InvestorFounderEngine()


    # --------------------------------------------------------
    # TEST INVESTOR
    # --------------------------------------------------------

    test_investor_id = 3


    engine.display_recommendations(
        test_investor_id,
        top_n=5
    )



