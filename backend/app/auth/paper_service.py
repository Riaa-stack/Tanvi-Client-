import os
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import Paper

UPLOAD_FOLDER = "uploads"


# ==========================================================
# Upload Paper
# ==========================================================

def upload_paper(file, data, user_id):

    if not file:
        return {
            "success": False,
            "message": "No file selected."
        }, 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filename = secure_filename(file.filename)

    filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    file.save(filepath)

    paper = Paper(
        subject_id=data.get("subject_id"),
        year=data.get("year"),
        semester=data.get("semester"),
        exam_type=data.get("exam_type"),
        file_name=filename,
        file_path=filepath,
        uploaded_by=user_id
    )

    db.session.add(paper)
    db.session.commit()

    return {

        "success": True,
        "message": "Paper uploaded successfully.",

        "paper": {

            "id": paper.id,
            "subject_id": paper.subject_id,
            "year": paper.year,
            "semester": paper.semester,
            "exam_type": paper.exam_type,
            "file_name": paper.file_name,
            "file_path": paper.file_path,
            "created_at": paper.created_at

        },

        # Placeholder until AI is integrated
        "pipeline": {

            "questionsCount": 0

        }

    }, 201


# ==========================================================
# Get All Papers
# ==========================================================

def get_all_papers(subject_id=None):

    if subject_id:
        papers = Paper.query.filter_by(
            subject_id=subject_id
        ).all()
    else:
        papers = Paper.query.all()

    result = []

    for paper in papers:

        result.append({

            "id": paper.id,
            "subject_id": paper.subject_id,
            "year": paper.year,
            "semester": paper.semester,
            "exam_type": paper.exam_type,
            "file_name": paper.file_name,
            "file_path": paper.file_path,
            "created_at": paper.created_at

        })

    return {
        "success": True,
        "papers": result
    }, 200


# ==========================================================
# Get Paper
# ==========================================================

def get_paper(paper_id):

    paper = Paper.query.get(paper_id)

    if not paper:
        return {
            "success": False,
            "message": "Paper not found."
        }, 404

    return {

        "success": True,

        "paper": {

            "id": paper.id,
            "subject_id": paper.subject_id,
            "year": paper.year,
            "semester": paper.semester,
            "exam_type": paper.exam_type,
            "file_name": paper.file_name,
            "file_path": paper.file_path,
            "created_at": paper.created_at

        }

    }, 200


# ==========================================================
# Delete Paper
# ==========================================================

def delete_paper(paper_id):

    paper = Paper.query.get(paper_id)

    if not paper:
        return {
            "success": False,
            "message": "Paper not found."
        }, 404

    if paper.file_path and os.path.exists(paper.file_path):
        os.remove(paper.file_path)

    db.session.delete(paper)
    db.session.commit()

    return {
        "success": True,
        "message": "Paper deleted successfully."
    }, 200