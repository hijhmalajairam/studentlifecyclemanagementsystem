import os
import django
import sys
from datetime import timedelta

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from users.models import User
from admission.models import ApplicantProfile, AdmissionApplication, Document
from academics.models import Program

def create_accounts():
    print("Creating test accounts...")
    
    # 1. Completely New Prospective Student
    try:
        User.objects.filter(email='new_prospect@university.edu').delete()
        user1 = User.objects.create_user(
            username='new_prospect',
            email='new_prospect@university.edu',
            password='password123',
            first_name='New',
            last_name='Prospect',
            role='PROSPECTIVE_STUDENT'
        )
        print("Created: new_prospect@university.edu / password123")
    except Exception as e:
        print(f"Error creating user 1: {e}")

    # 2. Prospective Student with Submitted Application and Documents
    try:
        User.objects.filter(email='submitted_prospect@university.edu').delete()
        user2 = User.objects.create_user(
            username='submitted_prospect',
            email='submitted_prospect@university.edu',
            password='password123',
            first_name='Submitted',
            last_name='Prospect',
            role='PROSPECTIVE_STUDENT'
        )
        
        # Create Profile
        profile = ApplicantProfile.objects.create(
            user=user2,
            father_name="Mr. Smith",
            mother_name="Mrs. Smith",
            phone="9998887776",
            city="Mumbai",
            state="Maharashtra"
        )
        
        # Create Application
        program = Program.objects.first()
        app = AdmissionApplication.objects.create(
            profile=profile,
            program=program,
            entry_type='ONLINE',
            tenth_school_name='Some High School',
            tenth_board='CBSE',
            tenth_passing_year=2021,
            tenth_percentage=85.5,
            status='SUBMITTED'
        )
        
        # Create Documents
        Document.objects.create(
            application=app,
            document_name='10th Marksheet',
            file='documents/fake_10th.pdf',
            status='VERIFIED'
        )
        Document.objects.create(
            application=app,
            document_name='Aadhar Card',
            file='documents/fake_aadhar.pdf',
            status='PENDING'
        )
        print("Created: submitted_prospect@university.edu / password123")
    except Exception as e:
        print(f"Error creating user 2: {e}")

if __name__ == '__main__':
    create_accounts()
