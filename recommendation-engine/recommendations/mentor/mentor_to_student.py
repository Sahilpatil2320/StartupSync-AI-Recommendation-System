import os
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RESULTS_DIR = os.path.join(BASE_DIR, "results")


# ============================================================
# INDUSTRY / DOMAIN KNOWLEDGE
# ============================================================

INDUSTRY_SKILLS = {

    "cybersecurity": [
        "cybersecurity",
        "security",
        "network security",
        "ethical hacking",
        "penetration testing",
        "penetration",
        "owasp",
        "burp suite",
        "linux",
        "web security",
        "cloud security",
        "cryptography",
        "vulnerability",
        "firewall",
        "security testing",
        "information security"
    ],

    "cloud": [
        "cloud",
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        "devops",
        "linux",
        "networking",
        "cloud security"
    ],

    "saas": [
        "software",
        "web development",
        "full stack",
        "backend",
        "frontend",
        "react",
        "node",
        "javascript",
        "python",
        "java",
        "cloud",
        "api",
        "docker",
        "aws"
    ],

    "enterprise tech": [
        "software",
        "backend",
        "frontend",
        "cloud",
        "java",
        "python",
        "sql",
        "api",
        "devops",
        "docker"
    ],

    "technology": [
        "python",
        "java",
        "javascript",
        "react",
        "node",
        "sql",
        "machine learning",
        "data science",
        "cloud",
        "software",
        "web development"
    ],

    "fintech": [
        "finance",
        "fintech",
        "banking",
        "sql",
        "python",
        "data science",
        "machine learning",
        "analytics"
    ],

    "healthtech": [
        "healthcare",
        "health",
        "medical",
        "python",
        "data science",
        "machine learning",
        "analytics",
        "software"
    ],

    "edtech": [
        "education",
        "teaching",
        "python",
        "java",
        "javascript",
        "web development",
        "data science",
        "machine learning"
    ],

    "ecommerce": [
        "ecommerce",
        "retail",
        "marketing",
        "sales",
        "javascript",
        "react",
        "node",
        "python",
        "analytics"
    ],

    "ai": [
        "artificial intelligence",
        "machine learning",
        "deep learning",
        "python",
        "tensorflow",
        "pytorch",
        "data science",
        "nlp"
    ],

    "data science": [
        "data science",
        "python",
        "pandas",
        "numpy",
        "sql",
        "machine learning",
        "analytics",
        "tableau",
        "spark"
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
# SKILL MATCH
# ============================================================

def direct_skill_match(
    mentor_skills,
    student_skills
):

    mentor_tokens = token_set(
        mentor_skills
    )

    student_tokens = token_set(
        student_skills
    )

    if not mentor_tokens or not student_tokens:
        return 0.0

    matched = mentor_tokens.intersection(
        student_tokens
    )

    return min(
        len(matched)
        / len(mentor_tokens)
        * 100,
        100.0
    )


# ============================================================
# EXPERTISE â†’ STUDENT MATCH
# ============================================================

def expertise_match(
    mentor_expertise,
    mentor_skills,
    student_skills
):

    mentor_terms = (
        token_set(mentor_expertise)
        | token_set(mentor_skills)
    )

    student_terms = token_set(
        student_skills
    )

    if not mentor_terms or not student_terms:
        return 0.0

    matched = mentor_terms.intersection(
        student_terms
    )

    return min(
        len(matched)
        / len(mentor_terms)
        * 100,
        100.0
    )


# ============================================================
# INDUSTRY MATCH
# ============================================================

def calculate_industry_profile(
    mentor
):

    mentor_text = " ".join([
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

    profile = {}

    for industry, keywords in INDUSTRY_SKILLS.items():

        matches = 0

        for keyword in keywords:

            if contains_keyword(
                mentor_text,
                keyword
            ):
                matches += 1

        if matches > 0:
            profile[industry] = matches

    total = sum(
        profile.values()
    )

    if total == 0:
        return {}

    return {
        industry:
        (count / total) * 100

        for industry, count
        in profile.items()
    }


def industry_match(
    profile,
    student
):

    if not profile:
        return 0.0

    student_text = " ".join([
        clean_text(
            student.get("branch", "")
        ),
        clean_text(
            student.get("skills", "")
        ),
        clean_text(
            student.get("internship_domain", "")
        ),
        clean_text(
            student.get("placement_domain", "")
        ),
        clean_text(
            student.get("alumni_path", "")
        )
    ])

    if not student_text.strip():
        return 0.0

    final_score = 0.0

    for industry, profile_weight in profile.items():

        keywords = INDUSTRY_SKILLS.get(
            industry,
            []
        )

        if not keywords:
            continue

        matched = 0

        for keyword in keywords:

            if contains_keyword(
                student_text,
                keyword
            ):
                matched += 1

        if matched == 0:
            continue

        # Strength of student's connection
        keyword_score = (
            matched
            / len(keywords)
            * 100
        )

        final_score += (
            keyword_score
            * profile_weight
            / 100
        )

    return min(
        final_score,
        100.0
    )


# ============================================================
# CAREER GOAL MATCH
# ============================================================

def career_match(
    mentor_interests,
    student
):

    mentor_terms = token_set(
        mentor_interests
    )

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

    student_terms = token_set(
        career_text
    )

    if not mentor_terms or not student_terms:
        return 0.0

    matched = mentor_terms.intersection(
        student_terms
    )

    return min(
        len(matched)
        / len(mentor_terms)
        * 100,
        100.0
    )


# ============================================================
# ENGINE
# ============================================================

class MentorStudentEngine:

    def __init__(self):

        print(
            "Loading Mentor â†’ Student recommendation engine..."
        )

        mentor_path = os.path.join(
            RESULTS_DIR,
            "processed_mentors.csv"
        )

        student_path = os.path.join(
            RESULTS_DIR,
            "processed_students.csv"
        )

        self.mentors = pd.read_csv(
            mentor_path
        )

        self.students = pd.read_csv(
            student_path
        )

        print(
            f"Loaded {len(self.mentors)} mentors"
        )

        print(
            f"Loaded {len(self.students)} students"
        )

        # ----------------------------------------------------
        # Student text corpus
        # ----------------------------------------------------

        self.student_text = []

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

            self.student_text.append(
                text
            )

        print(
            "\nBuilding Mentor â†’ Student similarity matrix..."
        )

        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1
        )

        self.student_matrix = (
            self.vectorizer.fit_transform(
                self.student_text
            )
        )

        print(
            "Similarity matrix created."
        )

        # ----------------------------------------------------
        # Mentor profiles
        # ----------------------------------------------------

        print(
            "\nAnalyzing mentor industry profiles..."
        )

        self.mentor_profiles = {}

        for _, mentor in self.mentors.iterrows():

            mentor_id = str(
                mentor["id"]
            ).lower()

            self.mentor_profiles[
                mentor_id
            ] = calculate_industry_profile(
                mentor
            )

        print(
            "Mentor industry profiles created."
        )

    # ========================================================
    # RECOMMEND
    # ========================================================

    def recommend_students(
        self,
        mentor_id,
        top_n=5
    ):

        mentor_rows = self.mentors[
            self.mentors["id"].astype(str).str.lower()
            == str(mentor_id).lower()
        ]

        if mentor_rows.empty:

            print(
                f"Mentor ID '{mentor_id}' not found."
            )

            return []

        mentor = mentor_rows.iloc[0]

        profile = self.mentor_profiles.get(
            str(mentor_id).lower(),
            {}
        )

        # ----------------------------------------------------
        # Mentor TF-IDF vector
        # ----------------------------------------------------

        mentor_text = " ".join([
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

        mentor_vector = (
            self.vectorizer.transform(
                [mentor_text]
            )
        )

        similarities = cosine_similarity(
            mentor_vector,
            self.student_matrix
        )[0]

        candidates = []

        for index, student in self.students.iterrows():

            student_skills = (
                student.get(
                    "skills",
                    ""
                )
            )

            # ------------------------------------------------
            # Individual scores
            # ------------------------------------------------

            skill_score = direct_skill_match(
                mentor.get(
                    "skills",
                    ""
                ),
                student_skills
            )

            expertise_score = expertise_match(
                mentor.get(
                    "expertise",
                    ""
                ),
                mentor.get(
                    "skills",
                    ""
                ),
                student_skills
            )

            industry_score = industry_match(
                profile,
                student
            )

            career_score = career_match(
                mentor.get(
                    "interests",
                    ""
                ),
                student
            )

            similarity_score = (
                similarities[index]
                * 100
            )

            # ------------------------------------------------
            # Strong compatibility detection
            # ------------------------------------------------

            has_direct_skill = (
                skill_score >= 20
            )

            has_expertise_match = (
                expertise_score >= 20
            )

            has_industry_match = (
                industry_score >= 15
            )

            has_semantic_match = (
                similarity_score >= 15
            )

            strong_match_count = sum([
                has_direct_skill,
                has_expertise_match,
                has_industry_match,
                has_semantic_match
            ])

            # ------------------------------------------------
            # Final score
            #
            # NO GPA.
            # NO mentor experience.
            # ------------------------------------------------

            overall_score = (

                skill_score * 0.35

                + expertise_score * 0.25

                + industry_score * 0.20

                + career_score * 0.10

                + similarity_score * 0.10
            )

            # ------------------------------------------------
            # Compatibility penalty
            #
            # Prevent unrelated students from ranking highly.
            # ------------------------------------------------

            if strong_match_count == 0:

                overall_score *= 0.25

            elif strong_match_count == 1:

                overall_score *= 0.60

            candidates.append({

                "index": index,

                "student": student,

                "skills": skill_score,

                "expertise": expertise_score,

                "industry": industry_score,

                "career": career_score,

                "similarity": similarity_score,

                "strong_matches":
                    strong_match_count,

                "overall":
                    overall_score
            })

        # ----------------------------------------------------
        # Sort
        # ----------------------------------------------------

        candidates.sort(
            key=lambda x: (
                x["strong_matches"],
                x["overall"]
            ),
            reverse=True
        )

        # ----------------------------------------------------
        # Only accept reasonably compatible candidates
        # ----------------------------------------------------

        qualified = [

            candidate

            for candidate in candidates

            if candidate["strong_matches"] >= 2

        ]

        # ----------------------------------------------------
        # If fewer than top_n qualified students exist,
        # use candidates with at least one meaningful signal.
        # ----------------------------------------------------

        qualified = [
            candidate
            for candidate in candidates
            if candidate["strong_matches"] >= 2
        ]

        # ----------------------------------------------------
        # Remove duplicate IDs
        # ----------------------------------------------------

        final = []

        seen_ids = set()

        for candidate in qualified:

            student = candidate[
                "student"
            ]

            student_id = str(
                student.get(
                    "id",
                    ""
                )
            ).strip().lower()

            if not student_id:
                continue

            if student_id in seen_ids:
                continue

            seen_ids.add(
                student_id
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
    mentor_id,
    recommendations
):

    mentor = engine.mentors[
        engine.mentors["id"].astype(str).str.lower()
        == str(mentor_id).lower()
    ].iloc[0]

    print("\n" + "=" * 70)
    print(
        "MENTOR â†’ STUDENT RECOMMENDATION"
    )
    print("=" * 70)

    print(
        f"Mentor     : "
        f"{mentor.get('name', '')}"
    )

    print(
        f"Mentor ID  : "
        f"{mentor.get('id', '')}"
    )

    print(
        f"Expertise  : "
        f"{mentor.get('expertise', '')}"
    )

    print(
        f"Skills     : "
        f"{mentor.get('skills', '')}"
    )

    print(
        f"Industry   : "
        f"{mentor.get('industry', '')}"
    )

    print(
        f"Domain     : "
        f"{mentor.get('domain', '')}"
    )

    print(
        f"Experience : "
        f"{mentor.get('experience_years', '')} years"
    )

    print(
        f"Location   : "
        f"{mentor.get('location', '')}"
    )

    print(
        f"Interests  : "
        f"{mentor.get('interests', '')}"
    )

    # --------------------------------------------------------
    # Industry profile
    # --------------------------------------------------------

    profile = engine.mentor_profiles.get(
        str(mentor_id).lower(),
        {}
    )

    print(
        "\nMentor Industry Profile:"
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
        "\nTop Recommended Students:"
    )

    if not recommendations:

        print(
            "\nNo strong student matches found "
            "in the current dataset."
        )

        return

    for rank, candidate in enumerate(
        recommendations,
        start=1
    ):

        student = candidate[
            "student"
        ]

        print(
            f"\n{rank}. "
            f"{student.get('name', '')}"
        )

        print(
            f"   Student ID       : "
            f"{student.get('id', '')}"
        )

        print(
            f"   Branch           : "
            f"{student.get('branch', '')}"
        )

        print(
            f"   GPA              : "
            f"{student.get('gpa', '')}"
        )

        print(
            f"   Skills           : "
            f"{student.get('skills', '')}"
        )

        print(
            f"   Internship       : "
            f"{student.get('internship_done', '')}"
        )

        print(
            f"   Internship Domain: "
            f"{student.get('internship_domain', '')}"
        )

        print(
            f"   Placement Domain : "
            f"{student.get('placement_domain', '')}"
        )

        print(
            f"   Alumni Path      : "
            f"{student.get('alumni_path', '')}"
        )

        print(
            f"   Industry Match   : "
            f"{candidate['industry']:.2f}%"
        )

        print(
            f"   Skill Match      : "
            f"{candidate['skills']:.2f}%"
        )

        print(
            f"   Expertise Match  : "
            f"{candidate['expertise']:.2f}%"
        )

        print(
            f"   Career Match     : "
            f"{candidate['career']:.2f}%"
        )

        print(
            f"   Similarity       : "
            f"{candidate['similarity']:.2f}%"
        )

        print(
            f"   Strong Signals   : "
            f"{candidate['strong_matches']}/4"
        )

        print(
            f"   Overall Score    : "
            f"{candidate['overall']:.2f}%"
        )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    engine = MentorStudentEngine()

    # Test first mentor
    test_mentor_id = str(
        engine.mentors.iloc[0]["id"]
    )

    print(
        f"\nTesting mentor ID: "
        f"{test_mentor_id}"
    )

    recommendations = (
        engine.recommend_students(
            test_mentor_id,
            top_n=5
        )
    )

    display_recommendations(
        engine,
        test_mentor_id,
        recommendations
    )

