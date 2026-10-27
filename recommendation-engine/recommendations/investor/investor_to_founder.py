import os
import re
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RESULTS_DIR = os.path.join(BASE_DIR, "results")
INVESTOR_FILE = os.path.join(RESULTS_DIR, "investor_features.csv")
STARTUP_FILE = os.path.join(RESULTS_DIR, "processed_startups.csv")


def clean_text(value):
    if pd.isna(value):
        return ""
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+#./\-\s]", " ", str(value).lower())).strip()


def tokens(value):
    return set(clean_text(value).replace("/", " ").replace("-", "_").split())


class InvestorFounderEngine:
    """
    Investor-to-startup recommendation engine.

    The target candidates come from processed_startups.csv (650 records),
    not founder_features.csv (500 company/founder records). Existing API
    naming is retained for backwards compatibility.
    """

    def __init__(self):
        if not os.path.exists(INVESTOR_FILE):
            raise FileNotFoundError(f"Missing investor features: {INVESTOR_FILE}")
        if not os.path.exists(STARTUP_FILE):
            raise FileNotFoundError(f"Missing startup dataset: {STARTUP_FILE}")

        self.investors = pd.read_csv(INVESTOR_FILE).fillna("")
        self.startups = pd.read_csv(STARTUP_FILE).fillna("")

        investor_texts = self.investors.apply(
            lambda row: " ".join(
                str(row.get(col, "")) for col in [
                    "primary_domain", "secondary_domain_features",
                    "tag_features", "investment_history", "thesis_features",
                    "bio_features", "location", "investment_stages"
                ]
            ), axis=1
        ).map(clean_text).tolist()

        startup_texts = self.startups.apply(
            lambda row: " ".join(
                str(row.get(col, "")) for col in [
                    "name", "industry", "location", "funding_stage",
                    "investors", "required_skills", "recommended_roles", "tags"
                ]
            ), axis=1
        ).map(clean_text).tolist()

        vectorizer = TfidfVectorizer(
            stop_words="english", ngram_range=(1, 2), min_df=1,
            sublinear_tf=True
        )
        matrix = vectorizer.fit_transform(investor_texts + startup_texts)
        self.text_similarity = cosine_similarity(
            matrix[:len(investor_texts)],
            matrix[len(investor_texts):]
        )

    def _stage_score(self, investor, startup):
        investor_stages = tokens(investor.get("investment_stages", ""))
        stage = clean_text(startup.get("funding_stage", "")).replace("-", "_")
        if not stage or stage in {"unknown", "nan"} or not investor_stages:
            return 0.0
        if stage in investor_stages:
            return 1.0
        aliases = {
            "pre_seed": {"preseed", "pre_seed", "seed"},
            "seed": {"pre_seed", "seed", "series_a"},
            "series_a": {"seed", "series_a", "series_b"},
            "series_b": {"series_a", "series_b", "series_c"},
            "series_c": {"series_b", "series_c"},
        }
        return 0.5 if investor_stages.intersection(aliases.get(stage, set())) else 0.0

    def _industry_score(self, investor, startup):
        investor_terms = tokens(" ".join(str(investor.get(col, "")) for col in [
            "primary_domain", "secondary_domain_features", "tag_features",
            "thesis_features", "bio_features"
        ]))
        startup_terms = tokens(" ".join(str(startup.get(col, "")) for col in [
            "industry", "tags", "required_skills", "recommended_roles"
        ]))
        if not investor_terms or not startup_terms:
            return 0.0
        return len(investor_terms & startup_terms) / max(1, len(startup_terms))

    def recommend_founders(self, investor_id, top_n=5):
        matches = self.investors[
            self.investors["id"].astype(str).str.strip().str.lower()
            == str(investor_id).strip().lower()
        ]
        if matches.empty:
            return []

        investor_index = int(matches.index[0])
        investor = matches.iloc[0]
        active_value = clean_text(investor.get("active", ""))
        active_score = 1.0 if active_value in {"true", "yes", "1", "active"} else (
            0.0 if active_value in {"false", "no", "0", "inactive"} else 0.5
        )

        recommendations = []
        for startup_index, startup in self.startups.iterrows():
            stage_score = self._stage_score(investor, startup)
            industry_score = self._industry_score(investor, startup)
            text_score = float(self.text_similarity[investor_index, startup_index])
            investor_location = tokens(investor.get("location", ""))
            startup_location = tokens(startup.get("location", ""))
            location_score = (
                len(investor_location & startup_location) / max(1, len(startup_location))
                if investor_location and startup_location else 0.0
            )

            final_score = (
                industry_score * 0.30 +
                stage_score * 0.25 +
                text_score * 0.35 +
                location_score * 0.05 +
                active_score * 0.05
            )
            startup_id = str(startup.get("id", ""))
            startup_name = str(startup.get("name", "Startup"))
            recommendations.append({
                "id": startup_id,
                "startup_id": startup_id,
                "founder_id": startup_id,
                "dataset_id": startup_id,
                "name": startup_name,
                "startup_name": startup_name,
                "founder_name": startup_name,
                "company": startup_name,
                "industry": str(startup.get("industry", "")),
                "location": str(startup.get("location", "")),
                "funding_stage": str(startup.get("funding_stage", "")),
                "funding_amount": startup.get("funding_amount", None),
                "investors": str(startup.get("investors", "")),
                "required_skills": str(startup.get("required_skills", "")),
                "recommended_roles": str(startup.get("recommended_roles", "")),
                "tags": str(startup.get("tags", "")),
                "industry_score": round(industry_score * 100, 2),
                "stage_score": round(stage_score * 100, 2),
                "general_score": round(text_score * 100, 2),
                "location_score": round(location_score * 100, 2),
                "score": round(float(final_score), 4),
                "score_percentage": round(float(final_score) * 100, 2),
                "source_type": "startup_dataset"
            })

        recommendations.sort(key=lambda item: item["score"], reverse=True)
        try:
            limit = max(1, min(int(top_n), len(recommendations)))
        except (TypeError, ValueError):
            limit = 5
        return recommendations[:limit]

    def display_recommendations(self, investor_id, top_n=5):
        recommendations = self.recommend_founders(investor_id, top_n)
        for index, item in enumerate(recommendations, 1):
            print(f"{index}. {item['startup_name']} — {item['score_percentage']}%")
