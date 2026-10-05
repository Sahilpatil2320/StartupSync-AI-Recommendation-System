import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class RecommendationEngine:

    def __init__(self, dataframe, text_column):
        self.dataframe = dataframe.reset_index(drop=True)
        self.text_column = text_column

        # TF-IDF model
        self.vectorizer = TfidfVectorizer(
            stop_words="english"
        )

        self.tfidf_matrix = self.vectorizer.fit_transform(
            self.dataframe[text_column].fillna("")
        )

    def text_similarity(self, user_text):
        """
        Calculate TF-IDF cosine similarity
        between user profile and dataset profiles.
        """

        user_vector = self.vectorizer.transform(
            [user_text]
        )

        scores = cosine_similarity(
            user_vector,
            self.tfidf_matrix
        )[0]

        return scores

    @staticmethod
    def field_similarity(user_value, dataset_value):
        """
        Calculate similarity between two fields
        using common words/tokens.
        """

        if pd.isna(user_value):
            return 0.0

        if pd.isna(dataset_value):
            return 0.0

        user_text = str(user_value).lower().strip()
        dataset_text = str(dataset_value).lower().strip()

        if not user_text or not dataset_text:
            return 0.0

        user_words = set(user_text.replace(",", " ").split())
        dataset_words = set(
            dataset_text.replace(",", " ").split()
        )

        if not user_words or not dataset_words:
            return 0.0

        common_words = user_words.intersection(dataset_words)

        # Jaccard-style similarity
        similarity = (
            len(common_words) /
            len(user_words.union(dataset_words))
        )

        return similarity

    def weighted_recommend(
        self,
        user_profile,
        field_weights,
        top_n=5
    ):
        """
        Generate recommendations using:
        1. TF-IDF similarity
        2. Field-level weighted similarity
        """

        # TF-IDF similarity
        text_score = self.text_similarity(
            user_profile["match_text"]
        )

        final_scores = []

        for index, row in self.dataframe.iterrows():

            weighted_score = 0.0
            total_weight = 0.0

            # Calculate field-level scores
            for field, weight in field_weights.items():

                user_value = user_profile.get(
                    field,
                    ""
                )

                dataset_value = row.get(
                    field,
                    ""
                )

                score = self.field_similarity(
                    user_value,
                    dataset_value
                )

                weighted_score += score * weight
                total_weight += weight

            # Normalize weighted field score
            if total_weight > 0:
                weighted_score /= total_weight

            # Combine TF-IDF and field matching
            final_score = (
                (text_score[index] * 0.40) +
                (weighted_score * 0.60)
            )

            final_scores.append(final_score)

        # Add scores to dataframe
        recommendations = self.dataframe.copy()

        recommendations["similarity_score"] = final_scores

        # Convert to percentage
        recommendations["compatibility_score"] = (
            recommendations["similarity_score"] * 100
        )

        # Sort highest score first
        recommendations = recommendations.sort_values(
            by="similarity_score",
            ascending=False
        )

        return recommendations.head(top_n)