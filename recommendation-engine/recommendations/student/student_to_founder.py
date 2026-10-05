import os
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RESULTS_DIR = os.path.join(BASE_DIR, "results")


# ============================================================
# INDUSTRY â†’ RELEVANT SKILLS
# ============================================================

INDUSTRY_SKILLS = {

    "cybersecurity": [
        "cybersecurity", "security", "network security",
        "ethical hacking", "penetration testing",
        "linux", "web security", "cloud security",
        "cryptography"
    ],

    "cloud": [
        "cloud", "aws", "azure", "gcp",
        "docker", "kubernetes", "devops",
        "linux", "networking"
    ],

    "saas": [
        "software", "web development", "full stack",
        "backend", "frontend", "react", "node",
        "javascript", "python", "java",
        "cloud", "api", "docker", "aws"
    ],

    "enterprise tech": [
        "software", "backend", "frontend",
        "cloud", "java", "python", "sql",
        "api", "devops", "docker"
    ],

    "technology": [
        "python", "java", "javascript",
        "react", "node", "sql",
        "machine learning", "data science",
        "cloud", "software",
        "web development"
    ],

    "fintech": [
        "finance", "fintech", "banking",
        "sql", "python", "data science",
        "machine learning", "analytics"
    ],

    "healthtech": [
        "healthcare", "health", "medical",
        "python", "data science",
        "machine learning", "analytics",
        "software"
    ],

    "edtech": [
        "education", "teaching",
        "python", "java", "javascript",
        "web development", "data science",
        "machine learning"
    ],

    "ecommerce": [
        "ecommerce", "retail", "marketing",
        "sales", "javascript", "react",
        "node", "python", "analytics"
    ],

    "ai": [
        "artificial intelligence",
        "machine learning",
        "deep learning",
        "python", "tensorflow",
        "pytorch", "data science", "nlp"
    ],

    "data science": [
        "data science", "python",
        "pandas", "numpy", "sql",
        "machine learning", "analytics",
        "tableau", "spark"
    ]
}


# ============================================================
# TEXT HELPERS
# ============================================================

def clean_text(value):

    if pd.isna(value):
        return ""

    text = str(value).lower()

    text = re.sub(
        r"[^a-z0-9+#.\-/ ]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


def token_set(value):

    text = clean_text(value)

    if not text:
        return set()

    return set(text.split())


def contains_keyword(text, keyword):

    text = clean_text(text)
    keyword = clean_text(keyword)

    if not text or not keyword:
        return False

    if " " in keyword:
        return keyword in text

    return keyword in token_set(text)


# ============================================================
# STUDENT INDUSTRY PROFILE
# ============================================================

def calculate_student_industry_profile(student):

    student_text = " ".join([
        clean_text(student.get("branch", "")),
        clean_text(student.get("skills", "")),
        clean_text(student.get("clubs", "")),
        clean_text(student.get("internship_domain", "")),
        clean_text(student.get("placement_domain", "")),
        clean_text(student.get("alumni_path", ""))
    ])

    profile = {}

    for industry, keywords in INDUSTRY_SKILLS.items():

        matches = 0

        for keyword in keywords:

            if contains_keyword(
                student_text,
                keyword
            ):
                matches += 1

        if matches > 0:
            profile[industry] = matches

    total = sum(profile.values())

    if total == 0:
        return {}

    return {
        industry: (count / total) * 100
        for industry, count in profile.items()
    }


# ============================================================
# FOUNDER INDUSTRY MATCH
# ============================================================

def industry_match(
    student_profile,
    founder_text
):

    if not student_profile:
        return 0.0

    founder_text = clean_text(
        founder_text
    )

    if not founder_text:
        return 0.0

    score = 0.0

    for industry, weight in student_profile.items():

        keywords = INDUSTRY_SKILLS.get(
            industry,
            []
        )

        if not keywords:
            continue

        matched = 0

        for keyword in keywords:

            if contains_keyword(
                founder_text,
                keyword
            ):
                matched += 1

        if matched > 0:

            keyword_score = (
                matched
                / len(keywords)
                * 100
            )

            score += (
                keyword_score
                * weight
                / 100
            )

    return min(score, 100.0)


# ============================================================
# SKILL MATCH
# ============================================================

def skill_match(
    student_skills,
    founder_text
):

    skills = token_set(
        student_skills
    )

    founder_text = clean_text(
        founder_text
    )

    if not skills or not founder_text:
        return 0.0

    matched = 0

    for skill in skills:

        if contains_keyword(
            founder_text,
            skill
        ):
            matched += 1

    return min(
        matched / len(skills) * 100,
        100.0
    )


# ============================================================
# CAREER MATCH
# ============================================================

def career_match(
    student,
    founder_text
):

    career_text = " ".join([
        str(
            student.get(
                "internship_domain",
                ""
            )
        ),
        str(
            student.get(
                "placement_domain",
                ""
            )
        ),
        str(
            student.get(
                "alumni_path",
                ""
            )
        ),
        str(
            student.get(
                "clubs",
                ""
            )
        )
    ])

    career_terms = token_set(
        career_text
    )

    founder_text = clean_text(
        founder_text
    )

    if not career_terms or not founder_text:
        return 0.0

    matched = 0

    for term in career_terms:

        if contains_keyword(
            founder_text,
            term
        ):
            matched += 1

    return min(
        matched / len(career_terms) * 100,
        100.0
    )


# ============================================================
# ENGINE
# ============================================================

class StudentFounderEngine:

    def __init__(self):

        print(
            "Loading Student â†’ Founder recommendation engine..."
        )

        student_path = os.path.join(
            RESULTS_DIR,
            "processed_students.csv"
        )

        founder_path = os.path.join(
            RESULTS_DIR,
            "founder_features.csv"
        )

        self.students = pd.read_csv(
            student_path
        )

        self.founders = pd.read_csv(
            founder_path
        )

        print(
            f"Loaded {len(self.students)} students"
        )

        print(
            f"Loaded {len(self.founders)} founders"
        )

        # ----------------------------------------------------
        # Build founder text
        # ----------------------------------------------------

        self.founder_text = []

        for _, founder in self.founders.iterrows():

            text = " ".join([
                clean_text(
                    founder.get(
                        "company",
                        ""
                    )
                ),
                clean_text(
                    founder.get(
                        "funding_stage",
                        ""
                    )
                ),
                clean_text(
                    founder.get(
                        "company_features",
                        ""
                    )
                ),
                clean_text(
                    founder.get(
                        "domain_features",
                        ""
                    )
                ),
                clean_text(
                    founder.get(
                        "competitor_features",
                        ""
                    )
                ),
                clean_text(
                    founder.get(
                        "ecosystem_features",
                        ""
                    )
                )
            ])

            self.founder_text.append(
                text
            )

        print(
            "\nBuilding Student â†’ Founder similarity matrix..."
        )

        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1
        )

        self.founder_matrix = (
            self.vectorizer.fit_transform(
                self.founder_text
            )
        )

        print(
            "Similarity matrix created."
        )

        # ----------------------------------------------------
        # Student industry profiles
        # ----------------------------------------------------

        print(
            "\nAnalyzing student industry profiles..."
        )

        self.student_profiles = {}

        for _, student in self.students.iterrows():

            student_id = str(
                student["id"]
            ).lower()

            self.student_profiles[
                student_id
            ] = calculate_student_industry_profile(
                student
            )

        print(
            "Student industry profiles created."
        )

    # ========================================================
    # RECOMMEND FOUNDERS
    # ========================================================

    def recommend_founders(
        self,
        student_id,
        top_n=5
    ):

        student_rows = self.students[
            self.students["id"].astype(str).str.lower()
            == str(student_id).lower()
        ]

        if student_rows.empty:

            print(
                f"Student ID '{student_id}' not found."
            )

            return []

        student = student_rows.iloc[0]

        profile = self.student_profiles.get(
            str(student_id).lower(),
            {}
        )

        # ----------------------------------------------------
        # Student text
        # ----------------------------------------------------

        student_text = " ".join([
            clean_text(
                student.get(
                    "branch",
                    ""
                )
            ),
            clean_text(
                student.get(
                    "skills",
                    ""
                )
            ),
            clean_text(
                student.get(
                    "clubs",
                    ""
                )
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

        student_vector = (
            self.vectorizer.transform(
                [student_text]
            )
        )

        similarities = cosine_similarity(
            student_vector,
            self.founder_matrix
        )[0]

        candidates = []

        for index, founder in self.founders.iterrows():

            founder_text = (
                self.founder_text[index]
            )

            # ------------------------------------------------
            # Individual scores
            # ------------------------------------------------

            industry_score = industry_match(
                profile,
                founder_text
            )

            skill_score = skill_match(
                student.get(
                    "skills",
                    ""
                ),
                founder_text
            )

            career_score = career_match(
                student,
                founder_text
            )

            similarity_score = (
                similarities[index]
                * 100
            )

            # ------------------------------------------------
            # Meaningful compatibility signals
            # ------------------------------------------------

            industry_signal = (
                industry_score >= 10
            )

            skill_signal = (
                skill_score >= 10
            )

            career_signal = (
                career_score >= 10
            )

            semantic_signal = (
                similarity_score >= 15
            )

            signal_count = sum([
                industry_signal,
                skill_signal,
                career_signal,
                semantic_signal
            ])

            # ------------------------------------------------
            # FINAL SCORE
            #
            # Explicit domain evidence has more weight than
            # raw TF-IDF similarity.
            # ------------------------------------------------

            overall_score = (

                industry_score * 0.40

                + skill_score * 0.30

                + career_score * 0.15

                + similarity_score * 0.15
            )

            # ------------------------------------------------
            # Prevent weak semantic-only recommendations
            # ------------------------------------------------

            if signal_count == 0:

                overall_score = 0.0

            elif signal_count == 1:

                overall_score *= 0.40

            candidates.append({

                "index": index,

                "founder": founder,

                "industry":
                    industry_score,

                "skills":
                    skill_score,

                "career":
                    career_score,

                "similarity":
                    similarity_score,

                "signals":
                    signal_count,

                "overall":
                    overall_score
            })

        # ----------------------------------------------------
        # Sort by evidence first, then score
        # ----------------------------------------------------

        candidates.sort(
            key=lambda x: (
                x["signals"],
                x["overall"]
            ),
            reverse=True
        )

        # ----------------------------------------------------
        # Only meaningful candidates
        #
        # At least TWO compatibility signals.
        # ----------------------------------------------------

        qualified = [
            candidate
            for candidate in candidates
            if (
                candidate["industry"] >= 10
                or candidate["skills"] >= 10
            )
        ]

        # ----------------------------------------------------
        # Remove duplicate companies
        # ----------------------------------------------------

        final = []

        seen_companies = set()

        for candidate in qualified:

            founder = candidate[
                "founder"
            ]

            company = clean_text(
                founder.get(
                    "company",
                    ""
                )
            )

            if not company:

                company = (
                    "founder_"
                    + str(
                        founder.get(
                            "id",
                            ""
                        )
                    )
                )

            if company in seen_companies:
                continue

            seen_companies.add(
                company
            )

            final.append(
                candidate
            )

            if len(final) >= top_n:
                break

        return final


# ============================================================
# DISPLAY
# ============================================================

def display_recommendations(
    engine,
    student_id,
    recommendations
):

    student = engine.students[
        engine.students["id"].astype(str).str.lower()
        == str(student_id).lower()
    ].iloc[0]

    print("\n" + "=" * 70)
    print(
        "STUDENT â†’ FOUNDER RECOMMENDATION"
    )
    print("=" * 70)

    print(
        f"Student    : "
        f"{student.get('name', '')}"
    )

    print(
        f"Student ID : "
        f"{student.get('id', '')}"
    )

    print(
        f"Branch     : "
        f"{student.get('branch', '')}"
    )

    print(
        f"GPA        : "
        f"{student.get('gpa', '')}"
    )

    print(
        f"Skills     : "
        f"{student.get('skills', '')}"
    )

    print(
        f"Internship : "
        f"{student.get('internship_done', '')}"
    )

    print(
        f"Internship Domain : "
        f"{student.get('internship_domain', '')}"
    )

    print(
        f"Placement Domain  : "
        f"{student.get('placement_domain', '')}"
    )

    print(
        f"Alumni Path       : "
        f"{student.get('alumni_path', '')}"
    )

    # --------------------------------------------------------
    # Industry profile
    # --------------------------------------------------------

    profile = engine.student_profiles.get(
        str(student_id).lower(),
        {}
    )

    print(
        "\nStudent Industry Profile:"
    )

    if profile:

        sorted_profile = sorted(
            profile.items(),
            key=lambda x: x[1],
            reverse=True
        )

        for industry, score in sorted_profile[:5]:

            print(
                f"  - {industry} "
                f"({score:.2f}%)"
            )

    else:

        print(
            "  - No strong industry profile detected."
        )

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    print(
        "\nTop Recommended Founders:"
    )

    if not recommendations:

        print(
            "\nNo strong founder matches "
            "found in the current dataset."
        )

        return

    for rank, candidate in enumerate(
        recommendations,
        start=1
    ):

        founder = candidate[
            "founder"
        ]

        print(
            f"\n{rank}. "
            f"{founder.get('name', '')}"
        )

        print(
            f"   Founder ID       : "
            f"{founder.get('id', '')}"
        )

        print(
            f"   Company           : "
            f"{founder.get('company', '')}"
        )

        print(
            f"   Funding Stage     : "
            f"{founder.get('funding_stage', '')}"
        )

        print(
            f"   Industry Match    : "
            f"{candidate['industry']:.2f}%"
        )

        print(
            f"   Skill Match       : "
            f"{candidate['skills']:.2f}%"
        )

        print(
            f"   Career Match      : "
            f"{candidate['career']:.2f}%"
        )

        print(
            f"   Similarity        : "
            f"{candidate['similarity']:.2f}%"
        )

        print(
            f"   Strong Signals    : "
            f"{candidate['signals']}/4"
        )

        print(
            f"   Overall Score     : "
            f"{candidate['overall']:.2f}%"
        )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    engine = StudentFounderEngine()

    # Test first student
    test_student_id = str(
        engine.students.iloc[0]["id"]
    )

    print(
        f"\nTesting student ID: "
        f"{test_student_id}"
    )

    recommendations = (
        engine.recommend_founders(
            test_student_id,
            top_n=5
        )
    )

    display_recommendations(
        engine,
        test_student_id,
        recommendations
    )

