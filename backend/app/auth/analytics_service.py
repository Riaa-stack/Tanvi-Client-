from sqlalchemy import func

from app.models import (
    Subject,
    Unit,
    Paper,
    Question
)


# ==========================================================
# Dashboard Summary
# ==========================================================

def get_dashboard():

    return {

        "success": True,

        "dashboard": {

            "subjects": Subject.query.count(),
            "units": Unit.query.count(),
            "papers": Paper.query.count(),
            "questions": Question.query.count()

        }

    }, 200


# ==========================================================
# Unit Weightage
# ==========================================================

def get_unit_weightage(subject_id=None):

    query = (

        Question.query

        .join(Paper)

        .join(Unit)

    )

    if subject_id:

        query = query.filter(
            Paper.subject_id == subject_id
        )

    result = (

        query.with_entities(

            Unit.unit_name,

            func.count(Question.id)

        )

        .group_by(Unit.unit_name)

        .all()

    )

    data = []

    for unit_name, count in result:

        data.append({

            "unit": unit_name,
            "questions": count

        })

    return {

        "success": True,
        "analytics": data

    }, 200


# ==========================================================
# Exam Trends
# ==========================================================

def get_exam_trends(subject_id=None):

    query = (

        Question.query

        .join(Paper)

    )

    if subject_id:

        query = query.filter(
            Paper.subject_id == subject_id
        )

    result = (

        query.with_entities(

            Paper.year,

            func.count(Question.id)

        )

        .group_by(Paper.year)

        .order_by(Paper.year)

        .all()

    )

    data = []

    for year, count in result:

        data.append({

            "year": year,
            "questions": count

        })

    return {

        "success": True,
        "analytics": data

    }, 200