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

# TEXT HELPERS

# ============================================================



def safe_text(value):

    """

    Convert missing values to empty strings.

    """



    if pd.isna(value):

        return ""



    return str(value).strip().lower()



# ============================================================

# INVESTOR INDUSTRY VOCABULARY

# ============================================================



INDUSTRY_TERMS = {



    "healthtech / healthcare": {

        "strong": [

            "biotech",

            "medical",

            "hospital",

            "diagnostics",

            "pharmaceuticals"

        ],

        "medium": [

            "health"

        ]

    },



    "fintech / finance": {

        "strong": [

            "fintech"

        ],

        "medium": [

            "finance"

        ]

    },



    "agritech": {

        "strong": [

            "agtech"

        ],

        "medium": [

            "agriculture"

        ]

    },



    "foodtech / food & beverage": {

        "strong": [

            "food",

            "beverage"

        ],

        "medium": []

    },



    "e-commerce / retail": {

        "strong": [

            "commerce",

            "retail"

        ],

        "medium": []

    },



    "saas / enterprise tech": {

        "strong": [

            "saas",

            "enterprise"

        ],

        "medium": []

    },



    "logistics / mobility": {

        "strong": [

            "logistics",

            "transportation"

        ],

        "medium": [

            "mobility"

        ]

    },



    "real estate / proptech": {

        "strong": [

            "proptech"

        ],

        "medium": [

            "estate"

        ]

    },



    "media / entertainment": {

        "strong": [

            "media",

            "entertainment"

        ],

        "medium": []

    },



    "cleantech / sustainability": {

        "strong": [

            "cleantech",

            "climatetech",

            "energytech"

        ],

        "medium": [

            "climate"

        ]

    },



    "edtech / education": {

        "strong": [

            "education"

        ],

        "medium": []

    },



    "cybersecurity": {

        "strong": [

            "security",

            "cyber"

        ],

        "medium": []

    },



    "automotive / autotech": {

        "strong": [],

        "medium": []

    },



    "traveltech / hospitality": {

        "strong": [],

        "medium": []

    },



    "technology / digital services": {

        "strong": [

            "software",

            "cloud",

            "developer",

            "infrastructure"

        ],

        "medium": [

            "technology",

            "digital"

        ]

    }

}





# ============================================================

# FUNDING STAGE COMPATIBILITY

# ============================================================



def funding_stage_score(founder_stage, investor_stages):

    """

    Calculate compatibility between the founder's current

    funding stage and the stages an investor supports.

    """



    founder_stage = safe_text(founder_stage)

    investor_stages = safe_text(investor_stages)



    if not founder_stage or founder_stage == "unknown":

        return 0.0



    if not investor_stages:

        return 0.0



    stages = set(investor_stages.split())



    # Exact stage match

    if founder_stage in stages:

        return 1.0



    # Nearby-stage compatibility

    nearby_stages = {

        "pre_seed": {"seed"},

        "seed": {"pre_seed", "post_seed", "series_a"},

        "post_seed": {"seed", "series_a"},

        "series_a": {"seed", "post_seed", "series_b"},

        "series_b": {"series_a", "series_c"},

        "series_c": {"series_b", "series_d"},

        "series_d": {"series_c", "series_e"},

        "series_e": {"series_d", "series_f"},

        "series_f": {"series_e"},

    }



    if founder_stage in nearby_stages:



        if stages.intersection(

            nearby_stages[founder_stage]

        ):

            return 0.5



    return 0.0





# ============================================================

# TF-IDF SIMILARITY

# ============================================================



def calculate_text_similarities(

    source_texts,

    target_texts

):

    """

    Calculate TF-IDF cosine similarity between source

    documents and target documents.

    """



    source_texts = [

        safe_text(x) for x in source_texts

    ]



    target_texts = [

        safe_text(x) for x in target_texts

    ]



    all_texts = source_texts + target_texts



    if not any(

        text.strip()

        for text in all_texts

    ):

        return np.zeros(

            (

                len(source_texts),

                len(target_texts)

            )

        )



    vectorizer = TfidfVectorizer(

        lowercase=True,

        ngram_range=(1, 2),

        min_df=1,

        sublinear_tf=True

    )



    matrix = vectorizer.fit_transform(

        all_texts

    )



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

# RECOMMENDATION ENGINE

# ============================================================



class FounderInvestorEngine:



    def __init__(self):



        founder_path = (

            RESULTS_DIR /

            "founder_features.csv"

        )



        investor_path = (

            RESULTS_DIR /

            "investor_features.csv"

        )



        startup_path = (

            RESULTS_DIR /

            "processed_startups.csv"

        )



        if not founder_path.exists():

            raise FileNotFoundError(

                f"Missing file: {founder_path}"

            )



        if not investor_path.exists():

            raise FileNotFoundError(

                f"Missing file: {investor_path}"

            )



        if not startup_path.exists():

            raise FileNotFoundError(

                f"Missing file: {startup_path}"

            )



        # ----------------------------------------------------

        # Load datasets

        # ----------------------------------------------------



        self.founders = pd.read_csv(

            founder_path

        )



        self.investors = pd.read_csv(

            investor_path

        )



        self.startups = pd.read_csv(

            startup_path

        )



        # ----------------------------------------------------

        # Convert NaN to empty strings

        # ----------------------------------------------------



        self.founders = (

            self.founders.fillna("")

        )



        self.investors = (

            self.investors.fillna("")

        )



        self.startups = (

            self.startups.fillna("")

        )



        print(

            f"Loaded {len(self.founders)} founders"

        )



        print(

            f"Loaded {len(self.investors)} investors"

        )



        print(

            f"Loaded {len(self.startups)} startups"

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

        # Build 15 semantic industry profiles

        # ----------------------------------------------------



        print(

            "\nBuilding semantic industry profiles..."

        )



        self.build_industry_profiles()



        # ----------------------------------------------------

        # Precompute regular similarities

        # ----------------------------------------------------



        print(

            "\nBuilding TF-IDF similarity matrices..."

        )



        # ----------------------------------------------------

        # 1. Domain / company similarity

        # ----------------------------------------------------



        founder_domain = (

            self.founders["company_features"]

            + " "

            + self.founders["domain_features"]

        )



        investor_domain = (

            self.investors["primary_domain"]

            + " "

            + self.investors[

                "secondary_domain_features"

            ]

        )



        self.domain_similarity = (

            calculate_text_similarities(

                founder_domain,

                investor_domain

            )

        )



        # ----------------------------------------------------

        # 2. Investor tag similarity

        # ----------------------------------------------------



        founder_tag_signal = (

            self.founders["domain_features"]

            + " "

            + self.founders[

                "competitor_features"

            ]

        )



        investor_tag_signal = (

            self.investors["tag_features"]

            + " "

            + self.investors[

                "secondary_domain_features"

            ]

        )



        self.tag_similarity = (

            calculate_text_similarities(

                founder_tag_signal,

                investor_tag_signal

            )

        )



        # ----------------------------------------------------

        # 3. Investment history similarity

        # ----------------------------------------------------



        founder_history_signal = (

            self.founders[

                "company_features"

            ]

            + " "

            + self.founders[

                "competitor_features"

            ]

            + " "

            + self.founders[

                "ecosystem_features"

            ]

        )



        investor_history_signal = (

            self.investors[

                "investment_history"

            ]

        )



        self.history_similarity = (

            calculate_text_similarities(

                founder_history_signal,

                investor_history_signal

            )

        )



        # ----------------------------------------------------

        # 4. Investment thesis similarity

        # ----------------------------------------------------



        founder_thesis_signal = (

            self.founders[

                "domain_features"

            ]

            + " "

            + self.founders[

                "company_features"

            ]

        )



        investor_thesis_signal = (

            self.investors[

                "thesis_features"

            ]

            + " "

            + self.investors[

                "bio_features"

            ]

        )



        self.thesis_similarity = (

            calculate_text_similarities(

                founder_thesis_signal,

                investor_thesis_signal

            )

        )



        # ----------------------------------------------------

        # 5. Ecosystem similarity

        # ----------------------------------------------------



        founder_ecosystem = (

            self.founders[

                "ecosystem_features"

            ]

            + " "

            + self.founders[

                "competitor_features"

            ]

        )



        investor_ecosystem = (

            self.investors[

                "investment_history"

            ]

            + " "

            + self.investors[

                "secondary_domain_features"

            ]

        )



        self.ecosystem_similarity = (

            calculate_text_similarities(

                founder_ecosystem,

                investor_ecosystem

            )

        )



        print(

            "Similarity matrices created."

        )



    # ========================================================

    # BUILD INDUSTRY PROFILES

    # ========================================================



    def build_industry_profiles(self):

        """

        Build one semantic profile for each industry.



        Industry compatibility focuses on:

            - Industry category

            - Startup names

            - Recommendation tags



        Generic technical skills and roles are intentionally

        excluded because they are common across many industries.

        """



        industry_profiles = {}



        for industry, group in (

            self.startups.groupby("industry")

        ):



            industry = safe_text(industry)



            if not industry:

                continue



            text_parts = []



            for _, startup in group.iterrows():



                startup_name = safe_text(

                    startup["name"]

                )



                tags = safe_text(

                    startup["tags"]

                )



                # --------------------------------------------

                # Remove duplicate tokens from tags

                # --------------------------------------------



                tag_tokens = []



                for token in tags.replace(",", " ").split():



                    if token not in tag_tokens:

                        tag_tokens.append(token)



                cleaned_tags = " ".join(

                    tag_tokens

                )



                # --------------------------------------------

                # Build industry-specific startup text

                # --------------------------------------------



                startup_text = (

                    industry

                    + " "

                    + industry

                    + " "

                    + industry

                    + " "

                    + startup_name

                    + " "

                    + cleaned_tags

                )



                if startup_text.strip():

                    text_parts.append(

                        startup_text

                    )



            industry_profiles[

                industry

            ] = " ".join(text_parts)



        self.industry_profiles = (

            industry_profiles

        )



        self.industry_names = list(

            industry_profiles.keys()

        )



        self.industry_texts = [

            industry_profiles[industry]

            for industry in self.industry_names

        ]



        print(

            f"Created "

            f"{len(self.industry_profiles)} "

            f"semantic industry profiles."

        )



        for industry in self.industry_names:



            print(

                f"   - {industry}"

            )



    # ========================================================

    # INDUSTRY COMPATIBILITY

    # ========================================================



    def calculate_industry_scores(

        self,

        founder_id

    ):
        """
        Calculate industry compatibility using the curated
        INDUSTRY_TERMS vocabulary instead of raw TF-IDF similarity.
        """

        industry_predictions = self.industry_mapper.predict_industries(
            founder_id=founder_id,
            top_n=5
        )

        if not industry_predictions:
            return np.zeros(len(self.investors)), []

        def normalize_profile(value):
            text = safe_text(value)
            for char in [",", "/", "-", "_", "[", "]", "\"", "'", "(", ")"]:
                text = text.replace(char, " ")
            return " ".join(text.split())

        def term_matches(profile, term):
            profile = normalize_profile(profile)
            term = normalize_profile(term)
            if not profile or not term:
                return False
            if " " in term:
                return term in profile
            return term in set(profile.split())

        investor_profiles = []

        for _, investor in self.investors.iterrows():
            investor_profiles.append(" ".join([
                safe_text(investor["primary_domain"]),
                safe_text(investor["secondary_domain_features"]),
                safe_text(investor["tag_features"]),
                safe_text(investor["thesis_features"]),
                safe_text(investor["bio_features"]),
                safe_text(investor["investment_history"])
            ]))

        industry_scores = np.zeros(len(self.investors))
        industry_details = []
        total_confidence = 0.0

        for prediction in industry_predictions:
            industry = safe_text(prediction.get("industry", ""))
            confidence = float(prediction.get("confidence", 0.0))

            if industry not in INDUSTRY_TERMS:
                continue

            total_confidence += confidence
            strong_terms = INDUSTRY_TERMS[industry].get("strong", [])
            medium_terms = INDUSTRY_TERMS[industry].get("medium", [])

            for investor_index, profile in enumerate(investor_profiles):
                strong_matches = [
                    term for term in strong_terms
                    if term_matches(profile, term)
                ]
                medium_matches = [
                    term for term in medium_terms
                    if term_matches(profile, term)
                ]

                total_signals = len(strong_matches) + len(medium_matches)
                if total_signals == 0:
                    continue

                affinity = (
                    len(strong_matches) * 1.0
                    + len(medium_matches) * 0.5
                )

                specificity = 1.0 / np.sqrt(1.0 + total_signals)
                compatibility = affinity * specificity
                weighted_score = compatibility * confidence

                industry_scores[investor_index] += weighted_score

                industry_details.append({
                    "investor_index": investor_index,
                    "industry": industry,
                    "confidence": confidence,
                    "strong_matches": strong_matches,
                    "medium_matches": medium_matches,
                    "affinity": affinity,
                    "specificity": specificity,
                    "compatibility": compatibility,
                    "weighted_score": weighted_score
                })

        if total_confidence > 0:
            industry_scores /= total_confidence

        max_score = np.max(industry_scores) if len(industry_scores) else 0.0
        if max_score > 0:
            industry_scores /= max_score

        # Return original industry predictions for the display section.
        # They contain industry, confidence, supporting_startups,
        # and best_similarity.
        return industry_scores, industry_predictions


    def calculate_score(

        self,

        founder_index,

        investor_index,

        industry_scores

    ):



        founder = self.founders.iloc[

            founder_index

        ]



        investor = self.investors.iloc[

            investor_index

        ]



        # ----------------------------------------------------

        # Feature scores

        # ----------------------------------------------------



        stage_score = funding_stage_score(

            founder["funding_stage"],

            investor[

                "investment_stages"

            ]

        )



        industry_score = (

            industry_scores[

                investor_index

            ]

        )



        domain_score = (

            self.domain_similarity[

                founder_index,

                investor_index

            ]

        )



        tag_score = (

            self.tag_similarity[

                founder_index,

                investor_index

            ]

        )



        history_score = (

            self.history_similarity[

                founder_index,

                investor_index

            ]

        )



        thesis_score = (

            self.thesis_similarity[

                founder_index,

                investor_index

            ]

        )



        ecosystem_score = (

            self.ecosystem_similarity[

                founder_index,

                investor_index

            ]

        )



        active_score = 1.0 if (

            str(

                investor["active"]

            ).lower()

            in {

                "1",

                "true",

                "yes"

            }

        ) else 0.0



        # ----------------------------------------------------

        # Weighted score

        # ----------------------------------------------------



        final_score = (



            # Funding stage

            stage_score * 0.20



            # Industry compatibility

            + industry_score * 0.20



            # Domain / company

            + domain_score * 0.20



            # Tags

            + tag_score * 0.10



            # Investment history

            + history_score * 0.10



            # Investment thesis

            + thesis_score * 0.10



            # Ecosystem

            + ecosystem_score * 0.05



            # Active investor

            + active_score * 0.05

        )



        return min(

            max(

                final_score,

                0.0

            ),

            1.0

        )



    # ========================================================

    # RECOMMEND INVESTORS

    # ========================================================



    def recommend_investors(

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

        # Calculate industry compatibility

        # ----------------------------------------------------



        (

            industry_scores,

            industries

        ) = self.calculate_industry_scores(

            founder_id

        )



        recommendations = []



        for investor_index in range(

            len(self.investors)

        ):



            score = self.calculate_score(

                founder_index,

                investor_index,

                industry_scores

            )



            investor = self.investors.iloc[

                investor_index

            ]



            recommendations.append({



                "investor_id":

                    investor["id"],



                "investor_name":

                    investor["name"],



                "firm_name":

                    investor["firm_name"],



                "funding_stage":

                    investor[

                        "investment_stages"

                    ],



                "industry_score":

                    float(

                        industry_scores[

                            investor_index

                        ]

                    ),



                "score":

                    score,



                "score_percentage":

                    round(

                        score * 100,

                        2

                    )

            })



        recommendations.sort(

            key=lambda x: (

                -x["score"],

                str(

                    x["investor_name"]

                )

            )

        )



        return (

            recommendations[:top_n],

            industries

        )





# ============================================================

# SIMPLE TEST

# ============================================================



if __name__ == "__main__":



    engine = FounderInvestorEngine()



    # Test with first founder

    founder = engine.founders.iloc[0]



    print(

        "\n"

        + "=" * 70

    )



    print(

        "FOUNDER â†’ INVESTOR RECOMMENDATION"

    )



    print(

        "=" * 70

    )



    print(

        f"\nFounder: "

        f"{founder['name']}"

    )



    print(

        f"Company: "

        f"{founder['company']}"

    )



    print(

        f"Funding Stage: "

        f"{founder['funding_stage']}"

    )



    recommendations, industries = (

        engine.recommend_investors(

            founder_id=founder["id"],

            top_n=5

        )

    )



    # --------------------------------------------------------

    # Predicted industries

    # --------------------------------------------------------



    print(

        "\nPredicted Industries:\n"

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



    # --------------------------------------------------------

    # Top investors

    # --------------------------------------------------------



    print(

        "Top 5 Investors:\n"

    )



    for position, recommendation in enumerate(

        recommendations,

        start=1

    ):



        print(

            f"{position}. "

            f"{recommendation['investor_name']}"

        )



        print(

            f"   Firm: "

            f"{recommendation['firm_name']}"

        )



        print(

            f"   Stage: "

            f"{recommendation['funding_stage']}"

        )



        print(

            f"   Industry Compatibility: "

            f"{recommendation['industry_score'] * 100:.2f}%"

        )



        print(

            f"   Overall Compatibility: "

            f"{recommendation['score_percentage']}%"

        )



        print()

