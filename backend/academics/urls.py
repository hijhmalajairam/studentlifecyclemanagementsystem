from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EnrollmentViewSet, CourseViewSet, SemesterRegistrationViewSet,
    AttendanceViewSet, LeaveViewSet, ResultViewSet,
    FeeViewSet, TimetableViewSet, NotificationViewSet,
    RevaluationRequestViewSet, TransferRequestViewSet, NoDuesViewSet,
    DisciplinaryCaseViewSet, InternshipViewSet
)

router = DefaultRouter()
router.register(r'enrollment', EnrollmentViewSet, basename='enrollment')
router.register(r'courses', CourseViewSet)
router.register(r'registrations', SemesterRegistrationViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'leaves', LeaveViewSet)
router.register(r'results', ResultViewSet)
router.register(r'fees', FeeViewSet)
router.register(r'timetable', TimetableViewSet)
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'revaluations', RevaluationRequestViewSet)
router.register(r'transfers', TransferRequestViewSet)
router.register(r'no-dues', NoDuesViewSet)
router.register(r'disciplinary-cases', DisciplinaryCaseViewSet)
router.register(r'internships', InternshipViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
