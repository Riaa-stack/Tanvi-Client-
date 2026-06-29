"""Syllabus Service — Semesters, Subjects, Units, Topics CRUD."""
from typing import Dict, List, Optional
from app.models.semester import Semester
from app.models.subject import Subject
from app.models.unit import Unit
from app.models.topic import Topic
from app.extensions import db


class SyllabusService:

    # --- Semesters ---
    def get_semesters(self) -> List[Dict]:
        sems = Semester.query.filter_by(is_active=True).order_by(Semester.number).all()
        return [self._sem_dict(s) for s in sems]

    def get_semester(self, sem_id: str) -> Optional[Dict]:
        s = Semester.query.get(sem_id)
        return self._sem_dict(s) if s else None

    def create_semester(self, name: str, number: int, academic_year: str = None) -> Dict:
        s = Semester(name=name, number=number, academic_year=academic_year)
        db.session.add(s)
        db.session.commit()
        return self._sem_dict(s)

    # --- Subjects ---
    def get_subjects(self, semester_id: str = None) -> List[Dict]:
        q = Subject.query.filter_by(is_deleted=False, is_active=True)
        if semester_id:
            q = q.filter_by(semester_id=semester_id)
        return [self._subject_dict(s) for s in q.order_by(Subject.name).all()]

    def get_subject(self, subject_id: str) -> Optional[Dict]:
        s = Subject.query.filter_by(id=subject_id, is_deleted=False).first()
        return self._subject_dict(s) if s else None

    def create_subject(self, name: str, code: str, semester_id: str = None, description: str = None) -> Dict:
        if Subject.query.filter_by(code=code.upper(), is_deleted=False).first():
            raise ValueError(f"Subject code '{code}' already exists.")
        s = Subject(name=name, code=code.upper(), semester_id=semester_id, description=description)
        db.session.add(s)
        db.session.commit()
        return self._subject_dict(s)

    def update_subject(self, subject_id: str, **kwargs) -> Dict:
        s = Subject.query.filter_by(id=subject_id, is_deleted=False).first()
        if not s:
            raise ValueError("Subject not found.")
        for k, v in kwargs.items():
            if hasattr(s, k):
                setattr(s, k, v)
        db.session.commit()
        return self._subject_dict(s)

    def delete_subject(self, subject_id: str) -> bool:
        s = Subject.query.filter_by(id=subject_id, is_deleted=False).first()
        if not s:
            return False
        s.is_deleted = True
        db.session.commit()
        return True

    # --- Units ---
    def get_units(self, subject_id: str) -> List[Dict]:
        units = Unit.query.filter_by(subject_id=subject_id, is_deleted=False).order_by(Unit.unit_number).all()
        return [self._unit_dict(u) for u in units]

    def create_unit(self, subject_id: str, unit_number: int, title: str, description: str = None) -> Dict:
        if Unit.query.filter_by(subject_id=subject_id, unit_number=unit_number, is_deleted=False).first():
            raise ValueError(f"Unit {unit_number} already exists for this subject.")
        u = Unit(subject_id=subject_id, unit_number=unit_number, title=title, description=description)
        db.session.add(u)
        db.session.commit()
        return self._unit_dict(u)

    def update_unit(self, unit_id: str, **kwargs) -> Dict:
        u = Unit.query.filter_by(id=unit_id, is_deleted=False).first()
        if not u:
            raise ValueError("Unit not found.")
        for k, v in kwargs.items():
            if hasattr(u, k):
                setattr(u, k, v)
        db.session.commit()
        return self._unit_dict(u)

    def delete_unit(self, unit_id: str) -> bool:
        u = Unit.query.filter_by(id=unit_id, is_deleted=False).first()
        if not u:
            return False
        u.is_deleted = True
        db.session.commit()
        return True

    # --- Topics ---
    def get_topics(self, unit_id: str) -> List[Dict]:
        topics = Topic.query.filter_by(unit_id=unit_id, is_deleted=False).all()
        return [self._topic_dict(t) for t in topics]

    def create_topic(self, unit_id: str, subject_id: str, name: str, description: str = None) -> Dict:
        t = Topic(unit_id=unit_id, subject_id=subject_id, name=name, description=description)
        db.session.add(t)
        db.session.commit()
        return self._topic_dict(t)

    def update_topic(self, topic_id: str, **kwargs) -> Dict:
        t = Topic.query.filter_by(id=topic_id, is_deleted=False).first()
        if not t:
            raise ValueError("Topic not found.")
        for k, v in kwargs.items():
            if hasattr(t, k):
                setattr(t, k, v)
        db.session.commit()
        return self._topic_dict(t)

    def delete_topic(self, topic_id: str) -> bool:
        t = Topic.query.filter_by(id=topic_id, is_deleted=False).first()
        if not t:
            return False
        t.is_deleted = True
        db.session.commit()
        return True

    def _sem_dict(self, s) -> Dict:
        return {"id": s.id, "name": s.name, "number": s.number, "academic_year": s.academic_year, "is_active": s.is_active}

    def _subject_dict(self, s) -> Dict:
        return {"id": s.id, "name": s.name, "code": s.code, "description": s.description,
                "semester_id": s.semester_id, "is_active": s.is_active,
                "created_at": s.created_at.isoformat() if s.created_at else None}

    def _unit_dict(self, u) -> Dict:
        return {"id": u.id, "subject_id": u.subject_id, "unit_number": u.unit_number,
                "title": u.title, "description": u.description, "weightage_percentage": float(u.weightage_percentage) if u.weightage_percentage else None}

    def _topic_dict(self, t) -> Dict:
        return {"id": t.id, "unit_id": t.unit_id, "subject_id": t.subject_id, "name": t.name,
                "description": t.description, "is_important": t.is_important}
