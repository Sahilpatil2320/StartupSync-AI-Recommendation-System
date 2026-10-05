import os
import re
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RESULTS_DIR = os.path.join(BASE_DIR, "results")


# =========================================================
# INDUSTRY â†’ RELEVANT STUDENT SKILLS
# =========================================================

INDUSTRY_SKILLS = {

    "healthtech / healthcare": [
        "python",
        "machine learning",
        "data science",
        "sql",
        "java",
        "web development"
    ],

    "fintech / finance": [
        "python",
        "sql",
        "java",
        "data science",
        "machine learning"
    ],

    "agritech": [
        "python",
        "machine learning",
        "data science",
        "sql"
    ],

    "foodtech / food & beverage": [
        "python",
        "sql",
        "web development",
        "java"
    ],

    "e-commerce / retail": [
        "web development",
        "python",
        "java",
        "sql",
        "data science"
    ],

    "saas / enterprise tech": [
        "python",
        "java",
        "sql",
        "web development",
        "machine learning"
    ],

    "technology / digital services": [
        "python",
        "java",
        "c++",
        "sql",
        "web development",
        "machine learning",
        "data science"
    ],

    "cybersecurity": [
        "python",
        "c++",
        "java",
        "sql"
    ],

    "edtech / education": [
        "python",
        "java",
        "web development",
        "sql",
        "machine learning"
    ],

    "cleantech / sustainability": [
        "python",
        "machine learning",
        "data science",
        "sql",
        "c++"
    ],

    "automotive / autotech": [
        "c++",
        "python",
        "machine learning",
        "sql"
    ],

    "logistics / mobility": [
        "python",
        "sql",
        "data science",
        "java",
        "web development"
    ],

    "real estate / proptech": [
        "python",
        "sql",
        "web development",
        "java"
    ],

    "media / entertainment": [
        "web development",
        "python",
        "java",
        "data science"
    ],

    "traveltech / hospitality": [
        "web development",
        "python",
        "java",
        "sql"
    ]
}


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_text(value):

    if pd.isna(value):
        return ""

    value = str(value).lower()

    value = re.sub(
        r"[^a-z0-9+#.\- ]+",
        " ",
        value
    )

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


def get_tokens(text):

    text = clean_text(text)

    if not text:
        return set()

    return set(text.split())


# =========================================================
# FOUNDER â†’ STUDENT ENGINE
# =========================================================

class FounderStudentEngine:

    def __init__(self):

        founder_file = os.path.join(
            RESULTS_DIR,
            "founder_features.csv"
        )

        student_file = os.path.join(
            RESULTS_DIR,
            "processed_students.csv"
        )

        self.founders = pd.read_csv(
            founder_file
        )

        self.students = pd.read_csv(
            student_file
        )

        print(
            f"Loaded {len(self.founders)} founders"
        )

        print(
            f"Loaded {len(self.students)} students"
        )

        self.prepare_data()

        self.build_similarity()


    # =====================================================
    # PREPARE DATA
    # =====================================================

    def prepare_data(self):

        founder_columns = [
            "company_features",
            "domain_features",
            "competitor_features",
            "ecosystem_features"
        ]

        for column in founder_columns:

            if column not in self.founders.columns:

                self.founders[column] = ""

            self.founders[column] = (
                self.founders[column]
                .fillna("")
                .astype(str)
                .apply(clean_text)
            )

        student_columns = [
            "skills",
            "branch",
            "internship_done",
            "internship_domain",
            "placement_domain",
            "clubs",
            "placement_status",
            "alumni_path"
        ]

        for column in student_columns:

            if column not in self.students.columns:

                self.students[column] = ""

            self.students[column] = (
                self.students[column]
                .fillna("")
                .astype(str)
                .apply(clean_text)
            )

        # Founder text
        self.founder_text = (
            self.founders["company_features"] + " " +
            self.founders["domain_features"] + " " +
            self.founders["competitor_features"] + " " +
            self.founders["ecosystem_features"]
        )

        # Student text
        self.student_text = (
            self.students["skills"] + " " +
            self.students["branch"] + " " +
            self.students["internship_domain"] + " " +
            self.students["placement_domain"]
        )


    # =====================================================
    # TF-IDF SIMILARITY
    # =====================================================

    def build_similarity(self):

        print(
            "\nBuilding Founder â†’ Student similarity matrix..."
        )

        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1
        )

        combined_text = pd.concat(
            [
                self.founder_text,
                self.student_text
            ],
            ignore_index=True
        )

        matrix = self.vectorizer.fit_transform(
            combined_text
        )

        founder_count = len(
            self.founders
        )

        founder_matrix = matrix[
            :founder_count
        ]

        student_matrix = matrix[
            founder_count:
        ]

        self.general_similarity = cosine_similarity(
            founder_matrix,
            student_matrix
        )

        print(
            "Similarity matrix created."
        )


    # =====================================================
    # FIND FOUNDER
    # =====================================================

    def find_founder(self, founder_id):

        matches = self.founders[
            self.founders["id"] == founder_id
        ]

        if matches.empty:

            raise ValueError(
                f"Founder ID {founder_id} not found."
            )

        return matches.iloc[0]


    # =====================================================
    # PREDICT INDUSTRY
    # =====================================================

    def predict_industries(self, founder):

        try:

            import sys
            from pathlib import Path

            ENGINE_DIR = Path(__file__).resolve().parent.parent.parent

            if str(ENGINE_DIR) not in sys.path:
                sys.path.append(str(ENGINE_DIR))

            from features.industry_mapper import IndustryMapper

            mapper = IndustryMapper()

            return mapper.predict_industries(
                founder["id"],
                top_n=5
            )

        except Exception as error:

            print(
                f"Industry prediction warning: {error}"
            )

            return []


    # =====================================================
    # INDUSTRY â†’ SKILL COMPATIBILITY
    # =====================================================

    def industry_skill_match(
        self,
        predicted_industries,
        student
    ):

        if not predicted_industries:

            return 0.0

        student_skills = get_tokens(
            student["skills"]
        )

        if not student_skills:

            return 0.0

        best_score = 0.0

        for prediction in predicted_industries:

            industry = prediction[
                "industry"
            ]

            confidence = prediction[
                "confidence"
            ]

            required_skills = (
                INDUSTRY_SKILLS.get(
                    industry,
                    []
                )
            )

            if not required_skills:

                continue

            matched = 0

            for skill in required_skills:

                skill_tokens = get_tokens(
                    skill
                )

                if skill_tokens.intersection(
                    student_skills
                ):

                    matched += 1

            if matched == 0:

                continue

            # Percentage of relevant skills
            skill_ratio = (
                matched /
                len(required_skills)
            )

            # Industry confidence also contributes
            score = (
                skill_ratio * 0.70 +
                confidence * 0.30
            )

            best_score = max(
                best_score,
                score
            )

        return min(
            best_score,
            1.0
        )


    # =====================================================
    # DIRECT SKILL SIMILARITY
    # =====================================================

    def direct_skill_match(
        self,
        founder,
        student
    ):

        founder_text = " ".join([
            founder["company_features"],
            founder["domain_features"],
            founder["competitor_features"],
            founder["ecosystem_features"]
        ])

        student_text = " ".join([
            student["skills"],
            student["internship_domain"],
            student["placement_domain"]
        ])

        founder_tokens = get_tokens(
            founder_text
        )

        student_tokens = get_tokens(
            student_text
        )

        if not founder_tokens or not student_tokens:

            return 0.0

        overlap = founder_tokens.intersection(
            student_tokens
        )

        union = founder_tokens.union(
            student_tokens
        )

        if not union:

            return 0.0

        return (
            len(overlap) /
            len(union)
        )


    # =====================================================
    # INTERNSHIP / PLACEMENT RELEVANCE
    # =====================================================

    def career_relevance(self, student):

        score = 0.0

        internship_domain = (
            student["internship_domain"]
        )

        placement_domain = (
            student["placement_domain"]
        )

        if internship_domain:

            score += 0.5

        if placement_domain:

            score += 0.5

        return score


    # =====================================================
    # GPA
    # =====================================================

    def gpa_score(self, student):

        try:

            gpa = float(
                student["gpa"]
            )

            if gpa <= 0:

                return 0.0

            return min(
                gpa / 10.0,
                1.0
            )

        except:

            return 0.0


    # =====================================================
    # RECOMMEND STUDENTS
    # =====================================================

    def recommend_students(
        self,
        founder_id,
        top_n=5
    ):

        founder = self.find_founder(
            founder_id
        )

        founder_index = self.founders.index[
            self.founders["id"] == founder_id
        ][0]

        predicted_industries = (
            self.predict_industries(
                founder
            )
        )

        results = []

        for student_index, student in (
            self.students.iterrows()
        ):

            industry_skill_score = (
                self.industry_skill_match(
                    predicted_industries,
                    student
                )
            )

            direct_skill_score = (
                self.direct_skill_match(
                    founder,
                    student
                )
            )

            general_score = (
                self.general_similarity[
                    founder_index,
                    student_index
                ]
            )

            career_score = (
                self.career_relevance(
                    student
                )
            )

            gpa_score = (
                self.gpa_score(
                    student
                )
            )

            # ---------------------------------------------
            # FINAL WEIGHTS
            #
            # Industry-related skills = 40%
            # Direct skills            = 30%
            # General similarity       = 15%
            # Career relevance         = 10%
            # GPA                      = 5%
            # ---------------------------------------------

            final_score = (
                industry_skill_score * 0.40 +
                direct_skill_score * 0.30 +
                general_score * 0.15 +
                career_score * 0.10 +
                gpa_score * 0.05
            )

            results.append({

                "student_id":
                    student["id"],

                "student_name":
                    student["name"],

                "branch":
                    student["branch"],

                "skills":
                    student["skills"],

                "internship_domain":
                    student["internship_domain"],

                "placement_domain":
                    student["placement_domain"],

                "gpa":
                    student["gpa"],

                "industry_skill_score":
                    industry_skill_score * 100,

                "direct_skill_score":
                    direct_skill_score * 100,

                "general_score":
                    general_score * 100,

                "career_score":
                    career_score * 100,

                "gpa_score":
                    gpa_score * 100,

                "score":
                    final_score,

                "score_percentage":
                    final_score * 100
            })

        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        return (
            results[:top_n],
            predicted_industries
        )


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 70)

    print(
        "FOUNDER â†’ STUDENT RECOMMENDATION ENGINE"
    )

    print("=" * 70)

    engine = FounderStudentEngine()

    founder_id = (
        engine.founders.iloc[0]["id"]
    )

    founder = engine.find_founder(
        founder_id
    )

    print("\nFounder:")

    print(
        f"Name    : {founder['name']}"
    )

    print(
        f"Company : {founder['company']}"
    )

    print(
        f"ID      : {founder_id}"
    )

    recommendations, industries = (
        engine.recommend_students(
            founder_id,
            top_n=5
        )
    )

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

    print("\nTop 5 Students:")

    for i, student in enumerate(
        recommendations,
        1
    ):

        print(
            f"{i}. "
            f"{student['student_name']} | "
            f"{student['branch']} | "
            f"Industry-Skills: "
            f"{student['industry_skill_score']:.2f}% | "
            f"Direct-Skills: "
            f"{student['direct_skill_score']:.2f}% | "
            f"Overall: "
            f"{student['score_percentage']:.2f}%"
        )


if __name__ == "__main__":

    main()



