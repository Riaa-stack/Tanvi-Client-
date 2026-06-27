from app.extensions import db
from app.models import Unit


# ==========================================================
# Add Unit
# ==========================================================

def add_unit(data):

    subject_id = data.get("subject_id")
    unit_number = data.get("unit_number")
    unit_name = data.get("unit_name")
    description = data.get("description", "")

    if not subject_id or not unit_number or not unit_name:
        return {
            "success": False,
            "message": "All required fields are required."
        }, 400

    existing = Unit.query.filter_by(
        subject_id=subject_id,
        unit_number=unit_number
    ).first()

    if existing:
        return {
            "success": False,
            "message": "Unit already exists."
        }, 409

    unit = Unit(
        subject_id=subject_id,
        unit_number=unit_number,
        unit_name=unit_name,
        description=description
    )

    db.session.add(unit)
    db.session.commit()

    return {
        "success": True,
        "message": "Unit created successfully.",
        "unit": {
            "id": unit.id,
            "subject_id": unit.subject_id,
            "unit_number": unit.unit_number,
            "unit_name": unit.unit_name,
            "description": unit.description
        }
    }, 201


# ==========================================================
# Get All Units
# ==========================================================

def get_all_units():

    units = Unit.query.all()

    unit_list = []

    for unit in units:

        unit_list.append({

            "id": unit.id,
            "subject_id": unit.subject_id,
            "unit_number": unit.unit_number,
            "unit_name": unit.unit_name,
            "description": unit.description

        })

    return {
        "success": True,
        "units": unit_list
    }, 200


# ==========================================================
# Get Units By Subject
# ==========================================================

def get_units_by_subject(subject_id):

    units = Unit.query.filter_by(
        subject_id=subject_id
    ).all()

    unit_list = []

    for unit in units:

        unit_list.append({

            "id": unit.id,
            "subject_id": unit.subject_id,
            "unit_number": unit.unit_number,
            "unit_name": unit.unit_name,
            "description": unit.description

        })

    return {
        "success": True,
        "units": unit_list
    }, 200


# ==========================================================
# Update Unit
# ==========================================================

def update_unit(unit_id, data):

    unit = Unit.query.get(unit_id)

    if not unit:
        return {
            "success": False,
            "message": "Unit not found."
        }, 404

    new_number = data.get("unit_number")

    if new_number and new_number != unit.unit_number:

        existing = Unit.query.filter_by(
            subject_id=unit.subject_id,
            unit_number=new_number
        ).first()

        if existing:
            return {
                "success": False,
                "message": "Unit number already exists."
            }, 409

    unit.unit_number = data.get("unit_number", unit.unit_number)
    unit.unit_name = data.get("unit_name", unit.unit_name)
    unit.description = data.get("description", unit.description)

    db.session.commit()

    return {
        "success": True,
        "message": "Unit updated successfully.",
        "unit": {
            "id": unit.id,
            "subject_id": unit.subject_id,
            "unit_number": unit.unit_number,
            "unit_name": unit.unit_name,
            "description": unit.description
        }
    }, 200


# ==========================================================
# Delete Unit
# ==========================================================

def delete_unit(unit_id):

    unit = Unit.query.get(unit_id)

    if not unit:
        return {
            "success": False,
            "message": "Unit not found."
        }, 404

    db.session.delete(unit)
    db.session.commit()

    return {
        "success": True,
        "message": "Unit deleted successfully."
    }, 200