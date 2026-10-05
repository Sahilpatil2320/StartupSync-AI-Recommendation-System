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
        "information security",
        "network security",
        "cloud security",
        "application security",
        "web security",
        "privacy",
        "identity",
        "risk",
        "vulnerability",
        "penetration testing",
        "owasp"
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
# SECURITY / DOMAIN KEYWORDS
# ============================================================

SECURITY_TERMS = {
    "security",
    "cybersecurity",
    "cyber",
    "infosec",
    "cloud",
    "cloud security",
    "web security",
    "application security",
    "network security",
    "information security",
    "privacy",
    "identity",
    "risk",
    "vulnerability",
    "owasp",
    "burp",
    "linux",
    "penetration",
    "penetration testing",
    "security software"
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
# MENTOR â†’ FOUNDER ENGINE
# ============================================================

class MentorFounderEngine:

    def __init__(self):

        print(
            "Loading Mentor â†’ Founder recommendation engine..."
        )

        self.load_data()

        self.prepare_data()

        self.build_similarity()

        self.build_industry_predictions()


    # ========================================================
    # LOAD DATA
    # ========================================================

    def load_data(self):

        self.mentors = pd.read_csv(
            MENTOR_FILE
        )

        self.founders = pd.read_csv(
            FOUNDER_FILE
        )

        print(
            f"Loaded {len(self.mentors)} mentors"
        )

        print(
            f"Loaded {len(self.founders)} founders"
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

        founder_columns = [
            "id",
            "name",
            "company",
            "funding_stage",
            "company_features",
            "domain_features",
            "competitor_features",
            "ecosystem_features"
        ]


        for column in mentor_columns:

            if column not in self.mentors.columns:

                self.mentors[column] = ""


        for column in founder_columns:

            if column not in self.founders.columns:

                self.founders[column] = ""


        for column in mentor_columns:

            self.mentors[column] = (
                self.mentors[column]
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
    # BUILD SIMILARITY
    # ========================================================

    def build_similarity(self):

        print(
            "\nBuilding Mentor â†’ Founder similarity matrix..."
        )

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
            mentor_text +
            founder_text
        )


        matrix = self.vectorizer.fit_transform(
            combined_text
        )


        mentor_matrix = matrix[
            :len(mentor_text)
        ]


        founder_matrix = matrix[
            len(mentor_text):
        ]


        self.similarity_matrix = cosine_similarity(
            mentor_matrix,
            founder_matrix
        )


        print(
            "Similarity matrix created."
        )


    # ========================================================
    # BUILD FOUNDER INDUSTRY PREDICTIONS
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

        # Create IndustryMapper only once.

        self.industry_mapper = IndustryMapper()

        self.founder_industries = {}


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

    def get_founder_industries(
        self,
        founder
    ):

        return self.founder_industries.get(
            founder["id"],
            []
        )


    # ========================================================
    # INDUSTRY MATCH
    # ========================================================

    def industry_match(
        self,
        mentor,
        founder
    ):

        predictions = (
            self.get_founder_industries(
                founder
            )
        )


        if not predictions:

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


        for prediction in predictions:

            if not isinstance(
                prediction,
                dict
            ):

                continue


            industry = prediction.get(
                "industry",
                ""
            )


            confidence = prediction.get(
                "confidence",
                0
            )


            industry = clean_text(
                industry
            )


            if not industry:

                continue


            keywords = INDUSTRY_KEYWORDS.get(
                industry,
                []
            )


            if not keywords:

                continue


            matched = 0


            for keyword in keywords:

                if contains_term(
                    mentor_text,
                    keyword
                ):

                    matched += 1


            if matched == 0:

                continue


            mentor_industry_score = (
                matched /
                len(keywords)
            )


            confidence = float(
                confidence
            )


            if confidence > 1:

                confidence /= 100.0


            confidence = max(
                0.0,
                min(
                    confidence,
                    1.0
                )
            )


            score = (
                mentor_industry_score * 0.60
                +
                confidence * 0.40
            )


            best_score = max(
                best_score,
                score
            )


        return best_score


    # ========================================================
    # SECURITY SPECIALIZATION MATCH
    # ========================================================

    def security_match(
        self,
        mentor,
        founder
    ):

        mentor_text = " ".join([
            mentor["expertise"],
            mentor["skills"],
            mentor["industry"],
            mentor["domain"],
            mentor["interests"]
        ])


        founder_text = " ".join([
            founder["company_features"],
            founder["domain_features"],
            founder["competitor_features"],
            founder["ecosystem_features"]
        ])


        mentor_text = clean_text(
            mentor_text
        )

        founder_text = clean_text(
            founder_text
        )


        mentor_security = 0


        for term in SECURITY_TERMS:

            if contains_term(
                mentor_text,
                term
            ):

                mentor_security += 1


        if mentor_security == 0:

            return 0.0


        founder_security = 0


        for term in SECURITY_TERMS:

            if contains_term(
                founder_text,
                term
            ):

                founder_security += 1


        if founder_security == 0:

            return 0.0


        mentor_score = min(
            mentor_security / 5.0,
            1.0
        )


        founder_score = min(
            founder_security / 5.0,
            1.0
        )


        return (
            mentor_score *
            founder_score
        )


    # ========================================================
    # EXPERTISE MATCH
    # ========================================================

    def expertise_match(
        self,
        mentor,
        founder
    ):

        mentor_expertise = tokenize(
            mentor["expertise"]
        )


        founder_text = " ".join([
            founder["company_features"],
            founder["domain_features"],
            founder["competitor_features"],
            founder["ecosystem_features"]
        ])


        founder_tokens = tokenize(
            founder_text
        )


        if not mentor_expertise:

            return 0.0


        if not founder_tokens:

            return 0.0


        overlap = (
            mentor_expertise
            &
            founder_tokens
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
        founder
    ):

        mentor_skills = tokenize(
            mentor["skills"]
        )


        founder_text = " ".join([
            founder["company_features"],
            founder["domain_features"],
            founder["competitor_features"],
            founder["ecosystem_features"]
        ])


        founder_tokens = tokenize(
            founder_text
        )


        if not mentor_skills:

            return 0.0


        if not founder_tokens:

            return 0.0


        overlap = (
            mentor_skills
            &
            founder_tokens
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
        founder
    ):

        mentor_interests = tokenize(
            mentor["interests"]
        )


        founder_text = " ".join([
            founder["ecosystem_features"],
            founder["competitor_features"],
            founder["domain_features"]
        ])


        founder_tokens = tokenize(
            founder_text
        )


        if not mentor_interests:

            return 0.0


        if not founder_tokens:

            return 0.0


        overlap = (
            mentor_interests
            &
            founder_tokens
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
        mentor_index,
        founder_index
    ):

        return float(
            self.similarity_matrix[
                mentor_index,
                founder_index
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
    # NORMALIZED FOUNDER KEY
    # ========================================================

    def founder_key(
        self,
        founder
    ):

        company = clean_text(
            founder["company"]
        )

        name = clean_text(
            founder["name"]
        )


        if company:

            return company


        return name


    # ========================================================
    # RECOMMEND FOUNDERS
    # ========================================================

    def recommend_founders(
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


        for founder_index, founder in (
            self.founders.iterrows()
        ):

            industry_score = (
                self.industry_match(
                    mentor,
                    founder
                )
            )


            security_score = (
                self.security_match(
                    mentor,
                    founder
                )
            )


            expertise_score = (
                self.expertise_match(
                    mentor,
                    founder
                )
            )


            skills_score = (
                self.skills_match(
                    mentor,
                    founder
                )
            )


            interest_score = (
                self.interest_match(
                    mentor,
                    founder
                )
            )


            general_score = (
                self.general_similarity(
                    mentor_index,
                    founder_index
                )
            )


            experience_score = (
                self.experience_score(
                    mentor
                )
            )


            # ------------------------------------------------
            # FINAL SCORE
            # ------------------------------------------------
            #
            # Industry        = 30%
            # Specialization  = 15%
            # Expertise       = 15%
            # Skills          = 15%
            # General         = 10%
            # Interests       = 10%
            # Experience      = 5%
            #

            final_score = (

                industry_score * 0.30

                +

                security_score * 0.15

                +

                expertise_score * 0.15

                +

                skills_score * 0.15

                +

                general_score * 0.10

                +

                interest_score * 0.10

                +

                experience_score * 0.05
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

                "security_score":
                    round(
                        security_score * 100,
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


        # ----------------------------------------------------
        # SORT BY SCORE
        # ----------------------------------------------------

        recommendations.sort(
            key=lambda x: x["score"],
            reverse=True
        )


        # ----------------------------------------------------
        # REMOVE DUPLICATE FOUNDERS / COMPANIES
        # ----------------------------------------------------

        unique_recommendations = []

        seen = set()


        for recommendation in recommendations:

            company = clean_text(
                recommendation["company"]
            )

            founder_name = clean_text(
                recommendation["founder_name"]
            )


            unique_key = (
                company
                if company
                else founder_name
            )


            if not unique_key:

                unique_key = str(
                    recommendation["founder_id"]
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
            "MENTOR â†’ FOUNDER RECOMMENDATION"
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


        recommendations = (
            self.recommend_founders(
                mentor_id,
                top_n
            )
        )


        if not recommendations:

            print(
                "\nNo founder recommendations found."
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
                f"   Industry Match: "
                f"{rec['industry_score']}%"
            )

            print(
                f"   Specialization: "
                f"{rec['security_score']}%"
            )

            print(
                f"   Expertise     : "
                f"{rec['expertise_score']}%"
            )

            print(
                f"   Skills Match  : "
                f"{rec['skills_score']}%"
            )

            print(
                f"   Interest Match: "
                f"{rec['interest_score']}%"
            )

            print(
                f"   Similarity    : "
                f"{rec['general_score']}%"
            )

            print(
                f"   Experience    : "
                f"{rec['experience_score']}%"
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

    engine = MentorFounderEngine()


    # --------------------------------------------------------
    # AUTOMATIC TEST
    # --------------------------------------------------------

    if not engine.mentors.empty:

        # Use the actual first ID from the dataset.

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



