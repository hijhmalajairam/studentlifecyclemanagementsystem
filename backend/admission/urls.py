from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdmissionApplicationViewSet, DocumentViewSet, ScholarshipViewSet, ApplicantProfileViewSet, SeatAllocationViewSet

router = DefaultRouter()
router.register(r'applications', AdmissionApplicationViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'scholarships', ScholarshipViewSet)
router.register(r'profiles', ApplicantProfileViewSet)
router.register(r'allocations', SeatAllocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
