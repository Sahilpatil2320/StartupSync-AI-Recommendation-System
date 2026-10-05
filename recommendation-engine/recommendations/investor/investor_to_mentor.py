import os
import re
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RESULTS_DIR = os.path.join(BASE_DIR, "results")

INVESTOR_FILE = os.path.join(
    RESULTS_DIR,
    "investor_features.csv"
)

MENTOR_FILE = os.path.join(
    RESULTS_DIR,
    "processed_mentors.csv"
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
        "telehealth"
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
        "wealth"
    ],

    "agritech": [
        "agtech",
        "agriculture",
        "agritech",
        "farming",
        "farm",
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
        "business software"
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
        "vehicle",
        "cars",
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

    text = clean_text(text)

    if not text:
        return set()

    return set(text.split())


# ============================================================
# INVESTOR â†’ MENTOR ENGINE
# ============================================================

class InvestorMentorEngine:

    def __init__(self):

        print(
            "Loading Investor â†’ Mentor recommendation engine..."
        )

        self.load_data()

        self.prepare_data()

        self.build_similarity()

        self.build_industry_predictions()


    # ========================================================
    # LOAD DATA
    # ========================================================

    def load_data(self):

        self.investors = pd.read_csv(
            INVESTOR_FILE
        )

        self.mentors = pd.read_csv(
            MENTOR_FILE
        )

        print(
            f"Loaded {len(self.investors)} investors"
        )

        print(
            f"Loaded {len(self.mentors)} mentors"
        )


    # ========================================================
    # PREPARE DATA
    # ========================================================

    def prepare_data(self):

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


        mentor_columns = [
            "mentor_id",
            "mentor_name",
            "expertise",
            "skills",
            "industry",
            "domain",
            "experience_years",
            "location",
            "interests"
        ]

        for column in mentor_columns:

            if column not in self.mentors.columns:

                self.mentors[column] = ""


        for column in investor_columns:

            self.investors[column] = (
                self.investors[column]
                .fillna("")
                .astype(str)
                .apply(clean_text)
            )


        for column in mentor_columns:

            self.mentors[column] = (
                self.mentors[column]
                .fillna("")
                .astype(str)
                .apply(clean_text)
            )


    # ========================================================
    # BUILD TF-IDF SIMILARITY
    # ========================================================

    def build_similarity(self):

        print(
            "\nBuilding Investor â†’ Mentor similarity matrix..."
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


        mentor_text = []

        for _, mentor in self.mentors.iterrows():

            text = " ".join([
                mentor["expertise"],
                mentor["skills"],
                mentor["industry"],
                mentor["domain"],
                mentor["interests"],
                mentor["location"]
            ])

            mentor_text.append(text)


        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1
        )


        combined_text = (
            investor_text +
            mentor_text
        )


        matrix = self.vectorizer.fit_transform(
            combined_text
        )


        investor_matrix = matrix[
            :len(investor_text)
        ]

        mentor_matrix = matrix[
            len(investor_text):
        ]


        self.similarity_matrix = cosine_similarity(
            investor_matrix,
            mentor_matrix
        )


        print(
            "Similarity matrix created."
        )


    # ========================================================
    # BUILD INDUSTRY PREDICTIONS
    # ========================================================

    def build_industry_predictions(self):

        print(
            "\nAnalyzing investor industries..."
        )

        self.investor_industries = {}


        for _, investor in self.investors.iterrows():

            text = " ".join([
                investor["primary_domain"],
                investor["secondary_domain_features"],
                investor["tag_features"],
                investor["investment_history"],
                investor["thesis_features"],
                investor["bio_features"]
            ])

            text = clean_text(text)

            tokens = tokenize(text)

            industry_scores = []


            for industry, keywords in (
                INDUSTRY_KEYWORDS.items()
            ):

                matched = 0


                for keyword in keywords:

                    keyword = clean_text(
                        keyword
                    )

                    if " " in keyword:

                        if keyword in text:

                            matched += 1

                    else:

                        if keyword in tokens:

                            matched += 1


                if matched > 0:

                    score = (
                        matched /
                        len(keywords)
                    )

                    industry_scores.append({
                        "industry": industry,
                        "score": score
                    })


            industry_scores.sort(
                key=lambda x: x["score"],
                reverse=True
            )


            self.investor_industries[
                investor["id"]
            ] = industry_scores[:5]


        print(
            "Investor industry profiles created."
        )


    # ========================================================
    # GET INVESTOR INDUSTRIES
    # ========================================================

    def get_investor_industries(
        self,
        investor
    ):

        return self.investor_industries.get(
            investor["id"],
            []
        )


    # ========================================================
    # INDUSTRY MATCH
    # ========================================================

    def industry_match(
        self,
        investor,
        mentor
    ):

        investor_industries = (
            self.get_investor_industries(
                investor
            )
        )


        if not investor_industries:

            return 0.0


        mentor_text = " ".join([
            mentor["expertise"],
            mentor["skills"],
            mentor["industry"],
            mentor["domain"],
            mentor["interests"]
        ])


        mentor_text = clean_text(
            mentor_text
        )

        mentor_tokens = tokenize(
            mentor_text
        )


        if not mentor_tokens:

            return 0.0


        best_score = 0.0


        for prediction in investor_industries:

            industry = prediction[
                "industry"
            ]

            investor_score = prediction[
                "score"
            ]


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


                if " " in keyword:

                    if keyword in mentor_text:

                        matched += 1

                else:

                    if keyword in mentor_tokens:

                        matched += 1


            if matched == 0:

                continue


            mentor_score = (
                matched /
                len(keywords)
            )


            score = (
                investor_score * 0.40
                +
                mentor_score * 0.60
            )


            best_score = max(
                best_score,
                score
            )


        return best_score


    # ========================================================
    # EXPERTISE MATCH
    # ========================================================

    def expertise_match(
        self,
        investor,
        mentor
    ):

        investor_text = " ".join([
            investor["thesis_features"],
            investor["bio_features"],
            investor["tag_features"]
        ])


        investor_tokens = tokenize(
            investor_text
        )


        mentor_expertise = tokenize(
            mentor["expertise"]
        )


        if not investor_tokens:

            return 0.0


        if not mentor_expertise:

            return 0.0


        overlap = (
            investor_tokens
            &
            mentor_expertise
        )


        return (
            len(overlap)
            /
            len(mentor_expertise)
        )


    # ========================================================
    # SKILLS MATCH
    # ========================================================

    def skills_match(
        self,
        investor,
        mentor
    ):

        investor_text = " ".join([
            investor["thesis_features"],
            investor["bio_features"],
            investor["tag_features"],
            investor["investment_history"]
        ])


        investor_tokens = tokenize(
            investor_text
        )


        mentor_skills = tokenize(
            mentor["skills"]
        )


        if not investor_tokens:

            return 0.0


        if not mentor_skills:

            return 0.0


        overlap = (
            investor_tokens
            &
            mentor_skills
        )


        return (
            len(overlap)
            /
            len(mentor_skills)
        )


    # ========================================================
    # INTEREST MATCH
    # ========================================================

    def interest_match(
        self,
        investor,
        mentor
    ):

        investor_text = " ".join([
            investor["tag_features"],
            investor["investment_history"],
            investor["thesis_features"]
        ])


        investor_tokens = tokenize(
            investor_text
        )


        mentor_interests = tokenize(
            mentor["interests"]
        )


        if not investor_tokens:

            return 0.0


        if not mentor_interests:

            return 0.0


        overlap = (
            investor_tokens
            &
            mentor_interests
        )


        return (
            len(overlap)
            /
            len(mentor_interests)
        )


    # ========================================================
    # GENERAL SIMILARITY
    # ========================================================

    def general_similarity(
        self,
        investor_index,
        mentor_index
    ):

        return float(
            self.similarity_matrix[
                investor_index,
                mentor_index
            ]
        )


    # ========================================================
    # EXPERIENCE SCORE
    # ========================================================

    def experience_score(
        self,
        mentor
    ):

        try:

            years = float(
                mentor["experience_years"]
            )

        except:

            return 0.0


        # Cap at 20 years.

        return min(
            years / 20.0,
            1.0
        )


    # ========================================================
    # RECOMMEND MENTORS
    # ========================================================

    def recommend_mentors(
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


        for mentor_index, mentor in (
            self.mentors.iterrows()
        ):

            industry_score = (
                self.industry_match(
                    investor,
                    mentor
                )
            )


            expertise_score = (
                self.expertise_match(
                    investor,
                    mentor
                )
            )


            skills_score = (
                self.skills_match(
                    investor,
                    mentor
                )
            )


            interest_score = (
                self.interest_match(
                    investor,
                    mentor
                )
            )


            general_score = (
                self.general_similarity(
                    investor_index,
                    mentor_index
                )
            )


            experience_score = (
                self.experience_score(
                    mentor
                )
            )


            # ------------------------------------------------
            # FINAL WEIGHTS
            # ------------------------------------------------
            #
            # Industry      = 35%
            # General       = 20%
            # Expertise     = 15%
            # Skills        = 15%
            # Interests     = 10%
            # Experience    = 5%
            #

            final_score = (

                industry_score * 0.35

                +

                general_score * 0.20

                +

                expertise_score * 0.15

                +

                skills_score * 0.15

                +

                interest_score * 0.10

                +

                experience_score * 0.05
            )


            recommendations.append({

                "mentor_id":
                    mentor["mentor_id"],

                "mentor_name":
                    mentor["mentor_name"],

                "expertise":
                    mentor["expertise"],

                "skills":
                    mentor["skills"],

                "industry":
                    mentor["industry"],

                "domain":
                    mentor["domain"],

                "experience_years":
                    mentor["experience_years"],

                "location":
                    mentor["location"],

                "industry_score":
                    round(
                        industry_score * 100,
                        2
                    ),

                "expertise_score":
                    round(
                        expertise_score * 100,
                        2
                    ),

                "skills_score":
                    round(
                        skills_score * 100,
                        2
                    ),

                "interest_score":
                    round(
                        interest_score * 100,
                        2
                    ),

                "general_score":
                    round(
                        general_score * 100,
                        2
                    ),

                "experience_score":
                    round(
                        experience_score * 100,
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


        recommendations.sort(
            key=lambda x: x["score"],
            reverse=True
        )


        return recommendations[:top_n]


    # ========================================================
    # DISPLAY RESULTS
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
            "INVESTOR â†’ MENTOR RECOMMENDATION"
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


        industries = (
            self.get_investor_industries(
                investor
            )
        )


        if industries:

            print(
                "\nInvestor Industry Profile:"
            )

            for item in industries:

                print(
                    f"  - "
                    f"{item['industry']} "
                    f"("
                    f"{item['score'] * 100:.2f}%"
                    f")"
                )


        recommendations = (
            self.recommend_mentors(
                investor_id,
                top_n
            )
        )


        print(
            "\nTop Recommended Mentors:\n"
        )


        for index, rec in enumerate(
            recommendations,
            start=1
        ):

            print(
                f"{index}. "
                f"{rec['mentor_name']}"
            )

            print(
                f"   Industry        : "
                f"{rec['industry']}"
            )

            print(
                f"   Expertise       : "
                f"{rec['expertise']}"
            )

            print(
                f"   Skills          : "
                f"{rec['skills']}"
            )

            print(
                f"   Experience      : "
                f"{rec['experience_years']} years"
            )

            print(
                f"   Location        : "
                f"{rec['location']}"
            )

            print(
                f"   Industry Match  : "
                f"{rec['industry_score']}%"
            )

            print(
                f"   Expertise Match : "
                f"{rec['expertise_score']}%"
            )

            print(
                f"   Skills Match    : "
                f"{rec['skills_score']}%"
            )

            print(
                f"   Interest Match  : "
                f"{rec['interest_score']}%"
            )

            print(
                f"   Similarity      : "
                f"{rec['general_score']}%"
            )

            print(
                f"   Overall Score   : "
                f"{rec['score_percentage']}%"
            )

            print()


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    engine = InvestorMentorEngine()

    # Test investor
    test_investor_id = 3

    engine.display_recommendations(
        test_investor_id,
        top_n=5
    )


