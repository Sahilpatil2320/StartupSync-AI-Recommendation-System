import os
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RESULTS_DIR = os.path.join(BASE_DIR, "results")

STUDENTS_FILE = os.path.join(
    RESULTS_DIR,
    "processed_students.csv"
)

MENTORS_FILE = os.path.join(
    RESULTS_DIR,
    "processed_mentors.csv"
)


# =========================================================
# INDUSTRY â†’ RELEVANT SKILLS
# =========================================================

INDUSTRY_SKILLS = {

    "technology": [
        "python",
        "java",
        "javascript",
        "react",
        "node",
        "sql",
        "mongodb",
        "cloud",
        "aws",
        "azure",
        "docker",
        "kubernetes",
        "machine learning",
        "data science",
        "software development"
    ],

    "software": [
        "python",
        "java",
        "javascript",
        "react",
        "node",
        "sql",
        "mongodb",
        "api",
        "docker",
        "cloud"
    ],

    "fintech": [
        "python",
        "java",
        "sql",
        "machine learning",
        "data science",
        "finance",
        "analytics"
    ],

    "healthtech": [
        "python",
        "machine learning",
        "data science",
        "healthcare",
        "analytics",
        "sql"
    ],

    "edtech": [
        "python",
        "java",
        "javascript",
        "react",
        "machine learning",
        "data science",
        "sql"
    ],

    "saas": [
        "python",
        "java",
        "javascript",
        "react",
        "node",
        "cloud",
        "aws",
        "docker",
        "sql"
    ],

    "cybersecurity": [
        "cybersecurity",
        "security",
        "linux",
        "network security",
        "ethical hacking",
        "owasp",
        "burp suite",
        "cloud security"
    ],

    "ecommerce": [
        "python",
        "javascript",
        "react",
        "node",
        "mongodb",
        "sql",
        "analytics"
    ],

    "ai": [
        "python",
        "machine learning",
        "deep learning",
        "data science",
        "tensorflow",
        "pytorch"
    ],

    "data science": [
        "python",
        "machine learning",
        "pandas",
        "numpy",
        "sql",
        "data science",
        "analytics"
    ]
}


# =========================================================
# UTILITY FUNCTIONS
# =========================================================

def clean_text(value):

    if pd.isna(value):
        return ""

    value = str(value).lower()

    value = re.sub(
        r"[^a-z0-9+#./ -]",
        " ",
        value
    )

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


def text_tokens(value):

    text = clean_text(value)

    if not text:
        return set()

    return set(text.split())


def calculate_overlap(text1, text2):

    tokens1 = text_tokens(text1)
    tokens2 = text_tokens(text2)

    if not tokens1 or not tokens2:
        return 0.0

    common = tokens1.intersection(tokens2)

    return min(
        len(common) / max(len(tokens1), 1) * 100,
        100
    )


def industry_related_skills(industry_profile):

    result = set()

    for industry in industry_profile:

        industry = clean_text(industry)

        if industry in INDUSTRY_SKILLS:

            result.update(
                INDUSTRY_SKILLS[industry]
            )

    return result


# =========================================================
# STUDENT INDUSTRY PROFILE
# =========================================================

def create_student_industry_profile(student):

    text = " ".join([
        clean_text(student.get("branch", "")),
        clean_text(student.get("skills", "")),
        clean_text(student.get("internship_domain", "")),
        clean_text(student.get("placement_domain", "")),
        clean_text(student.get("alumni_path", ""))
    ])

    keyword_groups = {

        "technology": [
            "computer",
            "software",
            "programming",
            "python",
            "java",
            "javascript",
            "coding",
            "developer",
            "machine learning",
            "data science",
            "technology"
        ],

        "fintech": [
            "finance",
            "fintech",
            "banking",
            "investment",
            "financial"
        ],

        "edtech": [
            "education",
            "edtech",
            "teaching",
            "learning"
        ],

        "healthtech": [
            "health",
            "healthcare",
            "medical",
            "medicine"
        ],

        "saas": [
            "saas",
            "software as a service",
            "cloud"
        ],

        "enterprise tech": [
            "enterprise",
            "business software",
            "erp"
        ],

        "cybersecurity": [
            "cybersecurity",
            "security",
            "ethical hacking",
            "network security",
            "information security"
        ],

        "ai": [
            "artificial intelligence",
            "machine learning",
            "deep learning",
            "ai"
        ]
    }

    profile = {}
    total_matches = 0

    for industry, keywords in keyword_groups.items():

        matches = 0

        for keyword in keywords:

            if keyword in text:
                matches += 1

        if matches > 0:

            profile[industry] = matches

            total_matches += matches

    if total_matches == 0:
        return {}

    for industry in profile:

        profile[industry] = round(
            profile[industry]
            / total_matches
            * 100,
            2
        )

    return dict(
        sorted(
            profile.items(),
            key=lambda x: x[1],
            reverse=True
        )
    )


# =========================================================
# STUDENT â†’ MENTOR ENGINE
# =========================================================

class StudentMentorEngine:

    def __init__(self):

        print(
            "Loading Student â†’ Mentor "
            "recommendation engine..."
        )

        self.students = pd.read_csv(
            STUDENTS_FILE
        )

        self.mentors = pd.read_csv(
            MENTORS_FILE
        )

        print(
            f"Loaded {len(self.students)} students"
        )

        print(
            f"Loaded {len(self.mentors)} mentors"
        )

        self.student_texts = []
        self.mentor_texts = []

        self.build_text_data()

        print(
            "\nBuilding Student â†’ Mentor "
            "similarity matrix..."
        )

        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2)
        )

        combined_text = (
            self.student_texts
            + self.mentor_texts
        )

        matrix = self.vectorizer.fit_transform(
            combined_text
        )

        student_count = len(
            self.student_texts
        )

        self.student_matrix = (
            matrix[:student_count]
        )

        self.mentor_matrix = (
            matrix[student_count:]
        )

        self.similarity_matrix = cosine_similarity(
            self.student_matrix,
            self.mentor_matrix
        )

        print(
            "Similarity matrix created."
        )

    # =====================================================
    # BUILD TEXT DATA
    # =====================================================

    def build_text_data(self):

        for _, student in self.students.iterrows():

            text = " ".join([
                clean_text(
                    student.get("branch", "")
                ),
                clean_text(
                    student.get("skills", "")
                ),
                clean_text(
                    student.get("clubs", "")
                ),
                clean_text(
                    student.get(
                        "internship_domain",
                        ""
                    )
                ),
                clean_text(
                    student.get(
                        "placement_domain",
                        ""
                    )
                ),
                clean_text(
                    student.get(
                        "alumni_path",
                        ""
                    )
                )
            ])

            self.student_texts.append(text)

        for _, mentor in self.mentors.iterrows():

            text = " ".join([
                clean_text(
                    mentor.get("expertise", "")
                ),
                clean_text(
                    mentor.get("skills", "")
                ),
                clean_text(
                    mentor.get("industry", "")
                ),
                clean_text(
                    mentor.get("domain", "")
                ),
                clean_text(
                    mentor.get("interests", "")
                )
            ])

            self.mentor_texts.append(text)

    # =====================================================
    # GET STUDENT
    # =====================================================

    def get_student(self, student_id):

        rows = self.students[
            self.students["id"].astype(str)
            == str(student_id)
        ]

        if rows.empty:
            return None

        return rows.iloc[0]

    # =====================================================
    # RECOMMEND MENTORS
    # =====================================================

    def recommend_mentors(
        self,
        student_id,
        top_n=5
    ):

        student = self.get_student(
            student_id
        )

        if student is None:

            print(
                f"Student ID {student_id} "
                "not found."
            )

            return [], {}

        student_indexes = self.students.index[
            self.students["id"].astype(str)
            == str(student_id)
        ]

        if len(student_indexes) == 0:
            return [], {}

        student_index = student_indexes[0]

        student_industry_profile = (
            create_student_industry_profile(
                student
            )
        )

        print(
            "\nAnalyzing student "
            "industry profile..."
        )

        if student_industry_profile:

            print(
                "Student Industry Profile:"
            )

            for industry, score in list(
                student_industry_profile.items()
            )[:5]:

                print(
                    f"  - {industry} "
                    f"({score:.2f}%)"
                )

        else:

            print(
                "  No strong industry "
                "profile detected."
            )

        relevant_skills = (
            industry_related_skills(
                student_industry_profile
            )
        )

        student_skills = clean_text(
            student.get("skills", "")
        )

        student_domains = " ".join([
            clean_text(
                student.get(
                    "internship_domain",
                    ""
                )
            ),
            clean_text(
                student.get(
                    "placement_domain",
                    ""
                )
            ),
            clean_text(
                student.get(
                    "alumni_path",
                    ""
                )
            )
        ])

        recommendations = []

        # =================================================
        # CHECK EVERY MENTOR
        # =================================================

        for mentor_index, mentor in (
            self.mentors.iterrows()
        ):

            mentor_skills = clean_text(
                mentor.get("skills", "")
            )

            mentor_expertise = clean_text(
                mentor.get("expertise", "")
            )

            mentor_industry = clean_text(
                mentor.get("industry", "")
            )

            mentor_domain = clean_text(
                mentor.get("domain", "")
            )

            mentor_interests = clean_text(
                mentor.get("interests", "")
            )

            # ---------------------------------------------
            # 1. Direct Skill Match
            # ---------------------------------------------

            skill_score = calculate_overlap(
                student_skills,
                mentor_skills
            )

            # ---------------------------------------------
            # 2. Expertise Match
            # ---------------------------------------------

            expertise_score = calculate_overlap(
                student_skills,
                mentor_expertise
            )

            # ---------------------------------------------
            # 3. Industry Match
            # ---------------------------------------------

            industry_score = 0.0

            for (
                industry,
                profile_score
            ) in student_industry_profile.items():

                if industry in mentor_industry:

                    industry_score = max(
                        industry_score,
                        profile_score
                    )

                if industry in mentor_domain:

                    industry_score = max(
                        industry_score,
                        profile_score
                    )

            # ---------------------------------------------
            # 4. Industry Skill Match
            # ---------------------------------------------

            industry_skill_score = 0.0

            if relevant_skills:

                mentor_skill_text = (
                    mentor_skills
                    + " "
                    + mentor_expertise
                )

                mentor_skill_tokens = (
                    text_tokens(
                        mentor_skill_text
                    )
                )

                matches = 0

                for skill in relevant_skills:

                    skill = clean_text(skill)

                    # Exact phrase matching
                    if skill in mentor_skill_tokens:
                        matches += 1

                    # Also check multi-word phrases
                    elif (
                        skill
                        in mentor_skill_text
                    ):
                        matches += 1

                industry_skill_score = min(
                    matches
                    / len(relevant_skills)
                    * 100,
                    100
                )

            # ---------------------------------------------
            # 5. Career / Domain Match
            # ---------------------------------------------

            career_score = calculate_overlap(
                student_domains,
                mentor_interests
                + " "
                + mentor_domain
            )

            # ---------------------------------------------
            # 6. Semantic Similarity
            # ---------------------------------------------

            similarity_score = (
                self.similarity_matrix[
                    student_index,
                    mentor_index
                ]
                * 100
            )

            # ---------------------------------------------
            # FINAL WEIGHTED SCORE
            # ---------------------------------------------

            overall_score = (

                industry_score * 0.30

                + industry_skill_score * 0.25

                + skill_score * 0.20

                + expertise_score * 0.10

                + career_score * 0.05

                + similarity_score * 0.10
            )

            # ---------------------------------------------
            # STRONG SIGNALS
            # ---------------------------------------------

            strong_matches = 0

            if skill_score >= 15:
                strong_matches += 1

            if expertise_score >= 15:
                strong_matches += 1

            if industry_score >= 15:
                strong_matches += 1

            if industry_skill_score >= 15:
                strong_matches += 1

            if career_score >= 15:
                strong_matches += 1

            # ---------------------------------------------
            # DIRECT EVIDENCE REQUIRED
            # ---------------------------------------------

            direct_evidence = (

                skill_score >= 15

                or industry_score >= 15

                or industry_skill_score >= 15
            )

            if not direct_evidence:
                continue

            if strong_matches < 1:
                continue

            # ---------------------------------------------
            # ADD RECOMMENDATION
            # ---------------------------------------------

            recommendations.append({

                "id": mentor.get(
                    "id",
                    ""
                ),

                "name": mentor.get(
                    "name",
                    ""
                ),

                "expertise": mentor.get(
                    "expertise",
                    ""
                ),

                "skills": mentor.get(
                    "skills",
                    ""
                ),

                "industry": mentor.get(
                    "industry",
                    ""
                ),

                "domain": mentor.get(
                    "domain",
                    ""
                ),

                "experience": mentor.get(
                    "experience_years",
                    ""
                ),

                "location": mentor.get(
                    "location",
                    ""
                ),

                "industry_score":
                    industry_score,

                "industry_skill_score":
                    industry_skill_score,

                "skill_score":
                    skill_score,

                "expertise_score":
                    expertise_score,

                "career_score":
                    career_score,

                "similarity_score":
                    similarity_score,

                "strong_matches":
                    strong_matches,

                "overall_score":
                    overall_score
            })

        # =================================================
        # REMOVE DUPLICATE MENTORS
        # =================================================

        unique = {}

        for candidate in recommendations:

            name = str(
                candidate["name"]
            ).strip().lower()

            if not name:
                name = str(
                    candidate["id"]
                )

            if (
                name not in unique
                or candidate["overall_score"]
                > unique[name]["overall_score"]
            ):

                unique[name] = candidate

        recommendations = list(
            unique.values()
        )

        # =================================================
        # SORT
        # =================================================

        recommendations.sort(
            key=lambda x: x["overall_score"],
            reverse=True
        )

        return (
            recommendations[:top_n],
            student_industry_profile
        )


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    engine = StudentMentorEngine()

    if engine.students.empty:

        print(
            "No students found."
        )

        exit()

    # Test first student
    student_id = (
        engine.students.iloc[0]["id"]
    )

    student = engine.get_student(
        student_id
    )

    print(
        "\n"
        + "=" * 70
    )

    print(
        "STUDENT â†’ MENTOR RECOMMENDATION"
    )

    print(
        "=" * 70
    )

    print(
        f"Student    : "
        f"{student['name']}"
    )

    print(
        f"Student ID : "
        f"{student['id']}"
    )

    print(
        f"Branch     : "
        f"{student['branch']}"
    )

    print(
        f"GPA        : "
        f"{student['gpa']}"
    )

    print(
        f"Skills     : "
        f"{student['skills']}"
    )

    print(
        f"Internship : "
        f"{student['internship_done']}"
    )

    print(
        f"Internship Domain : "
        f"{student['internship_domain']}"
    )

    print(
        f"Placement Domain  : "
        f"{student['placement_domain']}"
    )

    print(
        f"Alumni Path       : "
        f"{student['alumni_path']}"
    )

    recommendations, industries = (
        engine.recommend_mentors(
            student_id,
            top_n=5
        )
    )

    print(
        "\nTop Recommended Mentors:"
    )

    if not recommendations:

        print(
            "\nNo strong mentor matches "
            "found in the current dataset."
        )

    else:

        for i, rec in enumerate(
            recommendations,
            start=1
        ):

            print(
                "\n"
                + "-" * 70
            )

            print(
                f"{i}. "
                f"{rec['name']} "
                f"({rec['id']})"
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
                f"   Industry        : "
                f"{rec['industry']}"
            )

            print(
                f"   Domain          : "
                f"{rec['domain']}"
            )

            print(
                f"   Experience      : "
                f"{rec['experience']} years"
            )

            print(
                f"   Location        : "
                f"{rec['location']}"
            )

            print(
                f"   Industry Match  : "
                f"{rec['industry_score']:.2f}%"
            )

            print(
                f"   Industry Skills : "
                f"{rec['industry_skill_score']:.2f}%"
            )

            print(
                f"   Skill Match     : "
                f"{rec['skill_score']:.2f}%"
            )

            print(
                f"   Expertise Match : "
                f"{rec['expertise_score']:.2f}%"
            )

            print(
                f"   Career Match    : "
                f"{rec['career_score']:.2f}%"
            )

            print(
                f"   Semantic Match  : "
                f"{rec['similarity_score']:.2f}%"
            )

            print(
                f"   Strong Signals  : "
                f"{rec['strong_matches']}"
            )

            print(
                f"   Overall Score   : "
                f"{rec['overall_score']:.2f}"
            )

