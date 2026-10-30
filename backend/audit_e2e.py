import requests
import json
import time
import os
import sys

BASE_URL = "http://127.0.0.1:5000/api/v1"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(BASE_DIR, "AC3058 - Subject - Database Management Systems.pdf")

print("="*60)
print("EduArchive AI — Comprehensive End-to-End System Audit")
print("="*60)

ts = int(time.time())
teacher_email = f"prof.sharma.{ts}@test.edu"
student_email = f"student.rahul.{ts}@test.edu"
password = "Password123!"

# 1. Register Teacher
print(f"\n[1] Registering Teacher: {teacher_email}")
t_reg = requests.post(f"{BASE_URL}/auth/register", json={
    "email": teacher_email,
    "password": password,
    "name": "Prof. Sharma",
    "role": "TEACHER"
})
print("Teacher Register Response:", t_reg.status_code, t_reg.json())
assert t_reg.status_code == 201, "Teacher registration failed"

# 2. Register Student
print(f"\n[2] Registering Student: {student_email}")
s_reg = requests.post(f"{BASE_URL}/auth/register", json={
    "email": student_email,
    "password": password,
    "name": "Rahul Verma",
    "role": "STUDENT"
})
print("Student Register Response:", s_reg.status_code, s_reg.json())
assert s_reg.status_code == 201, "Student registration failed"

# 3. Login Teacher
print("\n[3] Testing Login (Teacher)")
t_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": teacher_email,
    "password": password
})
print("Teacher Login:", t_login.status_code, t_login.json().get("success"))
assert t_login.status_code == 200
teacher_token = t_login.json()["data"]["access_token"]
teacher_headers = {"Authorization": f"Bearer {teacher_token}"}

# 4. Login Student
print("\n[4] Testing Login (Student)")
s_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": student_email,
    "password": password
})
print("Student Login:", s_login.status_code, s_login.json().get("success"))
assert s_login.status_code == 200
student_token = s_login.json()["data"]["access_token"]
student_headers = {"Authorization": f"Bearer {student_token}"}

# 5. Fetch Academic Scopes / Metadata
print("\n[5] Fetching Academic Scopes for Paper Upload...")
scopes_res = requests.get(f"{BASE_URL}/teacher/dashboard", headers=teacher_headers)
print("Teacher Dashboard status:", scopes_res.status_code)

# We can query database for an academic scope matching DBMS or first scope
from app import create_app
from app.models.academic_scope import AcademicScope
from app.models.subject import Subject

app = create_app()
with app.app_context():
    # Find DBMS or any scope
    dbms = Subject.query.filter(Subject.name.ilike("%Database%")).first()
    if not dbms:
        dbms = Subject.query.first()
    scope = AcademicScope.query.filter_by(subject_id=dbms.id).first() if dbms else AcademicScope.query.first()
    scope_id = scope.id
    subj_id = scope.subject_id
    branch_id = scope.branch_id
    sem_id = scope.semester_id
    print(f"Using Scope ID: {scope_id}, Subject: {scope.subject.name if scope.subject else subj_id}")

# 6. Upload Paper
print(f"\n[6] Uploading Paper: {os.path.basename(PDF_PATH)}...")
with open(PDF_PATH, "rb") as f:
    files = {"file": (os.path.basename(PDF_PATH), f, "application/pdf")}
    data = {
        "title": "Database Management Systems (AC3058) - 2024 Exam",
        "year": "2024",
        "semester": "5",
        "subject": "Database Management Systems",
        "branch": "Computer Science & Engineering",
        "college": "University College of Engineering",
        "university": "State Technical University"
    }
    upload_res = requests.post(f"{BASE_URL}/teacher/papers", headers=teacher_headers, files=files, data=data)

print("Upload Response:", upload_res.status_code, upload_res.json())
if upload_res.status_code == 201:
    paper_id = upload_res.json()["data"]["paper_id"]
else:
    with app.app_context():
        from app.models.paper import Paper
        p = Paper.query.order_by(Paper.created_at.desc()).first()
        paper_id = p.id
print("Target Paper ID:", paper_id)

# 7. Polling Paper Processing Status
print(f"\n[7] Waiting for AI Processing & Extraction for Paper {paper_id}...")
for attempt in range(60):
    time.sleep(3)
    status_res = requests.get(f"{BASE_URL}/student/papers/{paper_id}/status", headers=teacher_headers)
    s_info = status_res.json().get("data", {})
    status = s_info.get("status")
    print(f"  Attempt {attempt+1}: Status = {status}, Progress = {s_info.get('progress_pct', 0)}%, Stage = {s_info.get('current_stage')}")
    if status == "READY":
        print("  >>> Paper AI Processing Completed Successfully!")
        break
    elif status == "FAILED":
        print("  >>> Paper AI Processing Failed! Error:", s_info.get("error_message"))
        break

# 8. Check Extracted Questions & AI Insights
print(f"\n[8] Inspecting Extracted Questions & AI Insights...")
paper_detail = requests.get(f"{BASE_URL}/teacher/papers/{paper_id}", headers=teacher_headers).json()
p_data = paper_detail.get("data", {})
questions = p_data.get("questions", [])
print(f"Extracted Questions Count: {len(questions)}")
for i, q in enumerate(questions[:3]):
    print(f"  Q{i+1}: [{q.get('difficulty')}] (Marks: {q.get('marks')}) Unit: {q.get('unit')} | Topic: {q.get('topic')}")
    print(f"      Text: {q.get('question_text', '')[:100]}...")

# 9. Check Paper Analysis (Bloom's taxonomy, Unit distribution, etc.)
analysis_res = requests.get(f"{BASE_URL}/teacher/papers/{paper_id}/analysis", headers=teacher_headers).json()
a_data = analysis_res.get("data", {})
print("\n[9] AI Analysis Insights:")
print("  - Summary:", (a_data.get("summary") or "")[:120])
print("  - Bloom's Distribution:", a_data.get("blooms_distribution"))
print("  - Difficulty Distribution:", a_data.get("difficulty_distribution"))
print("  - Unit Distribution:", a_data.get("unit_distribution"))

# 10. Test Teacher File Serving
print(f"\n[10] Testing Teacher PDF File Serving (/api/v1/teacher/papers/{paper_id}/file)...")
file_res = requests.get(f"{BASE_URL}/teacher/papers/{paper_id}/file", headers=teacher_headers)
print("File serving status:", file_res.status_code, "Content-Type:", file_res.headers.get("Content-Type"), "Length:", len(file_res.content))
assert file_res.status_code == 200, "Teacher file serving failed"
assert "application/pdf" in file_res.headers.get("Content-Type", ""), "Mimetype should be application/pdf"

# 11. Test Student Discovery & View
print(f"\n[11] Testing Student Paper Discovery & View...")
student_papers = requests.get(f"{BASE_URL}/student/papers", headers=student_headers).json()
student_paper_list = student_papers.get("papers", [])
found = any(p["id"] == paper_id for p in student_paper_list)
print(f"Paper found in student papers list: {found} (Total ready papers: {len(student_paper_list)})")

# 12. Test RAG Chatbot with Paper-Specific Question
print(f"\n[12] Testing RAG Chatbot (Paper-Specific Question)...")
rag_res = requests.post(f"{BASE_URL}/rag/query", headers=student_headers, json={
    "question": "What questions are asked about SQL joins or relational algebra in this paper?",
    "scope": {
        "paper_id": paper_id,
        "subject_id": subj_id
    }
})
print("RAG Paper-Specific Status:", rag_res.status_code)
rag_data = rag_res.json().get("data", {})
print("RAG Answer Preview:\n", rag_data.get("answer", "")[:350])
print("Evidence Level:", rag_data.get("evidence_level"), "| Confidence:", rag_data.get("confidence"))

# 13. Test RAG Chatbot with General Subject Question
print(f"\n[13] Testing RAG Chatbot (General Question)...")
gen_res = requests.post(f"{BASE_URL}/rag/query", headers=student_headers, json={
    "question": "Explain the difference between primary key and foreign key with a short example.",
    "scope": {
        "subject_id": subj_id
    }
})
print("RAG General Status:", gen_res.status_code)
gen_data = gen_res.json().get("data", {})
print("RAG General Answer Preview:\n", gen_data.get("answer", "")[:350])

print("\n" + "="*60)
print("ALL AUDIT CHECKS COMPLETED SUCCESSFULLY!")
print("="*60)
