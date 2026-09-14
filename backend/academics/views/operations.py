from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models as db_models
from .utils import get_target_user, calculate_gpa
from ..models import NoDues, TransferRequest, Enrollment, DisciplinaryCase, Fee, Notification, Leave, Internship
from ..serializers import FacultyProfileSerializer, LeaveSerializer, NotificationSerializer, NoDuesSerializer, DisciplinaryCaseSerializer, TransferRequestSerializer, InternshipSerializer, FeeSerializer

class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_leaves']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        enrollment = Enrollment.objects.get(user=self.request.user)
        serializer.save(enrollment=enrollment)

    @action(detail=False, methods=['get'])
    def my_leaves(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            leaves = Leave.objects.filter(enrollment=enrollment)
            serializer = self.get_serializer(leaves, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled yet.'}, status=status.HTTP_404_NOT_FOUND)

class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.select_related('enrollment').all()
    serializer_class = FeeSerializer

    def get_permissions(self):
        if self.action in ['my_fees', 'pay_semester_fee']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def my_fees(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            fees = Fee.objects.filter(enrollment=enrollment).order_by('semester')
            serializer = self.get_serializer(fees, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled yet.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def pay_semester_fee(self, request, pk=None):
        fee = self.get_object()
        if fee.status == 'PAID':
            return Response({'detail': 'Fee already paid.'}, status=status.HTTP_400_BAD_REQUEST)
        fee.status = 'PAID'
        fee.paid_date = timezone.now().date()
        fee.save()
        Notification.objects.create(
            user=fee.enrollment.user,
            title=f'Semester {fee.semester} Fee Paid',
            message=f'Your fee of ₹{fee.net_amount():.2f} for semester {fee.semester} has been received.',
            notification_type='SUCCESS'
        )
        return Response(self.get_serializer(fee).data)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response(NotificationSerializer(notif).data)

class TransferRequestViewSet(viewsets.ModelViewSet):
    queryset = TransferRequest.objects.select_related('enrollment').all()
    serializer_class = TransferRequestSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_requests']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        enrollment = Enrollment.objects.get(user=self.request.user)
        serializer.save(enrollment=enrollment)

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            requests = TransferRequest.objects.filter(enrollment=enrollment)
            serializer = self.get_serializer(requests, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled yet.'}, status=status.HTTP_404_NOT_FOUND)

class NoDuesViewSet(viewsets.ModelViewSet):
    queryset = NoDues.objects.select_related('enrollment').all()
    serializer_class = NoDuesSerializer

    def get_permissions(self):
        if self.action in ['my_status']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def my_status(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            no_dues, _ = NoDues.objects.get_or_create(enrollment=enrollment)
            serializer = self.get_serializer(no_dues)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled yet.'}, status=status.HTTP_404_NOT_FOUND)

from .models import DisciplinaryCase, Internship, FacultyProfile
from .serializers import DisciplinaryCaseSerializer, InternshipSerializer, FacultyProfileSerializer

class DisciplinaryCaseViewSet(viewsets.ModelViewSet):
    queryset = DisciplinaryCase.objects.all()
    serializer_class = DisciplinaryCaseSerializer

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

    @action(detail=False, methods=['get'])
    def my_cases(self, request):
        try:
            enrollment = Enrollment.objects.get(user=request.user)
            cases = DisciplinaryCase.objects.filter(enrollment=enrollment)
            serializer = self.get_serializer(cases, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled."}, status=400)

class InternshipViewSet(viewsets.ModelViewSet):
    queryset = Internship.objects.all()
    serializer_class = InternshipSerializer

    @action(detail=False, methods=['get'])
    def my_internships(self, request):
        try:
            enrollment = Enrollment.objects.get(user=request.user)
            internships = Internship.objects.filter(enrollment=enrollment)
            serializer = self.get_serializer(internships, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled."}, status=400)
