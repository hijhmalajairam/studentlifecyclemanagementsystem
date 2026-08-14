import os
import django
import random
import uuid
from datetime import timedelta, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from users.models import User
from admission.models import AdmissionApplication, Document, Scholarship, ApplicantProfile, SeatAllocation
from academics.models import Enrollment, Course, SemesterRegistration, Attendance, Leave, Result, DisciplinaryCase, Internship
from django.contrib.auth.hashers import make_password


def seed():
    print("=== Clearing old data (keeping superusers) ===")
    Internship.objects.all().delete()
    DisciplinaryCase.objects.all().delete()
    Result.objects.all().delete()
    Leave.objects.all().delete()
    Attendance.objects.all().delete()
    SemesterRegistration.objects.all().delete()
    Enrollment.objects.all().delete()
    SeatAllocation.objects.all().delete()
    Scholarship.objects.all().delete()
    Document.objects.all().delete()
    AdmissionApplication.objects.all().delete()
    ApplicantProfile.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()
    Course.objects.all().delete()

    # ── Courses ──────────────────────────────────────────────
    print("Creating courses...")
    courses = [
        # Semester 1
        Course.objects.create(code='CS101', name='Intro to Programming', credits=3, semester=1),
        Course.objects.create(code='MA101', name='Calculus I', credits=4, semester=1),
        Course.objects.create(code='PH101', name='Engineering Physics', credits=3, semester=1),
        Course.objects.create(code='EE101', name='Basic Electronics', credits=3, semester=1),
        # Semester 2
        Course.objects.create(code='CS102', name='OOP with Java', credits=4, semester=2),
        Course.objects.create(code='MA102', name='Linear Algebra', credits=4, semester=2),
        # Semester 3 (Lateral entry starts here)
        Course.objects.create(code='CS201', name='Data Structures', credits=4, semester=3),
        Course.objects.create(code='CS202', name='Computer Architecture', credits=3, semester=3),
        Course.objects.create(code='MA201', name='Discrete Mathematics', credits=3, semester=3),
    ]

    # ── Users ────────────────────────────────────────────────
    print("Creating 100 students...")
    first_names = [
        "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
        "Krishna", "Ishaan", "Ananya", "Diya", "Saanvi", "Aadhya", "Isha",
        "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael",
        "Linda", "William", "Elizabeth", "David", "Sarah", "Thomas", "Karen"
    ]
    last_names = [
        "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Nair", "Desai",
        "Verma", "Joshi", "Smith", "Johnson", "Williams", "Brown", "Jones"
    ]

    users_to_create = []
    for i in range(1, 101):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        users_to_create.append(User(
            username=f"student{i}@university.edu",
            email=f"student{i}@university.edu",
            first_name=fn,
            last_name=ln,
            role='PROSPECTIVE_STUDENT',
            password=make_password('password123')
        ))
    User.objects.bulk_create(users_to_create)
    students = list(User.objects.filter(role='PROSPECTIVE_STUDENT').order_by('id'))

    # ── Applications ─────────────────────────────────────────
    print("Creating applications & full lifecycle data...")
    for idx, user in enumerate(students):
        # 60% selected, 20% pending (submitted), 10% rejected, 10% interview_scheduled
        roll = random.random()
        if roll < 0.60:
            app_status = 'SELECTED'
        elif roll < 0.70:
            app_status = 'INTERVIEW_SCHEDULED'
        elif roll < 0.90:
            app_status = 'SUBMITTED'
        else:
            app_status = 'REJECTED'

        entry_type = 'ONLINE' if random.random() < 0.80 else 'OFFLINE'
        school = random.choice([
            "Delhi Public School", "St. Xavier's High School", "Kendriya Vidyalaya",
            "DAV Public School", "Amity International", "Ryan International",
            "The Heritage School", "Springdale School"
        ])
        marks = round(random.uniform(40, 100), 2)
        
        # Create Profile
        profile = ApplicantProfile.objects.create(
            user=user,
            father_name=f"Mr. {random.choice(first_names)} {user.last_name}",
            mother_name=f"Mrs. {random.choice(first_names)} {user.last_name}",
            family_income=random.choice([100000, 500000, 1500000, 5000000]),
            phone=f"987654{random.randint(1000, 9999)}",
            address="123 Example Street, City"
        )

        app = AdmissionApplication.objects.create(
            profile=profile,
            entry_type=entry_type,
            previous_school_name=school,
            previous_marks_percentage=marks,
            status=app_status,
            scholarship_requested=random.choice([True, False])
        )
        
        if app_status == 'INTERVIEW_SCHEDULED':
            app.interview_date = django.utils.timezone.now() + timedelta(days=random.randint(1, 10))
            app.save()

        if app_status not in ['SELECTED']:
            continue

        # ── Documents (for selected students) ────────────────
        doc_names = ["Aadhaar Card", "10th Marksheet", "12th Marksheet", "Passport Photo"]
        for dname in random.sample(doc_names, k=random.randint(2, 4)):
            Document.objects.create(
                application=app,
                document_name=dname,
                file=f"documents/placeholder_{user.id}_{dname.replace(' ', '_').lower()}.pdf",
                status=random.choice(['VERIFIED', 'VERIFIED', 'VERIFIED', 'PENDING']),
            )
            
        # Seat Allocation for SELECTED students (30% haven't paid fees yet, 70% have paid and enrolled)
        SeatAllocation.objects.create(
            application=app,
            allocated_department=random.choice(["Computer Science", "Mechanical", "Business"]),
            allocated_program=random.choice(["B.Tech CSE", "MBA", "B.Tech Mechanical"]),
            allocated_batch="2024-2028 Section A"
        )
        
        app.status = 'FEE_PENDING' if random.random() < 0.3 else 'ENROLLED'
        app.save()
        
        if app.status == 'FEE_PENDING':
            continue

        # ── Scholarship ─────────────
        if app.scholarship_requested:
            sch_status = random.choice(['APPLIED', 'APPROVED', 'REJECTED'])
            concession = random.choice([25, 50, 75, 100]) if sch_status == 'APPROVED' else 0
            Scholarship.objects.create(
                application=app,
                reason="Family income is below poverty line.",
                status=sch_status,
                concession_percentage=concession,
            )

        # ── Enrollment ────────────
        enrollment = Enrollment.objects.create(
            user=user,
            enrollment_number=f"ENR-{uuid.uuid4().hex[:8].upper()}",
            fee_paid=True,
        )
        user.role = 'STUDENT'
        
        parent_username = f"parent_{user.username.split('@')[0]}@university.edu"
        parent_user = User.objects.create(
            username=parent_username,
            email=parent_username,
            first_name=f"{user.first_name}'s",
            last_name="Parent",
            role='PARENT',
            password=make_password('password123'),
            student=user
        )
        user.save(update_fields=['role'])

        # ── Semester Registration ────────────────────────
        sem = 3 if entry_type == 'LATERAL' else 1
        reg = SemesterRegistration.objects.create(
            enrollment=enrollment,
            semester=sem,
        )
        sem_courses = [c for c in courses if c.semester == sem]
        reg.courses.set(sem_courses)

        # ── Attendance (last 20 weekdays) ────────────────
        today = date.today()
        for day_offset in range(25):
            att_date = today - timedelta(days=day_offset)
            if att_date.weekday() >= 5:
                continue
            for c in sem_courses:
                Attendance.objects.create(
                    enrollment=enrollment,
                    course=c,
                    date=att_date,
                    status='PRESENT' if random.random() < 0.82 else 'ABSENT',
                )

        # ── Exam Results & Leaves ──────────────────────────────
        for c in sem_courses:
            if random.random() < 0.6:
                marks_obt = round(random.uniform(40, 100), 2)
                if marks_obt >= 90: grade = 'O'
                elif marks_obt >= 80: grade = 'A+'
                elif marks_obt >= 70: grade = 'A'
                elif marks_obt >= 60: grade = 'B+'
                elif marks_obt >= 50: grade = 'B'
                elif marks_obt >= 45: grade = 'C'
                elif marks_obt >= 40: grade = 'P'
                else: grade = 'F'
                
                Result.objects.create(
                    enrollment=enrollment,
                    course=c,
                    marks_obtained=marks_obt,
                    grade=grade,
                    is_backlog=False,
                    is_revaluation=False
                )

        if random.random() < 0.2:
            Leave.objects.create(
                enrollment=enrollment,
                start_date=today - timedelta(days=random.randint(10, 30)),
                end_date=today - timedelta(days=random.randint(2, 9)),
                reason=random.choice(["Medical leave", "Family emergency", "Attending a workshop", "Personal reasons"]),
                status=random.choice(['APPROVED', 'REJECTED', 'PENDING'])
            )

    # ── Ensure admin exists ──────────────────────────────────
    if not User.objects.filter(username='admin@university.edu').exists():
        User.objects.create_superuser(
            username='admin@university.edu',
            email='admin@university.edu',
            password='password123',
            first_name='System',
            last_name='Admin',
            role='ADMIN',
        )
        print("Created admin@university.edu / password123")

    total_apps = AdmissionApplication.objects.count()
    total_enrolled = Enrollment.objects.count()
    total_attendance = Attendance.objects.count()
    print(f"\n=== Seed Complete ===")
    print(f"  Applications: {total_apps}")
    print(f"  Enrolled:     {total_enrolled}")
    print(f"  Attendance:   {total_attendance} records")
    print(f"  Courses:      {Course.objects.count()}")
    print(f"\n  Admin login:   admin@university.edu / password123")
    print(f"  Student login: student1@university.edu / password123")


if __name__ == '__main__':
    seed()
