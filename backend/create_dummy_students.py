import os
import sys
import django
from datetime import date

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from admission.models import AdmissionApplication, SeatAllocation, ApplicantProfile
from academics.models import Department, Program, StudentProfile, Enrollment

User = get_user_model()

d = Department.objects.first()
p = Program.objects.first()

created_count = 0
for i in range(1, 11):
    username = f"student_dummy_{i}"
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': f"{username}@test.com",
            'first_name': f"Dummy{i}",
            'last_name': "Student",
            'role': 'STUDENT'
        }
    )
    if created:
        user.set_password('Student@123')
        user.save()
        created_count += 1
        
    applicant, _ = ApplicantProfile.objects.get_or_create(
        user=user,
        defaults={
            'phone': f"999999990{i}"
        }
    )
    
    app, _ = AdmissionApplication.objects.get_or_create(
        profile=applicant,
        defaults={
            'status': 'ENROLLED',
            'enrollment_number': f"ENR-2026-00{i}",
            'tenth_percentage': 85.0,
            'twelfth_percentage': 88.0,
            'entry_type': 'REGULAR',
            'application_number': f"APP-2026-00{i}"
        }
    )
    if not app.enrollment_number:
        app.status = 'ENROLLED'
        app.enrollment_number = f"ENR-2026-00{i}"
        app.save()

    if d and p:
        SeatAllocation.objects.get_or_create(
            application=app,
            defaults={
                'allocated_department': d.name,
                'allocated_program': p.name,
                'allocated_batch': '2026-2030'
            }
        )
        
    # Create Enrollment
    enrollment, _ = Enrollment.objects.get_or_create(
        user=user,
        defaults={
            'enrollment_number': f"ENR-2026-00{i}",
            'fee_paid': True
        }
    )
        
    # Create StudentProfile
    StudentProfile.objects.get_or_create(
        user=user,
        defaults={
            'enrollment': enrollment,
            'dob': date(2008, 1, 1),
            'blood_group': 'O+'
        }
    )

print(f"Created {created_count} dummy enrolled students with profiles.")
