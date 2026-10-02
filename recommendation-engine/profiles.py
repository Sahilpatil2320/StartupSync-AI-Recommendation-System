import pandas as pd
from pathlib import Path


# ============================================================
# StartupSync - Profile Standardization
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATASET_DIR = PROJECT_ROOT / "separate_datasets"


def clean_text(value):
    """Convert a value to clean text."""

    if pd.isna(value):
        return ""

    return str(value).strip()


def load_datasets():
    """Load all StartupSync datasets."""

    founders = pd.read_excel(
        DATASET_DIR / "founders_data.xlsx"
    )

    investors = pd.read_excel(
        DATASET_DIR / "investors_data.xlsx"
    )

    mentors = pd.read_csv(
        DATASET_DIR / "mentors.csv"
    )

    students = pd.read_csv(
        DATASET_DIR / "students.csv"
    )

    startups = pd.read_excel(
        DATASET_DIR / "StartupSync_650_Startup_Dataset.xlsx"
    )

    return founders, investors, mentors, students, startups


def create_founder_profiles(df):
    """Create standardized founder profiles."""

    profiles = []

    for _, row in df.iterrows():

        profile = {
            "id": clean_text(row["id"]),
            "name": clean_text(row["name"]),
            "company": clean_text(row["company"]),
            "domain": clean_text(row["domain"]),
            "funding_year": row["past_funding_year"],
            "funding_round": clean_text(row["past_funding_round"]),
            "funding_amount": clean_text(row["past_funding_amount"]),
            "valuation": row["valuation"],
            "competitors": clean_text(row["competitors"]),
            "umbrella_companies": clean_text(
                row["umbrella_companies"]
            )
        }

        profiles.append(profile)

    return profiles


def create_investor_profiles(df):
    """Create standardized investor profiles."""

    profiles = []

    for _, row in df.iterrows():

        profile = {
            "id": clean_text(row["id"]),
            "name": clean_text(row["name"]),
            "investor_type": clean_text(row["investor_type"]),
            "firm_name": clean_text(row["firm_name"]),
            "location": clean_text(row["location"]),
            "domains": clean_text(
                row["primary_domain"]
            ) + " " +
            clean_text(row["secondary_domains"]),
            "investment_stages": clean_text(
                row["investment_stage_pref"]
            ),
            "past_investments": clean_text(
                row["past_investments"]
            ),
            "notable_investments": clean_text(
                row["notable_investments"]
            ),
            "active": row["is_active_investing"],
            "bio": clean_text(row["short_bio"]),
            "investment_thesis": clean_text(
                row["investment_thesis"]
            ),
            "tags": clean_text(row["tags"])
        }

        profiles.append(profile)

    return profiles


def create_mentor_profiles(df):
    """Create standardized mentor profiles."""

    profiles = []

    for _, row in df.iterrows():

        profile = {
            "id": clean_text(row["mentor_id"]),
            "name": clean_text(row["mentor_name"]),
            "expertise": clean_text(row["expertise"]),
            "skills": clean_text(row["skills"]),
            "industry": clean_text(row["industry"]),
            "domain": clean_text(row["domain"]),
            "experience_years": row["experience_years"],
            "location": clean_text(row["location"]),
            "interests": clean_text(row["interests"])
        }

        profiles.append(profile)

    return profiles


def create_student_profiles(df):
    """Create standardized student profiles."""

    profiles = []

    for _, row in df.iterrows():

        profile = {
            "id": clean_text(row["Student ID"]),
            "name": clean_text(row["Name"]),
            "branch": clean_text(row["Branch"]),
            "gpa": row["Average GPA"],
            "skills": clean_text(row["Skills"]),
            "clubs": clean_text(row["Clubs"]),
            "internship_done": clean_text(
                row["Internship Done"]
            ),
            "internship_domain": clean_text(
                row["Internship Domain"]
            ),
            "placement_domain": clean_text(
                row["Placement Domain"]
            ),
            "alumni_path": clean_text(
                row["Alumni Path"]
            )
        }

        profiles.append(profile)

    return profiles


def create_startup_profiles(df):
    """Create standardized startup profiles."""

    profiles = []

    for _, row in df.iterrows():

        profile = {
            "id": clean_text(row["startup_id"]),
            "name": clean_text(row["startup_name"]),
            "industry": clean_text(
                row["industry_category"]
            ),
            "location": clean_text(row["location"]),
            "funding_stage": clean_text(
                row["funding_stage"]
            ),
            "funding_amount": row["funding_amount_usd"],
            "investors": clean_text(row["investors"]),
            "required_skills": clean_text(
                row["required_skills"]
            ),
            "recommended_roles": clean_text(
                row["recommended_roles"]
            ),
            "tags": clean_text(
                row["recommendation_tags"]
            )
        }

        profiles.append(profile)

    return profiles


def main():

    print("=" * 70)
    print("STARTUPSYNC PROFILE STANDARDIZATION")
    print("=" * 70)

    # Load datasets
    founders, investors, mentors, students, startups = load_datasets()

    # Create standardized profiles
    founder_profiles = create_founder_profiles(founders)
    investor_profiles = create_investor_profiles(investors)
    mentor_profiles = create_mentor_profiles(mentors)
    student_profiles = create_student_profiles(students)
    startup_profiles = create_startup_profiles(startups)

    # Display counts
    print("\nProfile counts:")
    print(f"Founders : {len(founder_profiles)}")
    print(f"Investors: {len(investor_profiles)}")
    print(f"Mentors  : {len(mentor_profiles)}")
    print(f"Students : {len(student_profiles)}")
    print(f"Startups : {len(startup_profiles)}")

    # Display one example from each
    print("\n" + "=" * 70)
    print("SAMPLE PROFILES")
    print("=" * 70)

    print("\nFounder:")
    print(founder_profiles[0])

    print("\nInvestor:")
    print(investor_profiles[0])

    print("\nMentor:")
    print(mentor_profiles[0])

    print("\nStudent:")
    print(student_profiles[0])

    print("\nStartup:")
    print(startup_profiles[0])

    print("\n" + "=" * 70)
    print("PROFILE STANDARDIZATION COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()