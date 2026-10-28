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


        # Map the actual processed_mentors.csv columns to the names
        # expected by this engine. The dataset uses "id" and "name",
        # while the recommendation output expects "mentor_id" and
        # "mentor_name".
        if "mentor_id" not in self.mentors.columns and "id" in self.mentors.columns:
            self.mentors["mentor_id"] = self.mentors["id"]

        if "mentor_name" not in self.mentors.columns and "name" in self.mentors.columns:
            self.mentors["mentor_name"] = self.mentors["name"]

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
            return None


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
            return None


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


        if not investor_tokens or not mentor_expertise:
            return None


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


        if not investor_tokens or not mentor_skills:
            return None


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


        if not investor_tokens or not mentor_interests:
            return None


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

        except (TypeError, ValueError):
            return None


        # Cap at 20 years.

        return min(
            years / 20.0,
            1.0
        )


    # ========================================================
    # RECOMMEND MENTORS
    # ========================================================

    def recommend_mentors(self, investor_id, top_n=5):
        """
        Recommend mentors for an investor using weighted compatibility.

        raw_score / score:
            Actual weighted compatibility from the recommendation engine,
            represented on a 0.0-1.0 scale.

        score_percentage:
            A relative ranking indicator scaled from 70% to 80% among the
            returned recommendations. It is NOT model accuracy or an
            absolute probability of compatibility.
        """

        feature_weights = {
            "industry": 0.35,
            "general": 0.25,
            "expertise": 0.15,
            "skills": 0.12,
            "interests": 0.08,
            "experience": 0.05,
        }

        investor_matches = self.investors[
            self.investors["id"].astype(str) == str(investor_id)
        ]

        if investor_matches.empty:
            print(f"Investor ID {investor_id} not found.")
            return []

        investor = investor_matches.iloc[0]
        investor_index = self.investors.index.get_loc(investor_matches.index[0])
        recommendations = []

        for mentor_position, (_, mentor) in enumerate(self.mentors.iterrows()):
            industry_score = self.industry_match(investor, mentor)
            expertise_score = self.expertise_match(investor, mentor)
            skills_score = self.skills_match(investor, mentor)
            interest_score = self.interest_match(investor, mentor)
            general_score = self.general_similarity(
                investor_index, mentor_position
            )
            experience_score = self.experience_score(mentor)

            feature_scores = {
                "industry": industry_score,
                "general": general_score,
                "expertise": expertise_score,
                "skills": skills_score,
                "interests": interest_score,
                "experience": experience_score,
            }

            # A score of 0.0 is valid; only None or invalid values are omitted.
            available_features = {}
            for key, value in feature_scores.items():
                if value is None:
                    continue
                try:
                    numeric_value = float(value)
                except (TypeError, ValueError):
                    continue

                if pd.isna(numeric_value):
                    continue

                available_features[key] = max(0.0, min(1.0, numeric_value))

            total_weight = sum(
                feature_weights[key] for key in available_features
            )

            if total_weight > 0:
                raw_score = sum(
                    available_features[key] * feature_weights[key]
                    for key in available_features
                ) / total_weight
            else:
                raw_score = 0.0

            recommendations.append({
                "mentor_id": mentor.get("mentor_id", mentor.get("id", "")),
                "mentor_name": mentor.get("mentor_name", mentor.get("name", "")),
                "expertise": mentor.get("expertise", ""),
                "skills": mentor.get("skills", ""),
                "industry": mentor.get("industry", ""),
                "domain": mentor.get("domain", ""),
                "experience_years": mentor.get("experience_years", ""),
                "location": mentor.get("location", ""),
                "industry_score": (
                    round(float(industry_score) * 100, 2)
                    if industry_score is not None else None
                ),
                "expertise_score": (
                    round(float(expertise_score) * 100, 2)
                    if expertise_score is not None else None
                ),
                "skills_score": (
                    round(float(skills_score) * 100, 2)
                    if skills_score is not None else None
                ),
                "interest_score": (
                    round(float(interest_score) * 100, 2)
                    if interest_score is not None else None
                ),
                "general_score": (
                    round(float(general_score) * 100, 2)
                    if general_score is not None else None
                ),
                "experience_score": (
                    round(float(experience_score) * 100, 2)
                    if experience_score is not None else None
                ),
                "raw_score": round(raw_score, 4),
                "score": round(raw_score, 4),
            })

        # Rank using real weighted compatibility before adjusting display values.
        recommendations.sort(
            key=lambda item: item["raw_score"],
            reverse=True,
        )

        try:
            limit = max(0, int(top_n))
        except (TypeError, ValueError):
            limit = 5

        recommendations = recommendations[:limit]
        if not recommendations:
            return []

        scores = [item["raw_score"] for item in recommendations]
        lowest = min(scores)
        highest = max(scores)

        for item in recommendations:
            if highest == lowest:
                relative_percentage = 75.0
            else:
                relative_percentage = 70.0 + (
                    (item["raw_score"] - lowest) / (highest - lowest)
                ) * 10.0

            item["score_percentage"] = round(relative_percentage, 2)

        return recommendations

    # ========================================================
    # DISPLAY RESULTS
    # ========================================================

    def display_recommendations(self, investor_id, top_n=5):
        investor_matches = self.investors[
            self.investors["id"].astype(str) == str(investor_id)
        ]

        if investor_matches.empty:
            print("Investor not found.")
            return

        investor = investor_matches.iloc[0]

        print("\n" + "=" * 70)
        print("INVESTOR -> MENTOR RECOMMENDATION")
        print("=" * 70)
        print(f"Investor : {investor.get('name', 'Not specified')}")
        print(f"Firm     : {investor.get('firm_name', 'Not specified')}")
        print(f"ID       : {investor.get('id', 'Not specified')}")
        print(f"Stages   : {investor.get('investment_stages', 'Not specified')}")

        industries = self.get_investor_industries(investor)
        if industries:
            print("\nInvestor Industry Profile:")
            for item in industries:
                print(
                    f"  - {item['industry']} "
                    f"({item['score'] * 100:.2f}%)"
                )

        recommendations = self.recommend_mentors(investor_id, top_n)

        print("\nTop Recommended Mentors:\n")
        if not recommendations:
            print("No mentor recommendations were returned.")
            return

        for index, rec in enumerate(recommendations, start=1):
            print(f"{index}. {rec['mentor_name']}")
            print(f"   Industry        : {rec['industry']}")
            print(f"   Expertise       : {rec['expertise']}")
            print(f"   Skills          : {rec['skills']}")
            print(f"   Experience      : {rec['experience_years']} years")
            print(f"   Location        : {rec['location']}")
            print(f"   Industry Match  : {rec['industry_score']}")
            print(f"   Expertise Match : {rec['expertise_score']}")
            print(f"   Skills Match    : {rec['skills_score']}")
            print(f"   Interest Match  : {rec['interest_score']}")
            print(f"   Similarity      : {rec['general_score']}")
            print(f"   Raw Score       : {rec['raw_score']}")
            print(f"   Relative Match  : {rec['score_percentage']}%")
            print()


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    engine = InvestorMentorEngine()

    # Test investor ID; change this to an ID present in investor_features.csv.
    test_investor_id = 3

    engine.display_recommendations(test_investor_id, top_n=5)