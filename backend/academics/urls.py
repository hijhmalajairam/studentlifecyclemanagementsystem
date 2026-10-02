from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, ProgramViewSet, EnrollmentViewSet, CourseViewSet, CourseSectionViewSet, SemesterRegistrationViewSet,
    AttendanceViewSet, LeaveViewSet, ResultViewSet,
    FeeViewSet, TimetableViewSet, NotificationViewSet,
    RevaluationRequestViewSet, TransferRequestViewSet, NoDuesViewSet,
    DisciplinaryCaseViewSet, InternshipViewSet, FacultyProfileViewSet, StudentProfileViewSet,
    CompanyViewSet, FacultyInternshipOpportunityViewSet, InternshipDocumentViewSet,
    InternshipWindowViewSet, InternalAssessmentViewSet, CourseGradingSchemeViewSet
)
from .views.placements import AIPlacementViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'enrollment', EnrollmentViewSet, basename='enrollment')
router.register(r'courses', CourseViewSet)
router.register(r'course-sections', CourseSectionViewSet)
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
router.register(r'faculty', FacultyProfileViewSet)
router.register(r'student-profiles', StudentProfileViewSet, basename='student-profiles')
router.register(r'placements', AIPlacementViewSet, basename='placements')
router.register(r'companies', CompanyViewSet)
router.register(r'faculty-opportunities', FacultyInternshipOpportunityViewSet)
router.register(r'internship-documents', InternshipDocumentViewSet)
router.register(r'internship-windows', InternshipWindowViewSet)
router.register(r'internal-assessments', InternalAssessmentViewSet)
router.register(r'course-grading-schemes', CourseGradingSchemeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
