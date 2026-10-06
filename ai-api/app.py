import sys
import inspect
import importlib
import json

import numpy as np

from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS


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
    """
    Automatically find the recommendation method in the
    selected recommendation module.
    """

    engine = load_engine(module_path)

    methods = []

    for name, method in inspect.getmembers(
        engine,
        predicate=callable
    ):
        if name.startswith("recommend_"):
            methods.append((name, method))

    if not methods:
        raise RuntimeError(
            f"No recommend method found in {module_path}"
        )

    # Use the first recommendation method.
    method_name, method = methods[0]

    signature = inspect.signature(method)

    kwargs = {}

    for parameter_name, parameter in signature.parameters.items():

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


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=True
    )