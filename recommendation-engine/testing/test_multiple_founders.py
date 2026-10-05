import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from founder_to_investor import FounderInvestorEngine


def main():

    print("=" * 70)
    print("MULTI-FOUNDER → INVESTOR TEST")
    print("=" * 70)

    engine = FounderInvestorEngine()

    # Test first 5 founders
    founders = engine.founders.head(5)

    for test_number, (_, founder) in enumerate(
        founders.iterrows(), 1
    ):

        founder_id = founder["id"]

        print("\n" + "=" * 70)
        print(f"TEST {test_number}")
        print("=" * 70)

        print(f"Founder : {founder['name']}")
        print(f"Company : {founder['company']}")
        print(f"ID      : {founder_id}")
        print(f"Stage   : {founder['funding_stage']}")

        # ---------------------------------------------------------
        # Get recommendations
        # ---------------------------------------------------------

        recommendations, industries = (
            engine.recommend_investors(
                founder_id=founder_id,
                top_n=5
            )
        )

        # ---------------------------------------------------------
        # Predicted industries
        # ---------------------------------------------------------

        print("\nPredicted Industries:")

        if not industries:
            print("No industry prediction found.")
        else:
            for i, industry in enumerate(
                industries, 1
            ):

                print(
                    f"{i}. "
                    f"{industry['industry']} "
                    f"({industry['confidence']:.2%})"
                )

        # ---------------------------------------------------------
        # Top 5 investors
        # ---------------------------------------------------------

        print("\nTop 5 Investors:")

        if not recommendations:
            print("No recommendations found.")
            continue

        for i, rec in enumerate(
            recommendations, 1
        ):

            print(
                f"{i}. "
                f"{rec['investor_name']} | "
                f"{rec['firm_name']} | "
                f"Stage: {rec['funding_stage']} | "
                f"Industry: {rec['industry_score']:.2%} | "
                f"Overall: {rec['score_percentage']:.2f}%"
            )


if __name__ == "__main__":
    main()