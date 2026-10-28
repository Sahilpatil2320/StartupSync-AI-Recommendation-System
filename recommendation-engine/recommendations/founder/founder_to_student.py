import re
import sys
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# PATHS
# ============================================================

# File location:
# recommendation-engine/recommendations/founder/founder_to_student.py
#
# Project structure:
# StartupSync-AI-Recommendation-System/
#   results/
#   recommendation-engine/
#     features/
#     recommendations/
#       founder/

CURRENT_DIR = Path(__file__).resolve().parent
ENGINE_DIR = CURRENT_DIR.parents[2]
PROJECT_ROOT = ENGINE_DIR.parent
RESULTS_DIR = PROJECT_ROOT / "results"


# ============================================================
# INDUSTRY -> RELEVANT STUDENT SKILLS
# ============================================================

INDUSTRY_SKILLS = {
    "healthtech / healthcare": [
        "python", "machine learning", "data science", "sql",
        "java", "web development",
    ],
    "fintech / finance": [
        "python", "sql", "java", "data science", "machine learning",
    ],
    "agritech": [
        "python", "machine learning", "data science", "sql",
    ],
    "foodtech / food & beverage": [
        "python", "sql", "web development", "java",
    ],
    "e-commerce / retail": [
        "web development", "python", "java", "sql", "data science",
    ],
    "saas / enterprise tech": [
        "python", "java", "sql", "web development", "machine learning",
    ],
    "technology / digital services": [
        "python", "java", "c++", "sql", "web development",
        "machine learning", "data science",
    ],
    "cybersecurity": [
        "python", "c++", "java", "sql", "cybersecurity",
        "network security",
    ],
    "edtech / education": [
        "python", "java", "web development", "sql", "machine learning",
    ],
    "cleantech / sustainability": [
        "python", "machine learning", "data science", "sql", "c++",
    ],
    "automotive / autotech": [
        "c++", "python", "machine learning", "sql",
    ],
    "logistics / mobility": [
        "python", "sql", "data science", "java", "web development",
    ],
    "real estate / proptech": [
        "python", "sql", "web development", "java",
    ],
    "media / entertainment": [
        "web development", "python", "java", "data science",
    ],
    "traveltech / hospitality": [
        "web development", "python", "java", "sql",
    ],
}


# ============================================================
# TEXT HELPERS
# ============================================================

def clean_text(value):
    """Normalize missing values and text for matching."""

    if value is None:
        return ""

    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass

    value = str(value).lower()
    value = re.sub(r"[^a-z0-9+#./& -]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def get_tokens(text):
    text = clean_text(text)
    return set(text.split()) if text else set()


def _value(row, key, default=""):
    """Read a row value safely."""

    if key not in row.index:
        return default

    value = row[key]

    if value is None:
        return default

    try:
        if pd.isna(value):
            return default
    except (TypeError, ValueError):
        pass

    return str(value).strip()


def _phrase_present(phrase, text):
    """Match a full phrase rather than an accidental substring."""

    phrase = clean_text(phrase)
    text = clean_text(text)

    if not phrase or not text:
        return False

    pattern = (
        r"(?<![a-z0-9])"
        + re.escape(phrase)
        + r"(?![a-z0-9])"
    )

    return re.search(pattern, text) is not None


def _bounded_confidence(value):
    """Convert industry confidence to a value between 0 and 1."""

    try:
        value = float(value)
    except (TypeError, ValueError):
        return 0.0

    if value > 1:
        value /= 100.0

    return max(0.0, min(value, 1.0))


# ============================================================
# FOUNDER -> STUDENT ENGINE
# ============================================================

class FounderStudentEngine:
    """
    Personalized Founder -> Student recommendation engine.

    Input files:
        results/founder_features.csv
        results/processed_students.csv

    Each score is a compatibility index, not a probability.
    The engine preserves actual ranking scores. Display calibration,
    if required by the frontend, is performed separately by the API.
    """

    FOUNDER_COLUMNS = [
        "company_features",
        "domain_features",
        "competitor_features",
        "ecosystem_features",
    ]

    STUDENT_COLUMNS = [
        "skills",
        "branch",
        "internship_done",
        "internship_domain",
        "placement_domain",
        "clubs",
        "placement_status",
        "alumni_path",
        "interests",
        "projects",
        "gpa",
    ]

    def __init__(self):
        founder_file = RESULTS_DIR / "founder_features.csv"
        student_file = RESULTS_DIR / "processed_students.csv"

        if not founder_file.exists():
            raise FileNotFoundError(
                f"Founder dataset not found: {founder_file}"
            )

        if not student_file.exists():
            raise FileNotFoundError(
                f"Student dataset not found: {student_file}"
            )

        self.founders = pd.read_csv(founder_file).fillna("")
        self.students = pd.read_csv(student_file).fillna("")

        if self.founders.empty:
            raise ValueError(
                "founder_features.csv contains no founder records."
            )

        if self.students.empty:
            raise ValueError(
                "processed_students.csv contains no student records."
            )

        if "id" not in self.founders.columns:
            raise ValueError(
                "Founder dataset must contain an 'id' column."
            )

        if "id" not in self.students.columns:
            raise ValueError(
                "Student dataset must contain an 'id' column."
            )

        if "name" not in self.founders.columns:
            self.founders["name"] = self.founders["id"].astype(str)

        if "name" not in self.students.columns:
            self.students["name"] = self.students["id"].astype(str)

        for column in self.FOUNDER_COLUMNS:
            if column not in self.founders.columns:
                self.founders[column] = ""

            self.founders[column] = (
                self.founders[column].apply(clean_text)
            )

        for column in self.STUDENT_COLUMNS:
            if column not in self.students.columns:
                self.students[column] = ""

            self.students[column] = (
                self.students[column].apply(clean_text)
            )

        self.founder_text = self.founders.apply(
            self._founder_profile_text,
            axis=1,
        )

        self.student_text = self.students.apply(
            self._student_profile_text,
            axis=1,
        )

        self._build_similarity()

        print(f"Loaded {len(self.founders)} founders")
        print(f"Loaded {len(self.students)} students")

    # --------------------------------------------------------
    # PROFILE TEXT
    # --------------------------------------------------------

    def _founder_profile_text(self, founder):
        fields = self.FOUNDER_COLUMNS + [
            "company",
            "industry",
            "domain",
            "stage",
            "requirements",
        ]

        return " ".join(
            clean_text(_value(founder, field))
            for field in fields
            if _value(founder, field)
        ).strip()

    def _student_profile_text(self, student):
        return " ".join(
            clean_text(_value(student, field))
            for field in self.STUDENT_COLUMNS
            if _value(student, field)
        ).strip()

    # --------------------------------------------------------
    # TF-IDF
    # --------------------------------------------------------

    def _build_similarity(self):
        """Build vectors once during initialization."""

        all_text = list(self.founder_text) + list(self.student_text)

        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True,
        )

        try:
            matrix = self.vectorizer.fit_transform(all_text)
        except ValueError:
            # Handles datasets whose profiles contain no usable vocabulary.
            self.vectorizer = None
            self.founder_matrix = None
            self.student_matrix = None
            return

        founder_count = len(self.founders)
        self.founder_matrix = matrix[:founder_count]
        self.student_matrix = matrix[founder_count:]

    # --------------------------------------------------------
    # FOUNDER LOOKUP
    # --------------------------------------------------------

    def find_founder(self, founder_id):
        matches = self.founders[
            self.founders["id"].astype(str) == str(founder_id)
        ]

        if matches.empty:
            raise ValueError(f"Founder ID {founder_id} not found.")

        return matches.iloc[0]

    # --------------------------------------------------------
    # INDUSTRY PREDICTION
    # --------------------------------------------------------

    def predict_industries(self, founder):
        """Use the project's IndustryMapper when available."""

        try:
            if str(ENGINE_DIR) not in sys.path:
                sys.path.insert(0, str(ENGINE_DIR))

            from features.industry_mapper import IndustryMapper

            mapper = IndustryMapper()
            predictions = mapper.predict_industries(
                founder["id"],
                top_n=5,
            )

            normalized = []

            for item in predictions or []:
                if not isinstance(item, dict):
                    continue

                if not item.get("industry"):
                    continue

                normalized.append({
                    "industry": clean_text(item["industry"]),
                    "confidence": _bounded_confidence(
                        item.get("confidence", 0)
                    ),
                })

            return normalized

        except Exception as error:
            print(f"Industry prediction warning: {error}")
            return []

    # --------------------------------------------------------
    # INDUSTRY SKILL MATCH
    # --------------------------------------------------------

    def industry_skill_match(self, predicted_industries, student):
        student_text = " ".join([
            _value(student, "skills"),
            _value(student, "branch"),
            _value(student, "internship_domain"),
            _value(student, "placement_domain"),
            _value(student, "interests"),
            _value(student, "projects"),
        ])

        if not student_text.strip():
            return 0.0

        best_score = 0.0

        for prediction in predicted_industries:
            industry = clean_text(
                prediction.get("industry", "")
            )

            confidence = _bounded_confidence(
                prediction.get("confidence", 0)
            )

            required_skills = INDUSTRY_SKILLS.get(industry, [])

            if not required_skills:
                for configured_industry, skills in INDUSTRY_SKILLS.items():
                    if (
                        configured_industry in industry
                        or industry in configured_industry
                    ):
                        required_skills = skills
                        break

            if not required_skills:
                continue

            matches = sum(
                1
                for skill in required_skills
                if _phrase_present(skill, student_text)
            )

            ratio = matches / max(len(required_skills), 1)
            confidence_factor = 0.65 + (0.35 * confidence)
            best_score = max(
                best_score,
                ratio * confidence_factor,
            )

        return max(0.0, min(best_score, 1.0))

    # --------------------------------------------------------
    # DIRECT SKILL MATCH
    # --------------------------------------------------------

    def direct_skill_match(self, founder, student):
        founder_text = self._founder_profile_text(founder)
        student_text = self._student_profile_text(student)

        founder_tokens = get_tokens(founder_text)
        student_tokens = get_tokens(student_text)

        if not founder_tokens or not student_tokens:
            return 0.0

        common_stop_words = {
            "and", "the", "for", "with", "from", "that", "this",
            "startup", "company", "business", "technology",
            "technologies", "industry",
        }

        founder_tokens -= common_stop_words
        student_tokens -= common_stop_words

        union = founder_tokens | student_tokens

        overlap_score = (
            len(founder_tokens & student_tokens) / len(union)
            if union else 0.0
        )

        cosine_score = 0.0

        if (
            self.founder_matrix is not None
            and self.student_matrix is not None
        ):
            try:
                founder_indices = self.founders.index[
                    self.founders["id"].astype(str)
                    == str(founder["id"])
                ]

                student_indices = self.students.index[
                    self.students["id"].astype(str)
                    == str(student["id"])
                ]

                if len(founder_indices) and len(student_indices):
                    founder_index = int(founder_indices[0])
                    student_index = int(student_indices[0])

                    cosine_score = float(
                        cosine_similarity(
                            self.founder_matrix[founder_index],
                            self.student_matrix[student_index],
                        )[0, 0]
                    )

            except (IndexError, KeyError, ValueError):
                cosine_score = 0.0

        combined = (
            overlap_score * 0.45
            + cosine_score * 0.55
        )

        return max(0.0, min(combined, 1.0))

    # --------------------------------------------------------
    # CAREER RELEVANCE
    # --------------------------------------------------------

    def career_relevance(self, student):
        score = 0.0

        if _value(student, "internship_domain"):
            score += 0.40

        if _value(student, "placement_domain"):
            score += 0.40

        internship_done = clean_text(
            _value(student, "internship_done")
        )

        if internship_done and internship_done not in {
            "no", "false", "none", "0", "not done",
        }:
            score += 0.10

        placement_status = clean_text(
            _value(student, "placement_status")
        )

        if placement_status and placement_status not in {
            "unknown", "not specified", "none",
        }:
            score += 0.10

        return min(score, 1.0)

    # --------------------------------------------------------
    # ACADEMIC SCORE
    # --------------------------------------------------------

    def gpa_score(self, student):
        raw_gpa = _value(student, "gpa")

        if not raw_gpa:
            return 0.0

        match = re.search(r"-?\d+(?:\.\d+)?", raw_gpa)

        if not match:
            return 0.0

        try:
            gpa = float(match.group())
        except (TypeError, ValueError):
            return 0.0

        if gpa <= 0:
            return 0.0

        # Support both common 4-point and 10-point grading scales.
        maximum = 4.0 if gpa <= 4.0 else 10.0

        return max(0.0, min(gpa / maximum, 1.0))

    # --------------------------------------------------------
    # RECOMMEND STUDENTS
    # --------------------------------------------------------

    def recommend_students(self, founder_id, top_n=5):
        founder = self.find_founder(founder_id)

        founder_indices = self.founders.index[
            self.founders["id"].astype(str) == str(founder_id)
        ]

        founder_index = int(founder_indices[0])
        predicted_industries = self.predict_industries(founder)

        # Calculate all TF-IDF similarities in one operation.
        if (
            self.founder_matrix is not None
            and self.student_matrix is not None
        ):
            similarities = cosine_similarity(
                self.founder_matrix[founder_index],
                self.student_matrix,
            ).ravel()
        else:
            similarities = [0.0] * len(self.students)

        results = []

        weights = {
            "industry": 0.35,
            "direct": 0.30,
            "general": 0.20,
            "career": 0.10,
            "gpa": 0.05,
        }

        for student_index, (_, student) in enumerate(
            self.students.iterrows()
        ):
            industry_score = self.industry_skill_match(
                predicted_industries,
                student,
            )

            direct_score = self.direct_skill_match(
                founder,
                student,
            )

            general_score = float(similarities[student_index])
            career_score = self.career_relevance(student)
            academic_score = self.gpa_score(student)

            final_score = (
                industry_score * weights["industry"]
                + direct_score * weights["direct"]
                + general_score * weights["general"]
                + career_score * weights["career"]
                + academic_score * weights["gpa"]
            )

            final_score = max(0.0, min(final_score, 1.0))

            results.append({
                "student_id": _value(student, "id"),
                "student_name": _value(student, "name", "Student"),
                "branch": _value(student, "branch"),
                "skills": _value(student, "skills"),
                "internship_domain": _value(
                    student, "internship_domain"
                ),
                "placement_domain": _value(
                    student, "placement_domain"
                ),
                "gpa": _value(student, "gpa"),
                "industry_skill_score": round(
                    industry_score * 100, 2
                ),
                "direct_skill_score": round(
                    direct_score * 100, 2
                ),
                "general_score": round(
                    general_score * 100, 2
                ),
                "career_score": round(
                    career_score * 100, 2
                ),
                "gpa_score": round(
                    academic_score * 100, 2
                ),
                # Keep the actual model score for ranking/evaluation.
                # The display score is a relative-match index, not a probability.
                "score": round(final_score, 6),
                "raw_score_percentage": round(final_score * 100, 2),
                "score_percentage": round(70.0 + (10.0 * final_score), 2),
                "score_label": "Relative match",
                "score_type": "calibrated_relative_match",
            })

        results.sort(
            key=lambda item: (
                item["score"],
                item["direct_skill_score"],
                item["industry_skill_score"],
                item["general_score"],
            ),
            reverse=True,
        )

        # Preserve true score differences; do not add random score noise.
        limit = max(1, int(top_n))

        return results[:limit], predicted_industries


# ============================================================
# LOCAL TEST
# ============================================================

def main():
    print("=" * 70)
    print("FOUNDER -> STUDENT RECOMMENDATION ENGINE")
    print("=" * 70)

    engine = FounderStudentEngine()

    founder_id = engine.founders.iloc[0]["id"]
    founder = engine.find_founder(founder_id)

    print("\nFounder:")
    print(f"Name    : {_value(founder, 'name')}")
    print(f"Company : {_value(founder, 'company')}")
    print(f"ID      : {founder_id}")

    recommendations, industries = engine.recommend_students(
        founder_id,
        top_n=5,
    )

    print("\nPredicted Industries:")

    if not industries:
        print("No industry prediction found.")
    else:
        for index, industry in enumerate(industries, 1):
            print(
                f"{index}. {industry['industry']} "
                f"({industry['confidence']:.2%})"
            )

    print("\nTop Students:")

    for index, student in enumerate(recommendations, 1):
        print(
            f"{index}. {student['student_name']} | "
            f"{student['branch']} | "
            f"Industry skills: "
            f"{student['industry_skill_score']:.2f}% | "
            f"Direct skills: "
            f"{student['direct_skill_score']:.2f}% | "
            f"Raw compatibility: {student['raw_score_percentage']:.2f}% | "
            f"Displayed relative match: {student['score_percentage']:.2f}%"
        )


if __name__ == "__main__":
    main()