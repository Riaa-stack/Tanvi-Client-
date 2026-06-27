from sqlalchemy import func, or_

from app.extensions import db
from app.models import Question, Paper


# ==========================================================
# Add Question
# ==========================================================

def add_question(data):

    paper_id = data.get("paper_id")
    unit_id = data.get("unit_id")
    question_text = data.get("question_text")
    marks = data.get("marks", 10)
    question_type = data.get("question_type", "Descriptive")

    if not paper_id or not question_text:
        return {
            "success": False,
            "message": "Paper ID and Question Text are required."
        }, 400

    question = Question(
        paper_id=paper_id,
        unit_id=unit_id,
        question_text=question_text,
        marks=marks,
        question_type=question_type
    )

    db.session.add(question)
    db.session.commit()

    return {

        "success": True,
        "message": "Question added successfully.",

        "question": {

            "id": question.id,
            "paper_id": question.paper_id,
            "unit_id": question.unit_id,
            "question_text": question.question_text,
            "marks": question.marks,
            "question_type": question.question_type

        }

    }, 201


# ==========================================================
# Get All Questions
# ==========================================================

def get_all_questions(subject_id=None):

    query = Question.query.join(Paper)

    if subject_id:
        query = query.filter(Paper.subject_id == subject_id)

    questions = query.all()

    result = []

    for q in questions:

        result.append({

            "id": q.id,
            "paper_id": q.paper_id,
            "unit_id": q.unit_id,
            "question_text": q.question_text,
            "marks": q.marks,
            "question_type": q.question_type

        })

    return {

        "success": True,
        "questions": result

    }, 200


# ==========================================================
# Get Single Question
# ==========================================================

def get_question(question_id):

    q = Question.query.get(question_id)

    if not q:

        return {

            "success": False,
            "message": "Question not found."

        }, 404

    return {

        "success": True,

        "question": {

            "id": q.id,
            "paper_id": q.paper_id,
            "unit_id": q.unit_id,
            "question_text": q.question_text,
            "marks": q.marks,
            "question_type": q.question_type

        }

    }, 200
# ==========================================================
# Search Questions
# ==========================================================

def search_questions(query=None, subject_id=None, unit_id=None, year=None):

    search = Question.query.join(Paper)

    if subject_id:
        search = search.filter(
            Paper.subject_id == subject_id
        )

    if unit_id:
        search = search.filter(
            Question.unit_id == unit_id
        )

    if year:
        search = search.filter(
            Paper.year == year
        )

    if query:

        search = search.filter(

            or_(

                Question.question_text.ilike(f"%{query}%"),
                Question.question_type.ilike(f"%{query}%")

            )

        )

    questions = search.all()

    result = []

    for q in questions:

        result.append({

            "id": q.id,
            "paper_id": q.paper_id,
            "unit_id": q.unit_id,
            "question_text": q.question_text,
            "marks": q.marks,
            "question_type": q.question_type

        })

    return {

        "success": True,
        "questions": result

    }, 200


# ==========================================================
# Repeated Questions
# ==========================================================

def get_repeated_questions(subject_id=None):

    query = (

        db.session.query(

            Question.question_text,

            func.count(Question.id).label("frequency")

        )

        .join(Paper)

    )

    if subject_id:

        query = query.filter(
            Paper.subject_id == subject_id
        )

    repeated = (

        query

        .group_by(Question.question_text)

        .having(func.count(Question.id) > 1)

        .all()

    )

    result = []

    for question_text, frequency in repeated:

        years = (

            db.session.query(Paper.year)

            .join(
                Question,
                Question.paper_id == Paper.id
            )

            .filter(
                Question.question_text == question_text
            )

            .distinct()

            .all()

        )

        result.append({

            "question_text": question_text,
            "frequency": frequency,
            "years": [y[0] for y in years]

        })

    return {

        "success": True,
        "questions": result

    }, 200
# ==========================================================
# Update Question
# ==========================================================

def update_question(question_id, data):

    question = Question.query.get(question_id)

    if not question:
        return {
            "success": False,
            "message": "Question not found."
        }, 404

    question.question_text = data.get(
        "question_text",
        question.question_text
    )

    question.unit_id = data.get(
        "unit_id",
        question.unit_id
    )

    question.marks = data.get(
        "marks",
        question.marks
    )

    question.question_type = data.get(
        "question_type",
        question.question_type
    )

    db.session.commit()

    return {

        "success": True,
        "message": "Question updated successfully.",

        "question": {

            "id": question.id,
            "paper_id": question.paper_id,
            "unit_id": question.unit_id,
            "question_text": question.question_text,
            "marks": question.marks,
            "question_type": question.question_type

        }

    }, 200


# ==========================================================
# Delete Question
# ==========================================================

def delete_question(question_id):

    question = Question.query.get(question_id)

    if not question:
        return {
            "success": False,
            "message": "Question not found."
        }, 404

    db.session.delete(question)
    db.session.commit()

    return {

        "success": True,
        "message": "Question deleted successfully."

    }, 200