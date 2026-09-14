"""
Seed script to create admin, HOD, finance, and multi-role faculty accounts.
Updates existing faculty profiles with enrollment numbers and institutional emails.
"""
import os
import sys
import django
import random

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from users.models import User
from academics.models import Department, FacultyProfile


def generate_faculty_enrollment(faculty_id, dept_code, year=24):
    """Generate enrollment number for faculty: YYFAC-DEPTCODE-SEQNUM"""
    seq = faculty_id.replace('F', '').zfill(3)
    return f"{year}FAC-{dept_code}-{seq}"


def generate_institutional_email(first_name, last_name):
    """Generate institutional email for faculty."""
    fn = first_name.lower().replace(' ', '').replace('.', '')
    ln = last_name.lower().replace(' ', '').replace('.', '')
    suffix = random.randint(10, 99)
    return f"{fn}.{ln}{suffix}@veritasgrove.edu"


def seed():
    print("=" * 60)
    print("  SEEDING ADMIN, HOD & MULTI-ROLE FACULTY ACCOUNTS")
    print("=" * 60)

    # Ensure departments exist
    dept_cs, _ = Department.objects.get_or_create(name='Computer Science', defaults={'code': 'CS', 'description': 'Computer Science & Engineering'})
    dept_ec, _ = Department.objects.get_or_create(name='Electronics & Communication', defaults={'code': 'EC', 'description': 'Electronics & Communication Engineering'})
    dept_me, _ = Department.objects.get_or_create(name='Mechanical Engineering', defaults={'code': 'ME', 'description': 'Mechanical Engineering'})
    dept_ce, _ = Department.objects.get_or_create(name='Civil Engineering', defaults={'code': 'CE', 'description': 'Civil Engineering'})
    dept_ma, _ = Department.objects.get_or_create(name='Mathematics', defaults={'code': 'MA', 'description': 'Mathematics Department'})

    # ─── 1. SUPER ADMIN ───
    admin_user, created = User.objects.get_or_create(
        username='admin@veritasgrove.edu',
        defaults={
            'email': 'admin@veritasgrove.edu',
            'first_name': 'Rajesh',
            'last_name': 'Kumar',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True,
            'additional_roles': ['ADMIN'],
            'phone': '9876543210',
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"  ✅ Created ADMIN: admin@veritasgrove.edu / admin123")
    else:
        admin_user.role = 'ADMIN'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.additional_roles = ['ADMIN']
        admin_user.save()
        print(f"  ♻️  Updated ADMIN: admin@veritasgrove.edu")

    # ─── 2. HOD - Computer Science (also Placement Coordinator) ───
    hod_cs_user, created = User.objects.get_or_create(
        username='anil.krishnan@veritasgrove.edu',
        defaults={
            'email': 'anil.krishnan@veritasgrove.edu',
            'first_name': 'Anil',
            'last_name': 'Krishnan',
            'role': 'FACULTY',
            'additional_roles': ['HOD', 'PLACEMENT_COORDINATOR'],
            'phone': '9990566476',
        }
    )
    if created:
        hod_cs_user.set_password('faculty123')
        hod_cs_user.save()
    else:
        hod_cs_user.additional_roles = ['HOD', 'PLACEMENT_COORDINATOR']
        hod_cs_user.save()
    
    # Link to FacultyProfile - handle case where F002 already exists with different user
    try:
        fp_hod = FacultyProfile.objects.get(faculty_id='F002')
        # Update the existing profile
        fp_hod.user = hod_cs_user
        fp_hod.department = dept_cs
        fp_hod.designation = 'Associate Professor'
        fp_hod.admin_role = 'Head of Department'
        fp_hod.additional_roles = ['Head of Department', 'Placement Coordinator']
        fp_hod.about = 'Passionate about machine learning research and mentoring students. Leading the CS department toward AI excellence.'
    except FacultyProfile.DoesNotExist:
        fp_hod = FacultyProfile(
            user=hod_cs_user,
            faculty_id='F002',
            gender='Male',
            department=dept_cs,
            designation='Associate Professor',
            admin_role='Head of Department',
            additional_roles=['Head of Department', 'Placement Coordinator'],
            highest_qualification='Ph.D. in Machine Learning',
            alma_mater='BITS Pilani',
            specialization='Machine Learning',
            years_of_experience=13,
            employment_type='Permanent',
            status='Active',
            phone='9990566476',
            office_room='COM-416',
            research_publications=21,
            student_rating=4.5,
            about='Passionate about machine learning research and mentoring students. Leading the CS department toward AI excellence.',
        )
    fp_hod.faculty_enrollment_number = generate_faculty_enrollment('F002', 'CS')
    fp_hod.institutional_email = 'anil.krishnan@veritasgrove.edu'
    fp_hod.additional_roles = ['Head of Department', 'Placement Coordinator']
    fp_hod.save()
    print(f"  ✅ HOD CS (+ Placement): anil.krishnan@veritasgrove.edu / faculty123  |  Enroll: {fp_hod.faculty_enrollment_number}")

    # ─── 3. FINANCE OFFICER (also Faculty in Mathematics) ───
    finance_user, created = User.objects.get_or_create(
        username='priya.sharma@veritasgrove.edu',
        defaults={
            'email': 'priya.sharma@veritasgrove.edu',
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'role': 'FACULTY',
            'additional_roles': ['FINANCE'],
            'phone': '9876501234',
        }
    )
    if created:
        finance_user.set_password('faculty123')
        finance_user.save()
    else:
        finance_user.additional_roles = ['FINANCE']
        finance_user.save()

    try:
        fp_fin = FacultyProfile.objects.get(faculty_id='F021')
        fp_fin.user = finance_user
        fp_fin.department = dept_ma
        fp_fin.admin_role = 'Finance Officer'
        fp_fin.additional_roles = ['Finance Officer']
        fp_fin.about = 'Mathematics professor with expertise in financial modeling. Also serves as the university finance officer.'
    except FacultyProfile.DoesNotExist:
        fp_fin = FacultyProfile(
            user=finance_user, faculty_id='F021', gender='Female', department=dept_ma,
            designation='Associate Professor', admin_role='Finance Officer',
            additional_roles=['Finance Officer'],
            highest_qualification='Ph.D. in Applied Mathematics', alma_mater='IIT Delhi',
            specialization='Financial Mathematics', years_of_experience=10,
            employment_type='Permanent', status='Active', phone='9876501234',
            office_room='MA-201', research_publications=12, student_rating=4.2,
            about='Mathematics professor with expertise in financial modeling. Also serves as the university finance officer.',
        )
    fp_fin.faculty_enrollment_number = generate_faculty_enrollment('F021', 'MA')
    fp_fin.institutional_email = 'priya.sharma@veritasgrove.edu'
    fp_fin.save()
    print(f"  ✅ Finance Officer: priya.sharma@veritasgrove.edu / faculty123  |  Enroll: {fp_fin.faculty_enrollment_number}")

    # ─── 4. WARDEN + MESS INCHARGE (Faculty in Mechanical) ───
    warden_user, created = User.objects.get_or_create(
        username='suresh.menon@veritasgrove.edu',
        defaults={
            'email': 'suresh.menon@veritasgrove.edu',
            'first_name': 'Suresh',
            'last_name': 'Menon',
            'role': 'FACULTY',
            'additional_roles': ['WARDEN', 'MESS_INCHARGE'],
            'phone': '9443217890',
        }
    )
    if created:
        warden_user.set_password('faculty123')
        warden_user.save()
    else:
        warden_user.additional_roles = ['WARDEN', 'MESS_INCHARGE']
        warden_user.save()

    try:
        fp_war = FacultyProfile.objects.get(faculty_id='F022')
        fp_war.user = warden_user
        fp_war.department = dept_me
        fp_war.admin_role = 'Warden'
        fp_war.additional_roles = ['Warden', 'Mess Incharge']
        fp_war.about = 'Senior professor in Mechanical Engineering. Manages hostel and mess operations as Warden and Mess Incharge.'
    except FacultyProfile.DoesNotExist:
        fp_war = FacultyProfile(
            user=warden_user, faculty_id='F022', gender='Male', department=dept_me,
            designation='Professor', admin_role='Warden',
            additional_roles=['Warden', 'Mess Incharge'],
            highest_qualification='Ph.D. in Thermal Engineering', alma_mater='NIT Calicut',
            specialization='Heat Transfer', years_of_experience=18,
            employment_type='Permanent', status='Active', phone='9443217890',
            office_room='ME-105', research_publications=28, student_rating=4.1,
            about='Senior professor in Mechanical Engineering. Manages hostel and mess operations as Warden and Mess Incharge.',
        )
    fp_war.faculty_enrollment_number = generate_faculty_enrollment('F022', 'ME')
    fp_war.institutional_email = 'suresh.menon@veritasgrove.edu'
    fp_war.save()
    print(f"  ✅ Warden + Mess: suresh.menon@veritasgrove.edu / faculty123  |  Enroll: {fp_war.faculty_enrollment_number}")

    # ─── 5. HOD - Electronics (also Exam Controller) ───
    hod_ec_user, created = User.objects.get_or_create(
        username='vikram.pillai@veritasgrove.edu',
        defaults={
            'email': 'vikram.pillai@veritasgrove.edu',
            'first_name': 'Vikram',
            'last_name': 'Pillai',
            'role': 'FACULTY',
            'additional_roles': ['HOD', 'EXAM_CONTROLLER'],
            'phone': '9642621108',
        }
    )
    if created:
        hod_ec_user.set_password('faculty123')
        hod_ec_user.save()
    else:
        hod_ec_user.additional_roles = ['HOD', 'EXAM_CONTROLLER']
        hod_ec_user.save()

    try:
        fp_hod_ec = FacultyProfile.objects.get(faculty_id='F001')
        fp_hod_ec.user = hod_ec_user
        fp_hod_ec.department = dept_ec
        fp_hod_ec.admin_role = 'Head of Department'
        fp_hod_ec.additional_roles = ['Head of Department', 'Exam Controller']
        fp_hod_ec.about = 'Specializes in embedded systems and IoT. Head of Electronics dept and university Exam Controller.'
    except FacultyProfile.DoesNotExist:
        fp_hod_ec = FacultyProfile(
            user=hod_ec_user, faculty_id='F001', gender='Male', department=dept_ec,
            designation='Assistant Professor', admin_role='Head of Department',
            additional_roles=['Head of Department', 'Exam Controller'],
            highest_qualification='M.E. in Embedded Systems', alma_mater='IISc Bangalore',
            specialization='Embedded Systems', years_of_experience=5,
            employment_type='Permanent', status='Active', phone='9642621108',
            office_room='ELE-408', research_publications=9, student_rating=4.0,
            about='Specializes in embedded systems and IoT. Head of Electronics dept and university Exam Controller.',
        )
    fp_hod_ec.faculty_enrollment_number = generate_faculty_enrollment('F001', 'EC')
    fp_hod_ec.institutional_email = 'vikram.pillai@veritasgrove.edu'
    fp_hod_ec.save()
    print(f"  ✅ HOD EC (+ Exam Ctrl): vikram.pillai@veritasgrove.edu / faculty123  |  Enroll: {fp_hod_ec.faculty_enrollment_number}")

    # ─── 6. Regular Faculty (no extra roles) ───
    reg_user, created = User.objects.get_or_create(
        username='deepa.nair@veritasgrove.edu',
        defaults={
            'email': 'deepa.nair@veritasgrove.edu',
            'first_name': 'Deepa',
            'last_name': 'Nair',
            'role': 'FACULTY',
            'additional_roles': [],
            'phone': '9870012345',
        }
    )
    if created:
        reg_user.set_password('faculty123')
        reg_user.save()

    try:
        fp_reg = FacultyProfile.objects.get(faculty_id='F023')
        fp_reg.user = reg_user
        fp_reg.department = dept_cs
        fp_reg.admin_role = 'None'
        fp_reg.additional_roles = []
        fp_reg.about = 'Enthusiastic teacher focused on software architecture and clean code practices.'
    except FacultyProfile.DoesNotExist:
        fp_reg = FacultyProfile(
            user=reg_user, faculty_id='F023', gender='Female', department=dept_cs,
            designation='Assistant Professor', admin_role='None', additional_roles=[],
            highest_qualification='M.Tech in Software Engineering', alma_mater='IIT Madras',
            specialization='Software Engineering', years_of_experience=3,
            employment_type='Permanent', status='Active', phone='9870012345',
            office_room='COM-312', research_publications=4, student_rating=4.3,
            about='Enthusiastic teacher focused on software architecture and clean code practices.',
        )
    fp_reg.faculty_enrollment_number = generate_faculty_enrollment('F023', 'CS')
    fp_reg.institutional_email = 'deepa.nair@veritasgrove.edu'
    fp_reg.save()
    print(f"  ✅ Regular Faculty: deepa.nair@veritasgrove.edu / faculty123  |  Enroll: {fp_reg.faculty_enrollment_number}")

    # ─── Update existing faculty profiles with enrollment numbers ───
    print("\n  Updating existing faculty profiles with enrollment numbers...")
    updated = 0
    for fp in FacultyProfile.objects.filter(faculty_enrollment_number__isnull=True):
        dept_code = fp.department.code if fp.department else 'GEN'
        fp.faculty_enrollment_number = generate_faculty_enrollment(fp.faculty_id, dept_code)
        if not fp.institutional_email:
            fn = fp.user.first_name or 'faculty'
            ln = fp.user.last_name or fp.faculty_id
            fp.institutional_email = generate_institutional_email(fn, ln)
        fp.save()
        updated += 1
    print(f"  ♻️  Updated {updated} existing faculty profiles with enrollment numbers")

    print("\n" + "=" * 60)
    print("  DONE! All accounts seeded successfully.")
    print("=" * 60)
    print("\n  LOGIN CREDENTIALS:")
    print("  ─────────────────────────────────────────")
    print("  Admin:              admin@veritasgrove.edu / admin123")
    print("  HOD CS + Placement: anil.krishnan@veritasgrove.edu / faculty123")
    print("  Finance Officer:    priya.sharma@veritasgrove.edu / faculty123")
    print("  Warden + Mess:      suresh.menon@veritasgrove.edu / faculty123")
    print("  HOD EC + Exam Ctrl: vikram.pillai@veritasgrove.edu / faculty123")
    print("  Regular Faculty:    deepa.nair@veritasgrove.edu / faculty123")
    print()


if __name__ == '__main__':
    seed()
