from app.extensions import db
from app.models import Subject


# ==========================================================
# Add Subject
# ==========================================================

def add_subject(data):

    name = data.get("name")
    code = data.get("code")
    semester = data.get("semester")
    branch = data.get("branch")
    description = data.get("description", "")

    if not name or not code or not semester or not branch:
        return {
            "success": False,
            "message": "All required fields are required."
        }, 400

    existing_subject = Subject.query.filter_by(code=code).first()

    if existing_subject:
        return {
            "success": False,
            "message": "Subject code already exists."
        }, 409

    subject = Subject(
        name=name,
        code=code,
        semester=semester,
        branch=branch,
        description=description
    )

    db.session.add(subject)
    db.session.commit()

    return {
        "success": True,
        "message": "Subject added successfully.",
        "subject": {
            "id": subject.id,
            "name": subject.name,
            "code": subject.code,
            "semester": subject.semester,
            "branch": subject.branch,
            "description": subject.description
        }
    }, 201


# ==========================================================
# Get All Subjects
# ==========================================================

def get_all_subjects():

    subjects = Subject.query.all()

    subject_list = []

    for subject in subjects:

        subject_list.append({

            "id": subject.id,
            "name": subject.name,
            "code": subject.code,
            "semester": subject.semester,
            "branch": subject.branch,
            "description": subject.description

        })

    return {
        "success": True,
        "subjects": subject_list
    }, 200


# ==========================================================
# Update Subject
# ==========================================================

def update_subject(subject_id, data):

    subject = Subject.query.get(subject_id)

    if not subject:
        return {
            "success": False,
            "message": "Subject not found."
        }, 404

    # Check duplicate code if changed
    new_code = data.get("code")

    if new_code and new_code != subject.code:

        existing = Subject.query.filter_by(code=new_code).first()

        if existing:
            return {
                "success": False,
                "message": "Subject code already exists."
            }, 409

    subject.name = data.get("name", subject.name)
    subject.code = data.get("code", subject.code)
    subject.semester = data.get("semester", subject.semester)
    subject.branch = data.get("branch", subject.branch)
    subject.description = data.get("description", subject.description)

    db.session.commit()

    return {
        "success": True,
        "message": "Subject updated successfully.",
        "subject": {
            "id": subject.id,
            "name": subject.name,
            "code": subject.code,
            "semester": subject.semester,
            "branch": subject.branch,
            "description": subject.description
        }
    }, 200


# ==========================================================
# Delete Subject
# ==========================================================

def delete_subject(subject_id):

    subject = Subject.query.get(subject_id)

    if not subject:
        return {
            "success": False,
            "message": "Subject not found."
        }, 404

    db.session.delete(subject)
    db.session.commit()

    return {
        "success": True,
        "message": "Subject deleted successfully."
    }, 200