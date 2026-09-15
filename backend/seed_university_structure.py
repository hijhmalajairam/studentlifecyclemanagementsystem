import os
import django
import random
from faker import Faker

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_core.settings')
django.setup()

from django.contrib.auth import get_user_model
from academics.models import Department, FacultyProfile

User = get_user_model()
fake = Faker('en_IN')

DEPARTMENTS = [
    {'code': 'CSE', 'name': 'Computer Science and Engineering'},
    {'code': 'ECE', 'name': 'Electronics and Communication'},
    {'code': 'DSAI', 'name': 'Data Science and Artificial Intelligence'},
    {'code': 'BSC', 'name': 'Basic Sciences'},
]

ROLES_POOL = [
    'DEAN_ENGINEERING', 'DEAN_STUDENT_AFFAIRS', 'BATCH_COORDINATOR',
    'CONTROLLER_OF_EXAMINATIONS', 'EXAM_SQUAD', 'CURRICULUM_COMMITTEE',
    'CHIEF_WARDEN', 'HOSTEL_WARDEN', 'DISCIPLINARY_HEAD', 'ANTI_RAGGING_COMMITTEE',
    'SPORTS_DIRECTOR', 'CULTURAL_CONVENER', 'PLACEMENT_DIRECTOR', 'ALUMNI_RELATIONS',
    'INDUSTRY_TIEUP_INCHARGE', 'LAB_INCHARGE', 'RESEARCH_GRANT_COORDINATOR'
]

def seed():
    print("🌱 Seeding University Structure...")

    # 1. Create Departments
    dept_objs = {}
    for d in DEPARTMENTS:
        dept, created = Department.objects.get_or_create(code=d['code'], defaults={'name': d['name']})
        dept_objs[d['code']] = dept
        print(f"  🏢 Department ready: {dept.name}")

    # 2. Create 60 Faculty Members (15 per department)
    print("\n👨‍🏫 Recruiting 60 Faculty Members...")
    
    total_faculty_created = 0
    faculty_list = []

    for dept_code, dept in dept_objs.items():
        for i in range(15):
            first_name = fake.first_name()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}{i}@veritasgrove.edu"
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': 'FACULTY',
                    'additional_roles': []
                }
            )
            
            if created:
                user.set_password('faculty123')
                user.save()

            # Create Faculty Profile
            designations = ['Assistant Professor', 'Associate Professor', 'Professor']
            FacultyProfile.objects.get_or_create(
                user=user,
                defaults={
                    'department': dept,
                    'faculty_id': f"F-{dept_code[:2]}-{100 + i}",
                    'designation': random.choice(designations),
                    'specialization': fake.job(),
                    'years_of_experience': random.randint(1, 20)
                }
            )
            faculty_list.append(user)
            total_faculty_created += 1

    print(f"  ✅ {total_faculty_created} Faculty created.")

    # 3. Assign Leadership Roles (HODs)
    print("\n👑 Assigning Leadership & Additional Roles...")
    for dept_code, dept in dept_objs.items():
        # Pick a random professor for HOD
        hod_user = FacultyProfile.objects.filter(department=dept).first().user
        current_roles = hod_user.additional_roles or []
        if f'HOD_{dept_code}' not in current_roles:
            current_roles.append(f'HOD_{dept_code}')
            hod_user.additional_roles = current_roles
            hod_user.save()
        print(f"  🎖️ {hod_user.first_name} {hod_user.last_name} appointed as HOD of {dept_code}")

    # 4. Assign random secondary roles to ~30% of the remaining faculty
    for user in faculty_list:
        if random.random() < 0.3: # 30% chance
            num_roles = random.randint(1, 3)
            assigned_roles = random.sample(ROLES_POOL, num_roles)
            
            current_roles = user.additional_roles or []
            new_roles = list(set(current_roles + assigned_roles))
            user.additional_roles = new_roles
            user.save()

    print("\n✅ University Seeded Successfully!")
    print("Login with any faculty email (e.g., check database) and password 'faculty123'")

if __name__ == '__main__':
    seed()
