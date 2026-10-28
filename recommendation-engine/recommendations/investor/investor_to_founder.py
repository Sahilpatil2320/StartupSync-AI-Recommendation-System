import os
import re
import threading

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
    )
)

RESULTS_DIR = os.path.join(BASE_DIR, "results")
INVESTOR_FILE = os.path.join(RESULTS_DIR, "investor_features.csv")
STARTUP_FILE = os.path.join(RESULTS_DIR, "processed_startups.csv")


# Compatibility weights. Available features are renormalized automatically.
FEATURE_WEIGHTS = {
    "industry": 0.40,
    "stage": 0.25,
    "funding": 0.15,
    "location": 0.05,
    "text": 0.15,
}


def clean_text(value):
    """Normalize strings and safely handle missing or collection values."""
    if value is None:
        return ""

    if isinstance(value, (list, tuple, set)):
        value = " ".join(str(item) for item in value if item is not None)
    elif isinstance(value, dict):
        value = " ".join(
            str(item) for item in value.values() if item is not None
        )
    else:
        try:
            if pd.isna(value):
                return ""
        except (TypeError, ValueError):
            pass

    value = str(value).lower()
    value = re.sub(r"[^a-z0-9+#./&\-\s]", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def tokens(value):
    """Return normalized tokens for compatibility comparisons."""
    text = clean_text(value)
    text = text.replace("/", " ").replace("-", " ")
    return set(re.findall(r"[a-z0-9+#]+", text))


def _as_text(value):
    if value is None:
        return ""

    if isinstance(value, (list, tuple, set)):
        return " ".join(
            str(item) for item in value if item is not None
        )

    if isinstance(value, dict):
        return " ".join(
            str(item) for item in value.values() if item is not None
        )

    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass

    return str(value)


def _number(value):
    """Parse a non-negative numeric amount, returning None if unavailable."""
    if value is None or value == "":
        return None

    try:
        result = float(
            str(value)
            .replace(",", "")
            .replace("₹", "")
            .replace("$", "")
            .strip()
        )

        if np.isfinite(result) and result >= 0:
            return result

    except (TypeError, ValueError):
        pass

    return None


def _first_number(data, keys):
    """Read the first valid amount from a collection of possible field names."""
    for key in keys:
        if key in data:
            value = _number(data.get(key))
            if value is not None:
                return value

    return None


def _split_values(value):
    """Split comma-separated or collection-based profile preferences."""
    if isinstance(value, (list, tuple, set)):
        raw_values = list(value)
    else:
        raw_values = re.split(r"[,;|\n]+", _as_text(value))

    return [
        clean_text(item)
        for item in raw_values
        if clean_text(item)
    ]


def _stage(value):
    """Normalize common funding-stage names."""
    value = clean_text(value).replace("-", "_").replace(" ", "_")

    aliases = {
        "idea": "pre_seed",
        "prototype": "pre_seed",
        "preseed": "pre_seed",
        "pre_seed_stage": "pre_seed",
        "angel": "pre_seed",
        "mvp": "seed",
        "early_stage": "seed",
        "early_growth": "series_a",
        "venture": "series_a",
        "growth_stage": "growth",
        "series_a": "series_a",
        "series_b": "series_b",
        "series_c": "series_c",
        "series_d": "series_d",
    }

    return aliases.get(value, value)


def _stage_compatibility(preferred_stages, startup_stage):
    """Score exact and adjacent funding-stage compatibility."""
    stages = {
        _stage(item)
        for item in _split_values(preferred_stages)
        if item
    }

    target = _stage(startup_stage)

    if (
        not stages
        or not target
        or target in {"unknown", "nan", "none"}
    ):
        return None

    if target in stages:
        return 1.0

    adjacent = {
        "pre_seed": {"seed"},
        "seed": {"pre_seed", "series_a"},
        "series_a": {"seed", "series_b"},
        "series_b": {"series_a", "series_c"},
        "series_c": {"series_b", "series_d"},
        "series_d": {"series_c"},
        "growth": {"series_b", "series_c", "series_d"},
    }

    if stages.intersection(adjacent.get(target, set())):
        return 0.65

    return 0.0


def _preference_match(preferences, candidate_text):
    """
    Compare profile preferences with candidate attributes.

    Exact phrase matches score higher than partial token overlap.
    Returns None if the comparison cannot be made.
    """
    phrases = _split_values(preferences)
    candidate = clean_text(candidate_text)

    if not phrases or not candidate:
        return None

    candidate_tokens = tokens(candidate)

    if not candidate_tokens:
        return None

    phrase_scores = []

    for phrase in phrases:
        phrase_tokens = tokens(phrase)

        if not phrase_tokens:
            continue

        if phrase == candidate or phrase in candidate:
            score = 1.0
        else:
            overlap = len(phrase_tokens & candidate_tokens)
            precision = overlap / len(phrase_tokens)
            recall = overlap / max(1, len(candidate_tokens))

            if precision + recall:
                score = (
                    2 * precision * recall
                    / (precision + recall)
                )
            else:
                score = 0.0

        phrase_scores.append(score)

    if not phrase_scores:
        return None

    return float(np.mean(phrase_scores))


def _text_overlap(investor_text, startup_text):
    """
    Calculate lexical overlap as an additional text relevance signal.

    This is not an accuracy metric or a probability.
    """
    investor_tokens = tokens(investor_text)
    startup_tokens = tokens(startup_text)

    if not investor_tokens or not startup_tokens:
        return None

    shared = investor_tokens & startup_tokens

    # Dice similarity reduces the penalty from differences in text length.
    return (2.0 * len(shared)) / (
        len(investor_tokens) + len(startup_tokens)
    )


def _combine_text_scores(cosine_score, overlap_score):
    """Combine text relevance signals without treating cosine as accuracy."""
    available = []

    if cosine_score is not None and np.isfinite(cosine_score):
        available.append((float(np.clip(cosine_score, 0.0, 1.0)), 0.60))

    if overlap_score is not None and np.isfinite(overlap_score):
        available.append((float(np.clip(overlap_score, 0.0, 1.0)), 0.40))

    if not available:
        return None

    weight_sum = sum(weight for _, weight in available)

    return sum(score * weight for score, weight in available) / weight_sum


class InvestorFounderEngine:
    """
    Investor-to-startup recommendation engine.

    The returned percentage represents weighted compatibility.
    It is not a probability of investment or recommendation accuracy.
    """

    _cache_lock = threading.Lock()
    _shared = None

    def __init__(self):
        if self.__class__._shared is None:
            with self.__class__._cache_lock:
                if self.__class__._shared is None:
                    self.__class__._shared = self._load_shared_data()

        shared = self.__class__._shared

        self.investors = shared["investors"]
        self.startups = shared["startups"]
        self.vectorizer = shared["vectorizer"]
        self.investor_matrix = shared["investor_matrix"]
        self.startup_matrix = shared["startup_matrix"]
        self.text_similarity = shared["text_similarity"]
        self.startup_texts = shared["startup_texts"]

    @staticmethod
    def _load_shared_data():
        if not os.path.exists(INVESTOR_FILE):
            raise FileNotFoundError(
                f"Missing investor features: {INVESTOR_FILE}"
            )

        if not os.path.exists(STARTUP_FILE):
            raise FileNotFoundError(
                f"Missing startup dataset: {STARTUP_FILE}"
            )

        investors = pd.read_csv(INVESTOR_FILE).fillna("")
        startups = pd.read_csv(STARTUP_FILE).fillna("")

        investor_columns = [
            "primary_domain",
            "secondary_domain_features",
            "tag_features",
            "investment_history",
            "thesis_features",
            "bio_features",
            "location",
            "investment_stages",
        ]

        startup_columns = [
            "name",
            "industry",
            "location",
            "funding_stage",
            "investors",
            "required_skills",
            "recommended_roles",
            "tags",
        ]

        investor_texts = investors.apply(
            lambda row: " ".join(
                _as_text(row.get(column, ""))
                for column in investor_columns
            ),
            axis=1,
        ).map(clean_text).tolist()

        startup_texts = startups.apply(
            lambda row: " ".join(
                _as_text(row.get(column, ""))
                for column in startup_columns
            ),
            axis=1,
        ).map(clean_text).tolist()

        # Fit once per process rather than on every API request.
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True,
        )

        matrix = vectorizer.fit_transform(
            investor_texts + startup_texts
        )

        investor_matrix = matrix[:len(investor_texts)]
        startup_matrix = matrix[len(investor_texts):]

        text_similarity = cosine_similarity(
            investor_matrix,
            startup_matrix,
        )

        return {
            "investors": investors,
            "startups": startups,
            "vectorizer": vectorizer,
            "investor_matrix": investor_matrix,
            "startup_matrix": startup_matrix,
            "text_similarity": text_similarity,
            "startup_texts": startup_texts,
        }

    def _stage_score(self, investor, startup):
        return _stage_compatibility(
            investor.get("investment_stages", ""),
            startup.get("funding_stage", ""),
        )

    def _dataset_investor_industry_score(self, investor, startup):
        preferences = " ".join(
            _as_text(investor.get(column, ""))
            for column in [
                "primary_domain",
                "secondary_domain_features",
                "tag_features",
                "thesis_features",
            ]
        )

        candidate = " ".join(
            _as_text(startup.get(column, ""))
            for column in ["industry", "tags"]
        )

        return _preference_match(preferences, candidate)

    def _dataset_funding_score(self, investor, startup):
        """
        Use funding compatibility only when the CSV contains relevant fields.

        Recognized investor fields include:
        minimumInvestment, maximumInvestment, min_investment,
        max_investment, investment_min, and investment_max.
        """
        minimum = _first_number(
            investor,
            [
                "minimumInvestment",
                "min_investment",
                "investment_min",
                "minimum_investment",
            ],
        )

        maximum = _first_number(
            investor,
            [
                "maximumInvestment",
                "max_investment",
                "investment_max",
                "maximum_investment",
            ],
        )

        amount = _first_number(
            startup,
            [
                "funding_amount",
                "funding_required",
                "funding_requirement",
                "required_funding",
            ],
        )

        if amount is None or (minimum is None and maximum is None):
            return None

        if minimum is not None and amount < minimum:
            return float(np.clip(amount / max(minimum, 1.0), 0.0, 1.0))

        if maximum is not None and amount > maximum:
            return float(np.clip(maximum / max(amount, 1.0), 0.0, 1.0))

        return 1.0

    def _dataset_location_score(self, investor, startup):
        investor_location = investor.get("location", "")
        startup_location = startup.get("location", "")

        if not clean_text(investor_location) or not clean_text(startup_location):
            return None

        return _preference_match(investor_location, startup_location)

    def _custom_industry_score(self, profile, startup):
        preferences = []

        for key in [
            "investmentIndustries",
            "investmentDomains",
            "investmentTags",
            "investmentFocus",
        ]:
            preferences.extend(_split_values(profile.get(key, [])))

        candidate = " ".join(
            _as_text(startup.get(key, ""))
            for key in ["industry", "tags"]
        )

        return _preference_match(preferences, candidate)

    def _custom_stage_score(self, profile, startup):
        stages = profile.get(
            "preferredStartupStages",
            profile.get("investment_stages", []),
        )

        return _stage_compatibility(
            stages,
            startup.get("funding_stage", ""),
        )

    def _custom_funding_score(self, profile, startup):
        minimum = _first_number(
            profile,
            ["minimumInvestment", "min_investment", "investment_min"],
        )

        maximum = _first_number(
            profile,
            ["maximumInvestment", "max_investment", "investment_max"],
        )

        amount = _first_number(
            startup,
            [
                "funding_amount",
                "funding_required",
                "funding_requirement",
                "required_funding",
            ],
        )

        if amount is None or (minimum is None and maximum is None):
            return None

        if minimum is not None and amount < minimum:
            return float(np.clip(amount / max(minimum, 1.0), 0.0, 1.0))

        if maximum is not None and amount > maximum:
            return float(np.clip(maximum / max(amount, 1.0), 0.0, 1.0))

        return 1.0

    def _custom_location_score(self, profile, startup):
        preferences = profile.get("preferredGeography", [])

        if not clean_text(preferences):
            preferences = profile.get("location", "")

        candidate_location = startup.get("location", "")

        if not clean_text(preferences) or not clean_text(candidate_location):
            return None

        return _preference_match(preferences, candidate_location)

    def _custom_text_similarities(self, profile):
        source_text = " ".join(
            _as_text(profile.get(key, ""))
            for key in [
                "investmentIndustries",
                "investmentDomains",
                "preferredStartupStages",
                "preferredGeography",
                "investmentThesis",
                "investmentTags",
                "investmentFocus",
                "bio",
                "previousInvestments",
                "portfolioCompanies",
                "investorType",
                "location",
            ]
        )

        source_text = clean_text(source_text)

        if not source_text:
            return np.zeros(len(self.startups), dtype=float)

        query = self.vectorizer.transform([source_text])

        return cosine_similarity(
            query,
            self.startup_matrix,
        ).flatten()

    @staticmethod
    def _weighted_score(scores, weights=None):
        """
        Weighted compatibility score between 0 and 1.

        Missing features are excluded and the remaining weights are normalized.
        """
        weights = weights or FEATURE_WEIGHTS

        available = []

        for name, value in scores.items():
            if value is None:
                continue

            try:
                value = float(value)
            except (TypeError, ValueError):
                continue

            if not np.isfinite(value):
                continue

            weight = weights.get(name, 0.0)

            if weight > 0:
                available.append((
                    float(np.clip(value, 0.0, 1.0)),
                    weight,
                ))

        if not available:
            return 0.0

        total_weight = sum(weight for _, weight in available)

        if total_weight <= 0:
            return 0.0

        return sum(
            score * weight
            for score, weight in available
        ) / total_weight

    def _build_result(self, startup, scores, final_score):
        startup_id = str(startup.get("id", ""))
        startup_name = str(startup.get("name", "Startup"))

        return {
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

            "industry_score": round(
                (scores.get("industry") or 0) * 100, 2
            ),
            "stage_score": round(
                (scores.get("stage") or 0) * 100, 2
            ),
            "funding_score": round(
                (scores.get("funding") or 0) * 100, 2
            ),
            "location_score": round(
                (scores.get("location") or 0) * 100, 2
            ),
            "general_score": round(
                (scores.get("text") or 0) * 100, 2
            ),

            "score": round(float(final_score), 4),
            "score_percentage": round(float(final_score) * 100, 2),
            "score_type": "weighted_compatibility",
            "score_label": "Compatibility score",
            "source_type": "startup_dataset",
        }

    def recommend_custom_investor(self, profile, top_n=650):
        """Rank startup dataset entries for a registered investor profile."""
        profile = profile if isinstance(profile, dict) else {}

        cosine_scores = self._custom_text_similarities(profile)

        source_text = " ".join(
            _as_text(profile.get(key, ""))
            for key in [
                "investmentIndustries",
                "investmentDomains",
                "preferredStartupStages",
                "preferredGeography",
                "investmentThesis",
                "investmentTags",
                "investmentFocus",
                "bio",
                "previousInvestments",
                "portfolioCompanies",
                "investorType",
                "location",
            ]
        )

        recommendations = []

        for index, (_, startup_row) in enumerate(self.startups.iterrows()):
            startup = startup_row.to_dict()

            overlap_score = _text_overlap(
                source_text,
                self.startup_texts[index],
            )

            text_score = _combine_text_scores(
                cosine_scores[index],
                overlap_score,
            )

            scores = {
                "industry": self._custom_industry_score(profile, startup),
                "stage": self._custom_stage_score(profile, startup),
                "funding": self._custom_funding_score(profile, startup),
                "location": self._custom_location_score(profile, startup),
                "text": text_score,
            }

            final_score = self._weighted_score(scores)

            result = self._build_result(
                startup,
                scores,
                final_score,
            )

            result["registered_account"] = False
            recommendations.append(result)

        recommendations.sort(
            key=lambda item: (
                item["score"],
                item["name"].lower(),
            ),
            reverse=True,
        )

        try:
            limit = max(1, min(int(top_n), len(recommendations)))
        except (TypeError, ValueError):
            limit = 5

        return recommendations[:limit]

    def recommend_founders(self, investor_id, top_n=5):
        """Rank startup records for an investor present in the investor dataset."""
        matches = self.investors[
            self.investors["id"]
            .astype(str)
            .str.strip()
            .str.lower()
            == str(investor_id).strip().lower()
        ]

        if matches.empty:
            return []

        investor_index = self.investors.index.get_loc(matches.index[0])
        investor = matches.iloc[0]

        recommendations = []

        for startup_index, (_, startup_row) in enumerate(
            self.startups.iterrows()
        ):
            startup = startup_row.to_dict()

            industry_score = self._dataset_investor_industry_score(
                investor,
                startup,
            )

            stage_score = self._stage_score(investor, startup)

            funding_score = self._dataset_funding_score(
                investor,
                startup,
            )

            location_score = self._dataset_location_score(
                investor,
                startup,
            )

            cosine_score = float(
                self.text_similarity[investor_index, startup_index]
            )

            investor_text = " ".join(
                _as_text(investor.get(column, ""))
                for column in [
                    "primary_domain",
                    "secondary_domain_features",
                    "tag_features",
                    "investment_history",
                    "thesis_features",
                    "bio_features",
                    "location",
                    "investment_stages",
                ]
            )

            overlap_score = _text_overlap(
                investor_text,
                self.startup_texts[startup_index],
            )

            text_score = _combine_text_scores(
                cosine_score,
                overlap_score,
            )

            scores = {
                "industry": industry_score,
                "stage": stage_score,
                "funding": funding_score,
                "location": location_score,
                "text": text_score,
            }

            final_score = self._weighted_score(
                scores,
                FEATURE_WEIGHTS,
            )

            result = self._build_result(
                startup,
                scores,
                final_score,
            )

            recommendations.append(result)

        recommendations.sort(
            key=lambda item: (
                item["score"],
                item["name"].lower(),
            ),
            reverse=True,
        )

        try:
            limit = max(1, min(int(top_n), len(recommendations)))
        except (TypeError, ValueError):
            limit = 5

        return recommendations[:limit]

    def display_recommendations(self, investor_id, top_n=5):
        recommendations = self.recommend_founders(
            investor_id,
            top_n,
        )

        for index, item in enumerate(recommendations, 1):
            print(
                f"{index}. {item['startup_name']} — "
                f"{item['score_percentage']}% compatibility"
            )