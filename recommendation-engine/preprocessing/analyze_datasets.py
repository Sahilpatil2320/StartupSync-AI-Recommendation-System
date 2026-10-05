import pandas as pd
from pathlib import Path


# ============================================================
# StartupSync - Dataset Analysis
# ============================================================

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATASET_DIR = PROJECT_ROOT / "separate_datasets"


# Dataset files
DATASETS = {
    "Founder Dataset": DATASET_DIR / "founders_data.xlsx",
    "Investor Dataset": DATASET_DIR / "investors_data.xlsx",
    "Mentor Dataset": DATASET_DIR / "mentors.csv",
    "Student Dataset": DATASET_DIR / "students.csv",
    "Startup Dataset": DATASET_DIR / "StartupSync_650_Startup_Dataset.xlsx"
}


def load_dataset(file_path):
    """Load CSV or Excel dataset."""

    if file_path.suffix.lower() == ".csv":
        return pd.read_csv(file_path)

    elif file_path.suffix.lower() in [".xlsx", ".xls"]:
        return pd.read_excel(file_path)

    else:
        raise ValueError(f"Unsupported file type: {file_path}")


def analyze_dataset(name, file_path):
    """Analyze one dataset."""

    print("\n" + "=" * 70)
    print(name)
    print("=" * 70)

    print(f"File: {file_path.name}")

    # Check file
    if not file_path.exists():
        print("ERROR: File not found.")
        return

    # Load data
    df = load_dataset(file_path)

    # Basic information
    print(f"\nRows    : {df.shape[0]}")
    print(f"Columns : {df.shape[1]}")

    # Column names
    print("\n--- Columns ---")

    for column in df.columns:
        print(f"- {column}")

    # Data types
    print("\n--- Data Types ---")
    print(df.dtypes.to_string())

    # Missing values
    print("\n--- Missing Values ---")

    missing = df.isnull().sum()

    missing_found = False

    for column, count in missing.items():
        if count > 0:
            missing_found = True
            percentage = (count / len(df)) * 100
            print(f"{column}: {count} ({percentage:.2f}%)")

    if not missing_found:
        print("No missing values.")

    # Duplicate rows
    duplicate_count = df.duplicated().sum()

    print("\n--- Duplicate Rows ---")
    print(f"Duplicates: {duplicate_count}")

    # Unique values
    print("\n--- Unique Values ---")

    for column in df.columns:

        # Don't print huge unique-value lists
        unique_count = df[column].nunique(dropna=True)

        print(f"{column}: {unique_count} unique values")

    # First 5 records
    print("\n--- First 5 Records ---")
    print(df.head().to_string(index=False))


def main():

    print("\n")
    print("=" * 70)
    print("STARTUPSYNC DATASET ANALYSIS")
    print("=" * 70)

    print(f"\nDataset directory:")
    print(DATASET_DIR)

    for name, file_path in DATASETS.items():
        analyze_dataset(name, file_path)

    print("\n" + "=" * 70)
    print("DATASET ANALYSIS COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()