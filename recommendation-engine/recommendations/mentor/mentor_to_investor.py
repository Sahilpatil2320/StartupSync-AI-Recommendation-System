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

MENTOR_FILE = os.path.join(
    RESULTS_DIR,
    "processed_mentors.csv"
)

INVESTOR_FILE = os.path.join(
    RESULTS_DIR,
    "investor_features.csv"
)


# ============================================================
# INDUSTRY KEYWORDS
# ============================================================

INDUSTRY_KEYWORDS = {

    "healthtech / healthcare": [
        "health", "healthcare", "medical", "medicine",
        "hospital", "healthtech", "biotech", "pharma",
        "diagnostic", "clinical", "patient", "wellness",
        "telehealth"
    ],

    "fintech / finance": [
        "fintech", "finance", "financial", "banking",
        "payments", "payment", "insurance", "insurtech",
        "lending", "credit", "wealth"
    ],

    "agritech": [
        "agtech", "agriculture", "agritech",
        "farming", "farm", "crop"
    ],

    "foodtech / food & beverage": [
        "food", "beverage", "restaurant",
        "grocery", "foodtech"
    ],

    "e-commerce / retail": [
        "commerce", "ecommerce", "e-commerce",
        "retail", "marketplace", "shopping", "consumer"
    ],

    "saas / enterprise tech": [
        "saas", "enterprise", "b2b",
        "software", "business software"
    ],

    "logistics / mobility": [
        "logistics", "transportation", "mobility",
        "shipping", "delivery", "fleet", "supply chain"
    ],

    "real estate / proptech": [
        "real estate", "estate", "property",
        "proptech", "housing", "construction"
    ],

    "media / entertainment": [
        "media", "entertainment", "content",
        "music", "video", "gaming", "games"
    ],

    "cleantech / sustainability": [
        "cleantech", "clean tech", "climatetech",
        "climate", "sustainability", "energy",
        "renewable", "solar", "environment"
    ],

    "edtech / education": [
        "education", "edtech", "learning",
        "school", "student", "training", "university"
    ],

    "cybersecurity": [
        "security", "cybersecurity", "cyber",
        "infosec", "privacy", "identity",
        "cloud security", "web security",
        "network security"
    ],

    "automotive / autotech": [
        "automotive", "automobile", "vehicle",
        "cars", "ev", "electric vehicle"
    ],

    "traveltech / hospitality": [
        "travel", "tourism", "hospitality",
        "hotel", "booking", "vacation"
    ],

    "technology / digital services": [
        "technology", "tech", "software", "cloud",
        "developer", "infrastructure", "digital",
        "platform", "internet", "api"
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


def contains_term(text, term):

    text = clean_text(text)
    term = clean_text(term)

    if not text or not term:
        return False

    if " " in term:
        return term in text

    return term in tokenize(text)


# ============================================================
# MENTOR â†’ INVESTOR ENGINE
# ============================================================

class MentorInvestorEngine:

    def __init__(self):

        print(
            "Loading Mentor â†’ Investor recommendation engine..."
        )

        self.load_data()

        self.prepare_data()

        self.build_similarity()

        self.build_mentor_industries()


    # ========================================================
    # LOAD DATA
    # ========================================================

    def load_data(self):

        self.mentors = pd.read_csv(
            MENTOR_FILE
        )

        self.investors = pd.read_csv(
            INVESTOR_FILE
        )

        print(
            f"Loaded {len(self.mentors)} mentors"
        )

        print(
            f"Loaded {len(self.investors)} investors"
        )


    # ========================================================
    # PREPARE DATA
    # ========================================================

    def prepare_data(self):

        mentor_columns = [
            "id",
            "name",
            "expertise",
            "skills",
            "industry",
            "domain",
            "experience_years",
            "location",
            "interests"
        ]

        investor_columns = [
            "id",
            "name",
            "firm_name",
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


        for column in mentor_columns:

            if column not in self.mentors.columns:
                self.mentors[column] = ""


        for column in investor_columns:

            if column not in self.investors.columns:
                self.investors[column] = ""


        for column in mentor_columns:

            self.mentors[column] = (
                self.mentors[column]
                .fillna("")
                .astype(str)
                .apply(clean_text)
            )


        for column in investor_columns:

            self.investors[column] = (
                self.investors[column]
                .fillna("")
                .astype(str)
                .apply(clean_text)
            )


    # ========================================================
    # BUILD TF-IDF SIMILARITY
    # ========================================================

    def build_similarity(self):

        print(
            "\nBuilding Mentor â†’ Investor similarity matrix..."
        )

        mentor_text = []

        for _, mentor in self.mentors.iterrows():

            text = " ".join([
                mentor["expertise"],
                mentor["skills"],
                mentor["industry"],
                mentor["domain"],
                mentor["interests"]
            ])

            mentor_text.append(text)


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


        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1
        )


        combined_text = (
            mentor_text +
            investor_text
        )


        matrix = self.vectorizer.fit_transform(
            combined_text
        )


        mentor_matrix = matrix[
            :len(mentor_text)
        ]

        investor_matrix = matrix[
            len(mentor_text):
        ]


        self.similarity_matrix = cosine_similarity(
            mentor_matrix,
            investor_matrix
        )


        print(
            "Similarity matrix created."
        )


    # ========================================================
    # BUILD MENTOR INDUSTRY PROFILE
    # ========================================================

    def build_mentor_industries(self):

        print(
            "\nAnalyzing mentor industry profiles..."
        )

        self.mentor_industries = {}


        for _, mentor in self.mentors.iterrows():

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


            industry_scores = []


            for industry, keywords in (
                INDUSTRY_KEYWORDS.items()
            ):

                matched = 0


                for keyword in keywords:

                    if contains_term(
                        mentor_text,
                        keyword
                    ):

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


            self.mentor_industries[
                mentor["id"]
            ] = industry_scores[:5]


        print(
            "Mentor industry profiles created."
        )


    # ========================================================
    # GET MENTOR INDUSTRIES
    # ========================================================

    def get_mentor_industries(
        self,
        mentor
    ):

        return self.mentor_industries.get(
            mentor["id"],
            []
        )


    # ========================================================
    # INDUSTRY MATCH
    # ========================================================

    def industry_match(
        self,
        mentor,
        investor
    ):

        mentor_industries = (
            self.get_mentor_industries(
                mentor
            )
        )


        if not mentor_industries:
            return 0.0


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


        best_score = 0.0


        for prediction in mentor_industries:

            industry = prediction[
                "industry"
            ]

            mentor_score = prediction[
                "score"
            ]


            keywords = INDUSTRY_KEYWORDS.get(
                industry,
                []
            )


            if not keywords:
                continue


            matched = 0


            for keyword in keywords:

                if contains_term(
                    investor_text,
                    keyword
                ):

                    matched += 1


            if matched == 0:
                continue


            investor_industry_score = (
                matched /
                len(keywords)
            )


            score = (
                mentor_score * 0.40
                +
                investor_industry_score * 0.60
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
        mentor,
        investor
    ):

        mentor_expertise = tokenize(
            mentor["expertise"]
        )


        investor_text = " ".join([
            investor["thesis_features"],
            investor["bio_features"],
            investor["tag_features"],
            investor["investment_history"]
        ])


        investor_tokens = tokenize(
            investor_text
        )


        if not mentor_expertise:
            return 0.0


        if not investor_tokens:
            return 0.0


        overlap = (
            mentor_expertise
            &
            investor_tokens
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
        mentor,
        investor
    ):

        mentor_skills = tokenize(
            mentor["skills"]
        )


        investor_text = " ".join([
            investor["thesis_features"],
            investor["bio_features"],
            investor["tag_features"],
            investor["investment_history"],
            investor["secondary_domain_features"]
        ])


        investor_tokens = tokenize(
            investor_text
        )


        if not mentor_skills:
            return 0.0


        if not investor_tokens:
            return 0.0


        overlap = (
            mentor_skills
            &
            investor_tokens
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
        mentor,
        investor
    ):

        mentor_interests = tokenize(
            mentor["interests"]
        )


        investor_text = " ".join([
            investor["tag_features"],
            investor["investment_history"],
            investor["thesis_features"]
        ])


        investor_tokens = tokenize(
            investor_text
        )


        if not mentor_interests:
            return 0.0


        if not investor_tokens:
            return 0.0


        overlap = (
            mentor_interests
            &
            investor_tokens
        )


        return (
            len(overlap)
            /
            len(mentor_interests)
        )


    # ========================================================
    # DOMAIN MATCH
    # ========================================================

    def domain_match(
        self,
        mentor,
        investor
    ):

        mentor_domain = tokenize(
            " ".join([
                mentor["domain"],
                mentor["industry"]
            ])
        )


        investor_domain = tokenize(
            " ".join([
                investor["primary_domain"],
                investor["secondary_domain_features"],
                investor["tag_features"]
            ])
        )


        if not mentor_domain:
            return 0.0


        if not investor_domain:
            return 0.0


        overlap = (
            mentor_domain
            &
            investor_domain
        )


        return (
            len(overlap)
            /
            len(mentor_domain)
        )


    # ========================================================
    # GENERAL SIMILARITY
    # ========================================================

    def general_similarity(
        self,
        mentor_index,
        investor_index
    ):

        return float(
            self.similarity_matrix[
                mentor_index,
                investor_index
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


        return min(
            years / 20.0,
            1.0
        )


    # ========================================================
    # RECOMMEND INVESTORS
    # ========================================================

    def recommend_investors(
        self,
        mentor_id,
        top_n=5
    ):

        mentor_ids = (
            self.mentors["id"]
            .astype(str)
            .str.strip()
        )


        requested_id = str(
            mentor_id
        ).strip()


        mentor_matches = self.mentors[
            mentor_ids == requested_id
        ]


        if mentor_matches.empty:

            print(
                f"Mentor ID '{mentor_id}' not found."
            )

            return []


        mentor_index = (
            mentor_matches.index[0]
        )


        mentor = (
            self.mentors.loc[
                mentor_index
            ]
        )


        recommendations = []


        for investor_index, investor in (
            self.investors.iterrows()
        ):

            industry_score = (
                self.industry_match(
                    mentor,
                    investor
                )
            )


            expertise_score = (
                self.expertise_match(
                    mentor,
                    investor
                )
            )


            skills_score = (
                self.skills_match(
                    mentor,
                    investor
                )
            )


            interest_score = (
                self.interest_match(
                    mentor,
                    investor
                )
            )


            domain_score = (
                self.domain_match(
                    mentor,
                    investor
                )
            )


            general_score = (
                self.general_similarity(
                    mentor_index,
                    investor_index
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
            # Industry      = 30%
            # Expertise     = 15%
            # Skills        = 15%
            # Interests     = 10%
            # Domain        = 10%
            # Similarity    = 15%
            # Experience    = 5%
            #

            final_score = (

                industry_score * 0.30

                +

                expertise_score * 0.15

                +

                skills_score * 0.15

                +

                interest_score * 0.10

                +

                domain_score * 0.10

                +

                general_score * 0.15

                +

                experience_score * 0.05
            )


            recommendations.append({

                "investor_id":
                    investor["id"],

                "investor_name":
                    investor["name"],

                "firm_name":
                    investor["firm_name"],

                "investment_stages":
                    investor["investment_stages"],

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

                "domain_score":
                    round(
                        domain_score * 100,
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


        # ----------------------------------------------------
        # REMOVE DUPLICATE INVESTORS / FIRMS
        # ----------------------------------------------------

        unique_recommendations = []

        seen = set()


        for recommendation in recommendations:

            firm = clean_text(
                recommendation["firm_name"]
            )

            investor_name = clean_text(
                recommendation["investor_name"]
            )


            unique_key = (
                firm
                if firm
                else investor_name
            )


            if not unique_key:

                unique_key = str(
                    recommendation["investor_id"]
                )


            if unique_key in seen:
                continue


            seen.add(
                unique_key
            )


            unique_recommendations.append(
                recommendation
            )


            if len(
                unique_recommendations
            ) >= top_n:

                break


        return unique_recommendations


    # ========================================================
    # DISPLAY RESULTS
    # ========================================================

    def display_recommendations(
        self,
        mentor_id,
        top_n=5
    ):

        mentor_ids = (
            self.mentors["id"]
            .astype(str)
            .str.strip()
        )


        requested_id = str(
            mentor_id
        ).strip()


        mentor_matches = self.mentors[
            mentor_ids == requested_id
        ]


        if mentor_matches.empty:

            print(
                f"Mentor ID '{mentor_id}' "
                "was not found."
            )

            return


        mentor = (
            mentor_matches.iloc[0]
        )


        print(
            "\n"
            + "=" * 70
        )

        print(
            "MENTOR â†’ INVESTOR RECOMMENDATION"
        )

        print(
            "=" * 70
        )


        print(
            f"Mentor     : "
            f"{mentor['name']}"
        )

        print(
            f"Mentor ID  : "
            f"{mentor['id']}"
        )

        print(
            f"Expertise  : "
            f"{mentor['expertise']}"
        )

        print(
            f"Skills     : "
            f"{mentor['skills']}"
        )

        print(
            f"Industry   : "
            f"{mentor['industry']}"
        )

        print(
            f"Domain     : "
            f"{mentor['domain']}"
        )

        print(
            f"Experience : "
            f"{mentor['experience_years']} years"
        )

        print(
            f"Location   : "
            f"{mentor['location']}"
        )

        print(
            f"Interests  : "
            f"{mentor['interests']}"
        )


        industries = (
            self.get_mentor_industries(
                mentor
            )
        )


        if industries:

            print(
                "\nMentor Industry Profile:"
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
            self.recommend_investors(
                mentor_id,
                top_n
            )
        )


        if not recommendations:

            print(
                "\nNo investor recommendations found."
            )

            return


        print(
            "\nTop Recommended Investors:\n"
        )


        for index, rec in enumerate(
            recommendations,
            start=1
        ):

            print(
                f"{index}. "
                f"{rec['investor_name']}"
            )

            print(
                f"   Firm            : "
                f"{rec['firm_name']}"
            )

            print(
                f"   Investment Stage : "
                f"{rec['investment_stages']}"
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
                f"   Domain Match    : "
                f"{rec['domain_score']}%"
            )

            print(
                f"   Similarity      : "
                f"{rec['general_score']}%"
            )

            print(
                f"   Experience      : "
                f"{rec['experience_score']}%"
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

    engine = MentorInvestorEngine()


    # --------------------------------------------------------
    # AUTOMATIC TEST
    # --------------------------------------------------------

    if not engine.mentors.empty:

        test_mentor_id = (
            engine.mentors.iloc[0]["id"]
        )


        print(
            "\nTesting mentor ID: "
            f"{test_mentor_id}"
        )


        engine.display_recommendations(
            test_mentor_id,
            top_n=5
        )

    else:

        print(
            "No mentors available."
        )


