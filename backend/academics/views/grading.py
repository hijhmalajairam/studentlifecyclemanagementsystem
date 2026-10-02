from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models as db_models
from .utils import get_target_user, calculate_gpa
from ..models import RevaluationRequest, Result, Enrollment, SemesterRegistration
from ..serializers import ResultSerializer, RevaluationRequestSerializer

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.select_related('enrollment', 'course').all()
    serializer_class = ResultSerializer

    def get_permissions(self):
        if self.action in ['my_results']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def my_results(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            results = Result.objects.filter(enrollment=enrollment).select_related('course')
            serializer = self.get_serializer(results, many=True)

            # Calculate SGPA per semester and CGPA
            registrations = SemesterRegistration.objects.filter(enrollment=enrollment)
            sgpa_data = {}
            for reg in registrations:
                course_ids = reg.courses.values_list('id', flat=True)
                sem_results = [r for r in results if r.course_id in course_ids]
                sgpa_data[reg.semester] = calculate_gpa(sem_results)

            cgpa = calculate_gpa(results)

            return Response({
                'results': serializer.data,
                'sgpa': sgpa_data,
                'cgpa': cgpa,
            })
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled yet.'}, status=status.HTTP_404_NOT_FOUND)

class RevaluationRequestViewSet(viewsets.ModelViewSet):
    queryset = RevaluationRequest.objects.select_related('result__course', 'result__enrollment').all()
    serializer_class = RevaluationRequestSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_revaluations']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        instance = serializer.save()
        # If admin marks it as completed and provides new grades, update the actual result
        if instance.status == 'COMPLETED' and instance.new_marks is not None and instance.new_grade:
            result = instance.result
            result.marks_obtained = instance.new_marks
            result.grade = instance.new_grade
            result.is_revaluation = True
            result.save(update_fields=['marks_obtained', 'grade', 'is_revaluation'])

    @action(detail=False, methods=['get'])
    def my_revaluations(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            revals = RevaluationRequest.objects.filter(
                result__enrollment=enrollment
            ).select_related('result__course')
            serializer = self.get_serializer(revals, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled yet.'}, status=status.HTTP_404_NOT_FOUND)

from ..models import InternalAssessment, CourseGradingScheme
from ..serializers import InternalAssessmentSerializer, CourseGradingSchemeSerializer

class InternalAssessmentViewSet(viewsets.ModelViewSet):
    queryset = InternalAssessment.objects.all()
    serializer_class = InternalAssessmentSerializer

    @action(detail=False, methods=['get'])
    def my_assessments(self, request):
        try:
            enrollment = Enrollment.objects.get(user=request.user)
            assessments = InternalAssessment.objects.filter(enrollment=enrollment)
            serializer = self.get_serializer(assessments, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled."}, status=400)



class CourseGradingSchemeViewSet(viewsets.ModelViewSet):
    queryset = CourseGradingScheme.objects.all()
    serializer_class = CourseGradingSchemeSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        scheme = self.get_object()
        scheme.status = 'FINALIZED'
        scheme.finalized_by = request.user
        scheme.mean = request.data.get('mean', scheme.mean)
        scheme.std_dev = request.data.get('std_dev', scheme.std_dev)
        scheme.save()
        return Response({'status': 'Grading scheme finalized and sent for approval.'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'DIRECTOR']:
            return Response({'detail': 'Permission denied.'}, status=403)
        scheme = self.get_object()
        scheme.status = 'APPROVED'
        scheme.approved_by = request.user
        scheme.save()
        return Response({'status': 'Grading scheme approved.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'DIRECTOR']:
            return Response({'detail': 'Permission denied.'}, status=403)
        scheme = self.get_object()
        scheme.status = 'REJECTED'
        scheme.save()
        return Response({'status': 'Grading scheme rejected.'})
