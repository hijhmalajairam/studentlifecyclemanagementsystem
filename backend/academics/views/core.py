from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models as db_models
from .utils import get_target_user, calculate_gpa
from ..models import AcademicTerm, Department, Course, CourseSection, Program
from ..serializers import DepartmentSerializer, AcademicTermSerializer, CourseSerializer, ProgramSerializer, CourseSectionSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.select_related('department').all()
    serializer_class = ProgramSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

from django.utils import timezone


def get_target_user(user):
    if user.role == 'PARENT' and user.student:
        return user.student
    return user


GRADE_POINTS = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
}


def calculate_gpa(results_qs):
    """Calculate GPA from an iterable of Result objects, taking highest grade per course."""
    best_results = {}
    for r in results_qs:
        gp = GRADE_POINTS.get(r.grade, 0)
        course_id = r.course_id if hasattr(r, 'course_id') else r.course.id
        credits = r.course.credits
        if course_id not in best_results or gp > best_results[course_id]['gp']:
            best_results[course_id] = {'credits': credits, 'gp': gp}
            
    total_credits = 0
    total_points = 0
    for data in best_results.values():
        total_credits += data['credits']
        total_points += data['credits'] * data['gp']
        
    if total_credits == 0:
        return 0.0
    return round(total_points / total_credits, 2)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

class AcademicTermViewSet(viewsets.ModelViewSet):
    queryset = AcademicTerm.objects.all()
    serializer_class = AcademicTermSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CourseSectionViewSet(viewsets.ModelViewSet):
    queryset = CourseSection.objects.select_related('course', 'academic_term').all()
    serializer_class = CourseSectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
