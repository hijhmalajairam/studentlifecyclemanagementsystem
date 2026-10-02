import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from users.models import User
from academics.models import StudentProfile, Program, Enrollment
from django.utils import timezone
from datetime import timedelta

# Create or get user
user, created = User.objects.get_or_create(
    username='student@example.com',
    defaults={
        'email': 'student@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'role': 'STUDENT',
    }
)

if not created:
    user.role = 'STUDENT'
user.set_password('student123')
user.save()

# Get an existing program
program = Program.objects.first()

# Create enrollment
enrollment, _ = Enrollment.objects.get_or_create(
    user=user,
    defaults={
        'enrollment_number': 'ENR2025001',
        'program': program,
        'status': 'ACTIVE',
        'admission_date': timezone.now().date(),
        'current_semester': 1
    }
)

# Create profile
profile, _ = StudentProfile.objects.get_or_create(
    user=user,
    defaults={
        'enrollment': enrollment,
        'dob': (timezone.now() - timedelta(days=20*365)).date(),
        'gender': 'MALE',
        'blood_group': 'O+',
        'mobile_no': '9876543210',
        'nationality': 'Indian',
        'category': 'General',
        'father_name': 'Richard Doe',
        'class_10_percentage': 92.5,
        'class_12_percentage': 89.0
    }
)

print(f"Created/Updated student account:")
print(f"Username: {user.username}")
print(f"Password: student123")
