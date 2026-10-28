from pathlib import Path
import re

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


ROOT = Path(__file__).resolve().parent.parent
RESULTS = ROOT / "results"

DATASETS = {
    "investors": "investor_features.csv",
    "mentors": "processed_mentors.csv",
    "students": "processed_students.csv",
}

# Role-specific feature weights. Weights total 1.0 per role.
WEIGHTS = {
    "investors": {
        "domain": 0.35,
        "stage": 0.25,
        "thesis": 0.25,
        "tags": 0.10,
        "active": 0.05,
    },
    "mentors": {
        "expertise": 0.35,
        "industry": 0.25,
        "interests": 0.20,
        "experience": 0.10,
        "skills": 0.10,
    },
    "students": {
        "skills": 0.40,
        "domain": 0.25,
        "experience": 0.20,
        "interests": 0.10,
        "internship": 0.05,
    },
}

FOUNDER_COLUMNS = [
    "company_features",
    "domain_features",
    "competitor_features",
    "ecosystem_features",
]

TARGET_FIELDS = {
    "investors": {
        "domain": ["primary_domain", "secondary_domain_features"],
        "stage": ["investment_stages"],
        "thesis": ["thesis_features", "bio_features"],
        "tags": ["tag_features", "investment_history"],
    },
    "mentors": {
        "expertise": ["expertise", "skills"],
        "industry": ["industry", "domain"],
        "interests": ["interests"],
        "experience": ["experience_years"],
        "skills": ["skills"],
    },
    "students": {
        "skills": ["skills"],
        "domain": ["branch", "internship_domain", "placement_domain"],
        "experience": ["internship_done", "internship_domain", "placement_domain"],
        "interests": ["clubs", "alumni_path"],
        "internship": ["internship_done"],
    },
}

ALIASES = {
    "ai": {"artificial", "intelligence", "machine", "learning"},
    "artificial intelligence": {"ai", "machine learning"},
    "saas": {"software", "service", "services"},
    "fintech": {"finance", "financial", "payments"},
    "edtech": {"education", "learning"},
    "healthtech": {"health", "healthcare", "medical"},
    "agritech": {"agriculture", "farming"},
    "ecommerce": {"retail", "commerce", "shopping"},
    "iot": {"internet", "things", "embedded"},
    "web": {"website", "frontend", "backend", "development"},
}


def clean(value):
    if value is None:
        return ""

    if isinstance(value, float) and pd.isna(value):
        return ""

    return str(value).strip().lower()


def tokens(value):
    text = clean(value)
    text = re.sub(r"[^a-z0-9+#. ]+", " ", text)

    result = set(text.split())

    # Add common domain synonyms without replacing the original terms.
    for token in list(result):
        result.update(ALIASES.get(token, set()))

    return result


def field_text(row, columns):
    parts = []

    for column in columns:
        if column in row.index:
            value = clean(row[column])
            if value:
                parts.append(value)

    return " ".join(parts)


def overlap_score(source_text, target_text):
    """
    Combines coverage of source concepts with Jaccard overlap.
    Returns a value between 0 and 1.
    """
    source_tokens = tokens(source_text)
    target_tokens = tokens(target_text)

    if not source_tokens or not target_tokens:
        return 0.0

    common = len(source_tokens & target_tokens)
    coverage = common / max(len(source_tokens), 1)
    jaccard = common / max(len(source_tokens | target_tokens), 1)

    return (0.65 * coverage) + (0.35 * jaccard)


def text_similarity(source_text, target_texts):
    """
    TF-IDF cosine similarity across one source and all candidates.
    """
    documents = [clean(source_text)] + [
        clean(text) for text in target_texts
    ]

    if not any(documents):
        return [0.0] * len(target_texts)

    try:
        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True,
        )

        matrix = vectorizer.fit_transform(documents)
        scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

        return [float(score) for score in scores]
    except ValueError:
        return [0.0] * len(target_texts)


def founder_source_text(founder):
    return " ".join(
        clean(founder.get(column, ""))
        for column in FOUNDER_COLUMNS
    )


def rank_founder_candidates(founder_id, target_role, limit=2500):
    """
    Rank investors, mentors, or students for a founder.

    Returns None when the founder dataset ID cannot be resolved,
    allowing the existing recommendation engine to handle the request.
    """
    if target_role not in DATASETS:
        return None

    founder_path = RESULTS / "founder_features.csv"
    target_path = RESULTS / DATASETS[target_role]

    if not founder_path.exists() or not target_path.exists():
        return None

    founders = pd.read_csv(founder_path).fillna("")
    candidates = pd.read_csv(target_path).fillna("")

    if "id" not in founders.columns or "id" not in candidates.columns:
        return None

    matching_founder = founders[
        founders["id"].astype(str).str.strip()
        == str(founder_id).strip()
    ]

    if matching_founder.empty or candidates.empty:
        return None

    founder = matching_founder.iloc[0]
    source_text = founder_source_text(founder)

    if not source_text.strip():
        return None

    weights = WEIGHTS[target_role]
    target_field_map = TARGET_FIELDS[target_role]

    # Calculate the overall TF-IDF similarity once.
    all_target_texts = [
        field_text(row, list(row.index))
        for _, row in candidates.iterrows()
    ]
    cosine_scores = text_similarity(source_text, all_target_texts)

    # Founder profile fields used for more precise matching.
    founder_domain = field_text(
        founder,
        ["domain_features", "ecosystem_features"]
    )
    founder_company = field_text(
        founder,
        ["company_features", "competitor_features"]
    )
    founder_stage = field_text(founder, ["funding_stage"])

    ranked = []

    for index, (_, candidate) in enumerate(candidates.iterrows()):
        field_scores = {}

        for feature, columns in target_field_map.items():
            candidate_text = field_text(candidate, columns)

            if feature == "domain":
                comparison_text = founder_domain or source_text
            elif feature == "stage":
                comparison_text = founder_stage
            elif feature in {"thesis", "expertise", "skills"}:
                comparison_text = (
                    f"{founder_company} {founder_domain}"
                    if feature != "thesis"
                    else f"{founder_company} {founder_domain}"
                )
            elif feature == "industry":
                comparison_text = founder_domain
            elif feature == "experience":
                comparison_text = f"{founder_company} {founder_domain}"
            elif feature == "interests":
                comparison_text = f"{founder_domain} {founder_company}"
            elif feature == "internship":
                comparison_text = founder_company
            elif feature == "tags":
                comparison_text = f"{founder_company} {founder_domain}"
            else:
                comparison_text = source_text

            field_scores[feature] = overlap_score(
                comparison_text,
                candidate_text
            )

        weighted_score = sum(
            weights[feature] * field_scores.get(feature, 0.0)
            for feature in weights
        )

        # Blend structured compatibility with semantic text similarity.
        # Keep the score on a consistent 0–100 ranking scale.
        combined_score = (
            0.75 * weighted_score
            + 0.25 * cosine_scores[index]
        )

        if target_role == "investors":
            active = clean(candidate.get("active", ""))
            if active in {"false", "0", "inactive", "no"}:
                combined_score *= 0.50

        candidate_id = str(candidate.get("id", index))
        candidate_name = clean(
            candidate.get("name", "")
            or candidate.get("firm_name", "")
        )

        result = {
            key: (value.item() if hasattr(value, "item") else value)
            for key, value in candidate.to_dict().items()
        }

        result.update({
            "id": candidate_id,
            "name": candidate_name or "Profile",
            "score": round(combined_score, 4),
            "score_percentage": round(combined_score * 100, 1),
            "source_type": "dataset",
            "registered_account": False,
            "match_reasons": [
                feature
                for feature, score in sorted(
                    field_scores.items(),
                    key=lambda item: item[1],
                    reverse=True
                )
                if score >= 0.10
            ][:3],
        })

        if target_role == "investors":
            result["investor_id"] = candidate_id
            result["investor_name"] = result.get("firm_name") or candidate_name
            result["industries"] = [
                result.get("primary_domain", ""),
                result.get("secondary_domain_features", ""),
            ]
            result["stages"] = result.get("investment_stages", "")
            result["investmentThesis"] = result.get("thesis_features", "")

        elif target_role == "mentors":
            result["mentor_id"] = candidate_id
            result["mentor_name"] = candidate_name
            result["expertise"] = result.get("expertise", "")
            result["skills"] = result.get("skills", "")
            result["experienceYears"] = result.get("experience_years", "")

        elif target_role == "students":
            result["student_id"] = candidate_id
            result["student_name"] = candidate_name
            result["technicalSkills"] = result.get("skills", "")
            result["interestedDomain"] = result.get("placement_domain", "")
            result["internshipDomain"] = result.get("internship_domain", "")

        ranked.append(result)

    ranked.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    # Preserve stable ordering for equal scores and avoid duplicate IDs.
    unique = []
    seen = set()

    for item in ranked:
        key = item["id"]

        if key in seen:
            continue

        seen.add(key)
        unique.append(item)

    return {
        "success": True,
        "direction": f"founder_{target_role}",
        "method": "Role-weighted feature matching + TF-IDF cosine similarity",
        "total": len(unique),
        "recommendations": unique[:max(1, min(int(limit), 2500))],
    }