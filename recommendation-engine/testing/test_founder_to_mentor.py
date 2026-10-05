import sys
import os

sys.path.append(
    os.path.dirname(os.path.abspath(__file__))
)

from founder_to_mentor import FounderMentorEngine


def main():

    print("=" * 70)
    print("MULTI-FOUNDER → MENTOR TEST")
    print("=" * 70)

    engine = FounderMentorEngine()

    # Test first 5 founders
    founders = engine.founders.head(5)

    for test_number, (_, founder) in enumerate(
        founders.iterrows(),
        1
    ):

        founder_id = founder["id"]

        print("\n" + "=" * 70)
        print(f"TEST {test_number}")
        print("=" * 70)

        print(
            f"Founder : {founder['name']}"
        )

        print(
            f"Company : {founder['company']}"
        )

        print(
            f"ID      : {founder_id}"
        )

        print(
            f"Stage   : {founder['funding_stage']}"
        )

        # ----------------------------------------------------
        # Get recommendations
        # ----------------------------------------------------

        recommendations, industries = (
            engine.recommend_mentors(
                founder_id=founder_id,
                top_n=5
            )
        )

        # ----------------------------------------------------
        # Predicted industries
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Top 5 mentors
        # ----------------------------------------------------

        print("\nTop 5 Mentors:")

        if not recommendations:

            print(
                "No mentor recommendations found."
            )

            continue

        for i, mentor in enumerate(
            recommendations,
            1
        ):

            print(
                f"{i}. "
                f"{mentor['mentor_name']} | "
                f"{mentor['industry']} | "
                f"Industry: "
                f"{mentor['industry_score']:.2f}% | "
                f"Overall: "
                f"{mentor['score_percentage']:.2f}%"
            )


if __name__ == "__main__":
    main()