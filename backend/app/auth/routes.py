from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User
# ==========================================================
# Authentication Services
# ==========================================================
from app.auth.auth_service import (
    register_user,
    login_user
)

# ==========================================================
# Subject Services
# ==========================================================
from app.auth.subject_service import (
    add_subject,
    get_all_subjects,
    update_subject,
    delete_subject
)

# ==========================================================
# Unit Services
# ==========================================================
from app.auth.unit_service import (
    add_unit,
    get_all_units,
    get_units_by_subject,
    update_unit,
    delete_unit
)
# ==========================================================
# Paper Services
# ==========================================================

from app.auth.paper_service import (
    upload_paper,
    get_all_papers,
    get_paper,
    delete_paper
)

# ==========================================================
# Question Services
# ==========================================================

from app.auth.question_service import (
    add_question,
    get_all_questions,
    get_question,
    search_questions,
    get_repeated_questions,
    update_question,
    delete_question
)

from app.auth.analytics_service import (
    get_dashboard,
    get_unit_weightage,
    get_exam_trends
)
# ==========================================================
# Blueprints
# ==========================================================

auth_bp = Blueprint("auth", __name__)
api_bp = Blueprint("api", __name__)

# ==========================================================
# AUTHENTICATION APIs
# ==========================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    response, status = register_user(data)

    return jsonify(response), status


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    response, status = login_user(data)

    return jsonify(response), status


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():

    return jsonify({
        "success": True,
        "message": "Logout Successful"
    }), 200


# ==========================================================
# SUBJECT APIs
# ==========================================================

@api_bp.route("/subjects", methods=["POST"])
@jwt_required()
def create_subject():

    data = request.get_json()

    response, status = add_subject(data)

    return jsonify(response), status


@api_bp.route("/subjects", methods=["GET"])
@jwt_required()
def fetch_subjects():

    response, status = get_all_subjects()

    return jsonify(response), status


@api_bp.route("/subjects/<int:subject_id>", methods=["PUT"])
@jwt_required()
def edit_subject(subject_id):

    data = request.get_json()

    response, status = update_subject(subject_id, data)

    return jsonify(response), status


@api_bp.route("/subjects/<int:subject_id>", methods=["DELETE"])
@jwt_required()
def remove_subject(subject_id):

    response, status = delete_subject(subject_id)

    return jsonify(response), status


# ==========================================================
# UNIT APIs
# ==========================================================

@api_bp.route("/units", methods=["POST"])
@jwt_required()
def create_unit():

    data = request.get_json()

    response, status = add_unit(data)

    return jsonify(response), status


@api_bp.route("/units", methods=["GET"])
@jwt_required()
def fetch_units():

    response, status = get_all_units()

    return jsonify(response), status


@api_bp.route("/units/subject/<int:subject_id>", methods=["GET"])
@jwt_required()
def fetch_units_by_subject(subject_id):

    response, status = get_units_by_subject(subject_id)

    return jsonify(response), status


@api_bp.route("/units/<int:unit_id>", methods=["PUT"])
@jwt_required()
def edit_unit(unit_id):

    data = request.get_json()

    response, status = update_unit(unit_id, data)

    return jsonify(response), status


@api_bp.route("/units/<int:unit_id>", methods=["DELETE"])
@jwt_required()
def remove_unit(unit_id):

    response, status = delete_unit(unit_id)

    return jsonify(response), status

# ==========================================================
# PAPER APIs
# ==========================================================

@api_bp.route("/papers/upload", methods=["POST"])
@jwt_required()
def upload_question_paper():

    user_id = get_jwt_identity()

    file = request.files.get("file")

    data = request.form

    response, status = upload_paper(
        file,
        data,
        user_id
    )

    return jsonify(response), status

@api_bp.route("/papers", methods=["GET"])
@jwt_required()
def fetch_papers():

    subject_id = request.args.get("subject_id")

    response, status = get_all_papers(subject_id)

    return jsonify(response), status


@api_bp.route("/papers/<int:paper_id>", methods=["GET"])
@jwt_required()
def fetch_paper(paper_id):

    response, status = get_paper(paper_id)

    return jsonify(response), status


@api_bp.route("/papers/<int:paper_id>", methods=["DELETE"])
@jwt_required()
def remove_paper(paper_id):

    response, status = delete_paper(paper_id)

    return jsonify(response), status
# ==========================================================
# QUESTION APIs
# ==========================================================

@api_bp.route("/questions", methods=["POST"])
@jwt_required()
def create_question():

    data = request.get_json()

    response, status = add_question(data)

    return jsonify(response), status


@api_bp.route("/questions", methods=["GET"])
@jwt_required()
def fetch_questions():

    subject_id = request.args.get("subject_id")

    response, status = get_all_questions(subject_id)

    return jsonify(response), status


@api_bp.route("/questions/search", methods=["GET"])
@jwt_required()
def search_question():

    response, status = search_questions(

        query=request.args.get("query"),
        subject_id=request.args.get("subject_id"),
        unit_id=request.args.get("unit_id"),
        year=request.args.get("year")

    )

    return jsonify(response), status


@api_bp.route("/questions/repeated", methods=["GET"])
@jwt_required()
def repeated_questions():

    response, status = get_repeated_questions(

        request.args.get("subject_id")

    )

    return jsonify(response), status


@api_bp.route("/questions/<int:question_id>", methods=["GET"])
@jwt_required()
def fetch_question(question_id):

    response, status = get_question(question_id)

    return jsonify(response), status


@api_bp.route("/questions/<int:question_id>", methods=["PUT"])
@jwt_required()
def edit_question(question_id):

    data = request.get_json()

    response, status = update_question(
        question_id,
        data
    )

    return jsonify(response), status


@api_bp.route("/questions/<int:question_id>", methods=["DELETE"])
@jwt_required()
def remove_question(question_id):

    response, status = delete_question(question_id)

    return jsonify(response), status
# ==========================================================
# ANALYTICS APIs
# ==========================================================

@api_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    response, status = get_dashboard()

    return jsonify(response), status


@api_bp.route("/analytics/unit-weightage", methods=["GET"])
@jwt_required()
def unit_weightage():

    response, status = get_unit_weightage(
        request.args.get("subject_id")
    )

    return jsonify(response), status


@api_bp.route("/analytics/exam-trends", methods=["GET"])
@jwt_required()
def exam_trends():

    response, status = get_exam_trends(
        request.args.get("subject_id")
    )

    return jsonify(response), status


