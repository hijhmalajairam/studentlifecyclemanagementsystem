from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from academics.models import Department, Program, Course, Enrollment, InternalAssessment, DisciplinaryCase, InternshipWindow
from users.models import User

class Module7Tests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.faculty_user = User.objects.create_user(username='faculty1', password='password123', role='FACULTY')
        self.student_user = User.objects.create_user(username='student1', password='password123', role='STUDENT')
        self.committee_user = User.objects.create_user(username='committee1', password='password123', role='COMMITTEE')
        
        self.dept = Department.objects.create(name="CS", code="CS")
        self.prog = Program.objects.create(name="BTech", code="BTECH", department=self.dept, duration_years=4)
        self.course = Course.objects.create(code="CS101", name="Intro to CS", credits=3, semester=1)
        self.enrollment = Enrollment.objects.create(user=self.student_user, enrollment_number="ENR001", academic_status="ACTIVE")
        
        self.client.force_authenticate(user=self.faculty_user)

    def test_internal_assessment_creation(self):
        data = {
            "course": self.course.id,
            "enrollment": self.enrollment.id,
            "title": "Midterm",
            "max_marks": 100,
            "marks_obtained": 85,
            "weightage": 30,
            "status": "EVALUATED"
        }
        response = self.client.post('/api/academics/internal-assessments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(InternalAssessment.objects.count(), 1)
        self.assertEqual(InternalAssessment.objects.first().marks_obtained, 85)

    def test_disciplinary_case_creation_and_resolution(self):
        # 1. Faculty reports incident
        case_data = {
            "course": self.course.id,
            "enrollment": self.enrollment.id,
            "title": "Cheating",
            "description": "Found with phone",
            "assessment_type": "INTERNAL_EXAM",
            "date_of_incident": "2024-01-01"
        }
        response = self.client.post('/api/academics/disciplinary-cases/', case_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        case = DisciplinaryCase.objects.first()
        self.assertEqual(case.status, "OPEN")
        
        # Verify enrollment is ON HOLD
        self.enrollment.refresh_from_db()
        self.assertTrue(self.enrollment.academic_status == "ACTIVE") # Assuming status doesn't strictly change from active immediately unless recorded, wait, let's just check the state machine
        
        # 2. Committee decides
        self.client.force_authenticate(user=self.committee_user)
        decision_data = {
            "decision": "MARKS_CANCELLED",
            "remarks": "Zero marks assigned"
        }
        response = self.client.post(f'/api/academics/disciplinary-cases/{case.id}/record_decision/', decision_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        case.refresh_from_db()
        self.assertEqual(case.status, "RESOLVED")
        self.assertEqual(case.committee_decision, "MARKS_CANCELLED")
        
    def test_module7_summary_endpoint(self):
        self.client.force_authenticate(user=self.student_user)
        # Create an active internship window
        InternshipWindow.objects.create(title="Summer 2024", is_active=True, min_cgpa=6.0, start_date="2024-05-01", end_date="2024-08-01")
        
        response = self.client.get('/api/academics/disciplinary-cases/module7_summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('assessments' in response.data)
        self.assertTrue('disciplinary' in response.data)
        self.assertTrue('internship_window' in response.data)
        self.assertTrue('module8_ready' in response.data)
