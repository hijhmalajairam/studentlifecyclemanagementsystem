import django, os
os.environ['DJANGO_SETTINGS_MODULE'] = 'erp_core.settings'
django.setup()

from users.models import User
from academics.models import Department, Course, CourseSection, AcademicTerm, Program, Batch, FacultyProfile, Enrollment, SemesterRegistration
import random

try:
    mj = User.objects.get(username='mithal_jattu')
    profile = FacultyProfile.objects.get(user=mj)
    dept = profile.department
except Exception as e:
    print("User mithal_jattu not found:", e)
    exit()

term, _ = AcademicTerm.objects.get_or_create(term_name='Fall 2026', defaults={'start_date': '2026-08-01', 'end_date': '2026-12-15'})

# Create a couple of courses in Math
course1, _ = Course.objects.get_or_create(code='MATH101', defaults={'name': 'Calculus I', 'department': dept, 'credits': 4, 'semester': 1})
course2, _ = Course.objects.get_or_create(code='MATH201', defaults={'name': 'Linear Algebra', 'department': dept, 'credits': 3, 'semester': 2})

# Assign sections to Mithal
sec1, _ = CourseSection.objects.get_or_create(course=course1, academic_term=term, faculty=mj, defaults={'section_name': 'A', 'capacity': 60})
sec2, _ = CourseSection.objects.get_or_create(course=course2, academic_term=term, faculty=mj, defaults={'section_name': 'B', 'capacity': 40})

print("Created classes for Mithal Jattu.")
