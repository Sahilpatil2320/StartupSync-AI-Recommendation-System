import sys
import inspect
import importlib
import json

import numpy as np

from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)


# ============================================================
# RECOMMENDATION ENGINE PATH
# ============================================================

ENGINE_DIR = (
    Path(__file__).resolve().parent.parent
    / "recommendation-engine"
)

if str(ENGINE_DIR) not in sys.path:
    sys.path.append(str(ENGINE_DIR))


# ============================================================
# MODULE MAPPING
# ============================================================

MODULES = {
    "founder_investor":
        "recommendations.founder.founder_to_investor",

    "founder_mentor":
        "recommendations.founder.founder_to_mentor",

    "founder_student":
        "recommendations.founder.founder_to_student",

    "investor_founder":
        "recommendations.investor.investor_to_founder",

    "investor_mentor":
        "recommendations.investor.investor_to_mentor",

    "mentor_founder":
        "recommendations.mentor.mentor_to_founder",

    "mentor_investor":
        "recommendations.mentor.mentor_to_investor",

    "mentor_student":
        "recommendations.mentor.mentor_to_student",

    "student_founder":
        "recommendations.student.student_to_founder",

    "student_mentor":
        "recommendations.student.student_to_mentor",
}


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def load_engine(module_path):
    """
    Import the recommendation module and automatically
    find its recommendation engine class.
    """

    module = importlib.import_module(module_path)

    classes = []

    for _, obj in inspect.getmembers(module, inspect.isclass):
        if obj.__module__ == module.__name__:
            classes.append(obj)

    if not classes:
        raise RuntimeError(
            f"No recommendation engine class found in {module_path}"
        )

    engine_class = classes[0]

    return engine_class()


def run_recommendation(module_path, source_id, top_n=5):

    if isinstance(source_id, str):
        source_id = source_id.strip()

    # Mentor dataset uses lowercase IDs such as m001.
    # Normalize mentor IDs at the API boundary.
    if module_path in {
        "recommendations.mentor.mentor_to_founder",
        "recommendations.mentor.mentor_to_investor",
        "recommendations.mentor.mentor_to_student"
    }:
        source_id = source_id.lower()

    module = importlib.import_module(module_path)

    # --------------------------------------------------
    # Explicit engine mapping
    # --------------------------------------------------

    engine_class_map = {
        "recommendations.mentor.mentor_to_founder":
            "MentorFounderEngine",

        "recommendations.mentor.mentor_to_investor":
            "MentorInvestorEngine",
    }

    if module_path in engine_class_map:

        class_name = engine_class_map[module_path]

        engine_class = getattr(
            module,
            class_name
        )

        engine = engine_class()

        if module_path == \
                "recommendations.mentor.mentor_to_founder":

            result = engine.recommend_founders(
                mentor_id=source_id,
                top_n=top_n
            )

        elif module_path == \
                "recommendations.mentor.mentor_to_investor":

            result = engine.recommend_investors(
                mentor_id=source_id,
                top_n=top_n
            )

        return result, "explicit"

    # --------------------------------------------------
    # Generic handling for remaining engines
    # --------------------------------------------------

    classes = []

    for _, obj in inspect.getmembers(
        module,
        inspect.isclass
    ):

        if obj.__module__ == module.__name__:
            classes.append(obj)

    if not classes:
        raise RuntimeError(
            f"No recommendation engine class found in {module_path}"
        )

    engine_class = classes[0]

    engine = engine_class()

    methods = []

    for name, method in inspect.getmembers(
        engine,
        predicate=callable
    ):

        if name.startswith("recommend_"):
            methods.append(
                (name, method)
            )

    if not methods:
        raise RuntimeError(
            f"No recommend method found in {module_path}"
        )

    
    method_map = {
        "recommendations.founder.founder_to_investor":
            "recommend_investors",

        "recommendations.founder.founder_to_mentor":
            "recommend_mentors",
    }

    if module_path in method_map:
        method_name = method_map[module_path]
        method = getattr(engine, method_name)
    else:
        method_name, method = methods[0]


    signature = inspect.signature(method)

    kwargs = {}

    for parameter_name in signature.parameters:

        if parameter_name == "top_n":

            kwargs["top_n"] = top_n

        elif parameter_name in {
            "founder_id",
            "investor_id",
            "mentor_id",
            "student_id",
            "startup_id"
        }:

            kwargs[parameter_name] = source_id

    result = method(**kwargs)

    return result, method_name

def make_json_safe(value):
    """
    Convert NumPy/Pandas values into normal Python values
    that Flask can serialize to JSON.
    """

    if isinstance(value, dict):
        return {
            str(key): make_json_safe(val)
            for key, val in value.items()
        }

    if isinstance(value, list):
        return [
            make_json_safe(item)
            for item in value
        ]

    if isinstance(value, tuple):
        return [
            make_json_safe(item)
            for item in value
        ]

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        return float(value)

    if isinstance(value, np.bool_):
        return bool(value)

    if isinstance(value, np.ndarray):
        return make_json_safe(
            value.tolist()
        )

    return value


def recommendation_response(key, source_id):

    if key not in MODULES:
        return jsonify({
            "success": False,
            "message": "Invalid recommendation direction"
        }), 400

    try:

        result, method_name = run_recommendation(
            MODULES[key],
            source_id,
            top_n=5
        )

        # Some existing engines return:
        # recommendations
        #
        # Some return:
        # recommendations, extra_information

        if isinstance(result, tuple):

            recommendations = result[0]

            extra = {}

            if len(result) > 1:

                if isinstance(result[1], list):
                    extra["additional_data"] = result[1]

                elif isinstance(result[1], dict):
                    extra.update(result[1])

        else:

            recommendations = result
            extra = {}

        response_data = {
            "success": True,
            "direction": key,
            "source_id": str(source_id),
            "recommendations": recommendations,
            **extra
        }

        return jsonify(
            make_json_safe(response_data)
        )

    except Exception as error:

        print(
            f"Recommendation error [{key}]:",
            str(error)
        )

        return jsonify({
            "success": False,
            "direction": key,
            "source_id": str(source_id),
            "message": "Failed to generate recommendations",
            "error": str(error)
        }), 500


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message":
            "StartupSync AI Recommendation API is running"
    })


# ============================================================
# HEALTH
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "success": True,
        "service": "StartupSync AI Engine",
        "status": "healthy"
    })


# ============================================================
# FOUNDER
# ============================================================

@app.route(
    "/recommend/founder/investors",
    methods=["POST"]
)
def founder_to_investor():

    data = request.get_json() or {}

    founder_id = data.get("founder_id")

    if not founder_id:
        return jsonify({
            "success": False,
            "message": "founder_id is required"
        }), 400

    return recommendation_response(
        "founder_investor",
        founder_id
    )


@app.route(
    "/recommend/founder/mentors",
    methods=["POST"]
)
def founder_to_mentor():

    data = request.get_json() or {}

    founder_id = data.get("founder_id")

    if not founder_id:
        return jsonify({
            "success": False,
            "message": "founder_id is required"
        }), 400

    return recommendation_response(
        "founder_mentor",
        founder_id
    )


@app.route(
    "/recommend/founder/students",
    methods=["POST"]
)
def founder_to_student():

    data = request.get_json() or {}

    founder_id = data.get("founder_id")

    if not founder_id:
        return jsonify({
            "success": False,
            "message": "founder_id is required"
        }), 400

    return recommendation_response(
        "founder_student",
        founder_id
    )


# ============================================================
# INVESTOR
# ============================================================

@app.route(
    "/recommend/investor/founders",
    methods=["POST"]
)
def investor_to_founder():

    data = request.get_json() or {}

    investor_id = data.get("investor_id")

    if not investor_id:
        return jsonify({
            "success": False,
            "message": "investor_id is required"
        }), 400

    return recommendation_response(
        "investor_founder",
        investor_id
    )


@app.route(
    "/recommend/investor/mentors",
    methods=["POST"]
)
def investor_to_mentor():

    data = request.get_json() or {}

    investor_id = data.get("investor_id")

    if not investor_id:
        return jsonify({
            "success": False,
            "message": "investor_id is required"
        }), 400

    return recommendation_response(
        "investor_mentor",
        investor_id
    )


# ============================================================
# MENTOR
# ============================================================

@app.route(
    "/recommend/mentor/founders",
    methods=["POST"]
)
def mentor_to_founder():

    data = request.get_json() or {}

    mentor_id = data.get("mentor_id")

    if not mentor_id:
        return jsonify({
            "success": False,
            "message": "mentor_id is required"
        }), 400

    return recommendation_response(
        "mentor_founder",
        mentor_id
    )


@app.route(
    "/recommend/mentor/investors",
    methods=["POST"]
)
def mentor_to_investor():

    data = request.get_json() or {}

    mentor_id = data.get("mentor_id")

    if not mentor_id:
        return jsonify({
            "success": False,
            "message": "mentor_id is required"
        }), 400

    return recommendation_response(
        "mentor_investor",
        mentor_id
    )


@app.route(
    "/recommend/mentor/students",
    methods=["POST"]
)
def mentor_to_student():

    data = request.get_json() or {}

    mentor_id = data.get("mentor_id")

    if not mentor_id:
        return jsonify({
            "success": False,
            "message": "mentor_id is required"
        }), 400

    return recommendation_response(
        "mentor_student",
        mentor_id
    )


# ============================================================
# STUDENT
# ============================================================

@app.route(
    "/recommend/student/founders",
    methods=["POST"]
)
def student_to_founder():

    data = request.get_json() or {}

    student_id = data.get("student_id")

    if not student_id:
        return jsonify({
            "success": False,
            "message": "student_id is required"
        }), 400

    return recommendation_response(
        "student_founder",
        student_id
    )


@app.route(
    "/recommend/student/mentors",
    methods=["POST"]
)
def student_to_mentor():

    data = request.get_json() or {}

    student_id = data.get("student_id")

    if not student_id:
        return jsonify({
            "success": False,
            "message": "student_id is required"
        }), 400

    return recommendation_response(
        "student_mentor",
        student_id
    )


@app.route("/recommend/custom-founder/investors", methods=["POST"])
def recommend_custom_founder_investors():
    data = request.get_json() or {}

    required_fields = [
        "startupName",
        "domain",
        "description",
        "fundingStage",
    ]

    missing = [
        field for field in required_fields
        if not str(data.get(field, "")).strip()
    ]

    if missing:
        return jsonify({
            "success": False,
            "message": "Missing required fields",
            "missing": missing,
        }), 400

    try:
        module = importlib.import_module(
            MODULES["founder_investor"]
        )
        engine = getattr(
            module, "FounderInvestorEngine"
        )()

        recommendations = engine.recommend_custom_founder(
            {
                "id": "custom-founder",
                "name": data["startupName"],
                "company": data["startupName"],
                "domain": data["domain"],
                "description": data["description"],
                "funding_stage": data["fundingStage"],
            },
            top_n=5,
        )

        return jsonify(make_json_safe({
            "success": True,
            "direction": "founder_investor",
            "source": "StartupSync AI Recommendation Engine",
            "recommendations": recommendations,
        }))

    except Exception as error:
        app.logger.exception("Custom founder recommendation failed")
        return jsonify({
            "success": False,
            "message": "Failed to generate recommendations",
            "error": str(error),
        }), 500



@app.route("/recommend/custom-founder/mentors", methods=["POST"])
def recommend_custom_founder_mentors():
    data = request.get_json() or {}

    required_fields = [
        "startupName",
        "domain",
        "description",
    ]

    missing = [
        field for field in required_fields
        if not str(data.get(field, "")).strip()
    ]

    if missing:
        return jsonify({
            "success": False,
            "message": "Missing required fields",
            "missing": missing,
        }), 400

    try:
        module = importlib.import_module(
            MODULES["founder_mentor"]
        )

        engine = getattr(
            module, "FounderMentorEngine"
        )()

        recommendations = engine.recommend_custom_founder(
            data,
            top_n=5,
        )

        return jsonify(make_json_safe({
            "success": True,
            "direction": "founder_mentor",
            "source": "StartupSync AI Recommendation Engine",
            "recommendations": recommendations,
        }))

    except Exception as error:
        app.logger.exception(
            "Custom founder-to-mentor recommendation failed"
        )

        return jsonify({
            "success": False,
            "message": "Failed to generate mentor recommendations",
            "error": str(error),
        }), 500

@app.route("/recommend/student/opportunities", methods=["POST"])
def recommend_student_opportunities():
    data = request.get_json() or {}
    student = data.get("student", {})
    opportunities = data.get("opportunities", [])

    if not isinstance(student, dict) or not isinstance(opportunities, list):
        return jsonify({
            "success": False,
            "message": "Invalid student or opportunities data"
        }), 400

    if not opportunities:
        return jsonify({
            "success": True,
            "recommendations": []
        })

    def text_value(value):
        if isinstance(value, list):
            return " ".join(str(item) for item in value if item)
        return str(value or "")

    student_text = " ".join([
        text_value(student.get("technicalSkills")),
        text_value(student.get("programmingLanguages")),
        text_value(student.get("frameworks")),
        text_value(student.get("tools")),
        text_value(student.get("projects")),
        text_value(student.get("interestedIndustry")),
        text_value(student.get("interestedDomain")),
        text_value(student.get("placementDomain")),
        text_value(student.get("careerGoal")),
        text_value(student.get("startupInterests")),
        text_value(student.get("internshipDomain")),
        text_value(student.get("internshipDescription")),
        text_value(student.get("certifications")),
    ]).strip()

    if not student_text:
        return jsonify({
            "success": True,
            "message": "Complete your student profile to receive recommendations",
            "recommendations": []
        })

    opportunity_texts = []

    for opportunity in opportunities:
        opportunity_texts.append(" ".join([
            text_value(opportunity.get("title")),
            text_value(opportunity.get("type")),
            text_value(opportunity.get("category")),
            text_value(opportunity.get("description")),
            text_value(opportunity.get("tags")),
            text_value(opportunity.get("organizer")),
        ]))

    documents = [student_text] + opportunity_texts

    try:
        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2)
        )
        matrix = vectorizer.fit_transform(documents)
        scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

        ranked = []

        for opportunity, score in zip(opportunities, scores):
            ranked.append({
                "opportunityId": str(opportunity.get("_id", "")),
                "score": round(float(score) * 100, 2)
            })

        ranked.sort(key=lambda item: item["score"], reverse=True)

        return jsonify({
            "success": True,
            "method": "TF-IDF + Cosine Similarity",
            "recommendations": ranked
        })

    except ValueError:
        return jsonify({
            "success": True,
            "message": "Not enough text to generate recommendations",
            "recommendations": []
        })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=True
    )