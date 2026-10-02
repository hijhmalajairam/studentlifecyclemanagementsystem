import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from users.models import User
from academics.models import Department
from academics.models.profiles import FacultyProfile

def create_mithal():
    # 1. Ensure Mathematics department exists
    dept, created = Department.objects.get_or_create(
        name="Mathematics",
        defaults={
            "code": "MATH",
            "description": "Department of Mathematics"
        }
    )
    
    # 2. Create the User
    user, created = User.objects.get_or_create(
        username='mithal_jattu',
        defaults={
            'email': 'mithal@veritas.edu',
            'first_name': 'Mithal',
            'last_name': 'Jattu',
            'role': 'FACULTY',
            'additional_roles': ['INTERVIEWER', 'DEAN']
        }
    )
    if not created:
        user.role = 'FACULTY'
        user.additional_roles = ['INTERVIEWER', 'DEAN']
        user.first_name = 'Mithal'
        user.last_name = 'Jattu'
    user.set_password('password123')
    user.save()
    
    # 3. Create the FacultyProfile
    profile, p_created = FacultyProfile.objects.get_or_create(
        user=user,
        defaults={
            'faculty_id': 'FAC-MATH01',
            'faculty_enrollment_number': 'ENR-MATH01',
            'institutional_email': 'mithal@veritas.edu',
            'department': dept,
            'designation': 'Professor',
            'admin_role': 'Dean',
            'highest_qualification': 'Ph.D. in Mathematics',
            'specialization': 'Applied Mathematics',
            'years_of_experience': 10
        }
    )
    if not p_created:
        profile.faculty_id = 'FAC-MATH01'
        profile.faculty_enrollment_number = 'ENR-MATH01'
        profile.department = dept
        profile.admin_role = 'Dean'
        profile.save()

    print(f"Created Mithal Jattu! Username: {user.username}, Roles: {user.role}, {user.additional_roles}")

create_mithal()
