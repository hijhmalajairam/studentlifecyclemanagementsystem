import os
import django
import random
from django.utils import timezone
from faker import Faker
from django.contrib.auth import get_user_model
from django.db import transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from academics.models import Department, Program, Course, AcademicTerm, CourseSection, FacultyProfile, Timetable, Enrollment, StudentProfile
from admission.models import ApplicantProfile, AdmissionApplication, Document, SeatAllocation

fake = Faker()
User = get_user_model()

DEPARTMENTS = [
    {'code': 'CSE', 'name': 'Computer Science & Engineering', 'programs': [{'code': 'BTECH-CSE', 'name': 'B.Tech CSE', 'duration': 4}]},
    {'code': 'ECE', 'name': 'Electronics & Communication', 'programs': [{'code': 'BTECH-ECE', 'name': 'B.Tech ECE', 'duration': 4}]},
    {'code': 'MECH', 'name': 'Mechanical Engineering', 'programs': [{'code': 'BTECH-ME', 'name': 'B.Tech Mechanical', 'duration': 4}]},
    {'code': 'CIVIL', 'name': 'Civil Engineering', 'programs': [{'code': 'BTECH-CIVIL', 'name': 'B.Tech Civil', 'duration': 4}]},
    {'code': 'MBA', 'name': 'Business Administration', 'programs': [{'code': 'MBA-GEN', 'name': 'MBA General', 'duration': 2}]},
    {'code': 'LAW', 'name': 'Law', 'programs': [{'code': 'LLB', 'name': 'LLB', 'duration': 3}]},
    {'code': 'PHARM', 'name': 'Pharmacy', 'programs': [{'code': 'BPHARM', 'name': 'B.Pharm', 'duration': 4}]},
    {'code': 'MATH', 'name': 'Mathematics', 'programs': []},
    {'code': 'PHY', 'name': 'Physics', 'programs': []},
    {'code': 'CHEM', 'name': 'Chemistry', 'programs': []},
]

COURSES = {
    'CSE': [('CS101', 'Intro to Programming'), ('CS102', 'Data Structures'), ('CS201', 'Algorithms')],
    'ECE': [('EC101', 'Basic Electronics'), ('EC102', 'Digital Logic'), ('EC201', 'Signals & Systems')],
    'MECH': [('ME101', 'Engineering Mechanics'), ('ME102', 'Thermodynamics'), ('ME201', 'Fluid Mechanics')],
    'CIVIL': [('CE101', 'Surveying'), ('CE102', 'Building Materials'), ('CE201', 'Structural Analysis')],
    'MBA': [('MB101', 'Principles of Management'), ('MB102', 'Accounting'), ('MB201', 'Marketing')],
    'LAW': [('LW101', 'Constitutional Law'), ('LW102', 'Contracts'), ('LW201', 'Criminal Law')],
    'PHARM': [('PHR101', 'Pharmaceutics'), ('PHR102', 'Human Anatomy'), ('PHR201', 'Pharmacology')],
    'MATH': [('MA101', 'Engineering Mathematics I'), ('MA102', 'Engineering Mathematics II')],
    'PHY': [('PY101', 'Engineering Physics')],
    'CHEM': [('CY101', 'Engineering Chemistry')],
}

def clear_db():
    print("Clearing database...")
    User.objects.exclude(email='admin@veritasgrove.edu').delete()
    Department.objects.all().delete()
    Course.objects.all().delete()
    print("Database cleared.")

@transaction.atomic
def seed_university():
    clear_db()
    
    admin, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@veritasgrove.edu', 'role': 'ADMIN', 'is_staff': True, 'is_superuser': True})
    admin.set_password('admin123')
    admin.save()
    
    print("Creating Departments and Programs...")
    dept_objs = {}
    prog_objs = {}
    for d_data in DEPARTMENTS:
        dept = Department.objects.create(code=d_data['code'], name=d_data['name'])
        dept_objs[dept.code] = dept
        for p_data in d_data['programs']:
            prog = Program.objects.create(
                department=dept,
                code=p_data['code'],
                name=p_data['name'],
                duration_years=p_data['duration']
            )
            prog_objs[prog.code] = prog
            
    print("Creating Courses...")
    course_objs = {}
    for d_code, c_list in COURSES.items():
        for c_code, c_name in c_list:
            sem = 1 if c_code.endswith('101') or c_code.endswith('102') else 3
            course = Course.objects.create(
                code=c_code,
                name=c_name,
                credits=3,
                semester=sem
            )
            course_objs[course.code] = course

    print("Hiring Faculty...")
    faculty_list = []
    for d_code, dept in dept_objs.items():
        num_faculty = 2 if d_code in ['MATH', 'PHY', 'CHEM'] else 4
        for i in range(num_faculty):
            user = User.objects.create(
                username=f"{d_code.lower()}_fac{i}",
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=f"{d_code.lower()}_fac{i}@univ.edu",
                role='FACULTY'
            )
            user.set_password('faculty123')
            user.save()
            profile = FacultyProfile.objects.create(
                user=user,
                department=dept,
                faculty_id=f"F-{d_code}-{100+i}",
                designation='Assistant Professor'
            )
            faculty_list.append(profile)
            if i == 0:
                dept.head = user
                dept.save()
                profile.admin_role = 'Head of Department'
                profile.save()

    print("Creating Terms and Sections...")
    term = AcademicTerm.objects.create(
        term_name="Fall 2026",
        start_date="2026-08-01",
        end_date="2026-12-15",
        term_type="ODD"
    )

    for dept_code, c_list in COURSES.items():
        dept = dept_objs[dept_code]
        dept_faculty = FacultyProfile.objects.filter(department=dept)
        if not dept_faculty:
            continue
        fac_idx = 0
        for c_code, _ in c_list:
            course = course_objs[c_code]
            fac = dept_faculty[fac_idx % len(dept_faculty)].user
            sec = CourseSection.objects.create(
                course=course,
                academic_term=term,
                capacity=60
            )
            Timetable.objects.create(
                course_section=sec,
                faculty=fac,
                day=random.choice(['MON', 'TUE', 'WED', 'THU', 'FRI']),
                start_time=f"{random.randint(9,15):02d}:00:00",
                end_time=f"{random.randint(10,16):02d}:00:00",
                room=f"Room {random.randint(101,499)}"
            )
            fac_idx += 1

    print("Admitting Students...")
    for p_code, prog in prog_objs.items():
        for i in range(5):
            user = User.objects.create(
                username=f"{p_code.lower()}_stu{i}",
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=f"{p_code.lower()}_stu{i}@univ.edu",
                role='STUDENT'
            )
            user.set_password('student123')
            user.save()
            
            profile = ApplicantProfile.objects.create(
                user=user,
                phone=fake.phone_number()[:15],
                date_of_birth='2005-01-01',
                gender='MALE'
            )
            
            app = AdmissionApplication.objects.create(
                profile=profile,
                status='ENROLLED'
            )
            
            SeatAllocation.objects.create(
                application=app,
                allocated_program=prog
            )
            
            sp, _ = StudentProfile.objects.get_or_create(user=user)
            Enrollment.objects.create(
                user=user,
                enrollment_number=f"ENR-{prog.code}-{random.randint(1000,9999)}"
            )

    print("Seed Complete!")
    print("Admin: admin@veritasgrove.edu / admin123")
    print("Faculty: cse_fac0@univ.edu / faculty123 (HOD CSE)")
    print("Student: btech-cse_stu0@univ.edu / student123")

if __name__ == '__main__':
    seed_university()
