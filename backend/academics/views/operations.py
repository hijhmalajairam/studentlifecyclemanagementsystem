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
    @action(detail=True, methods=['post'])
    def issue_certificate(self, request, pk=None):
        transfer_request = self.get_object()

        no_dues = NoDues.objects.filter(
            enrollment=transfer_request.enrollment
        ).first()

        if not no_dues or not no_dues.all_cleared:
            return Response(
                {
                    'detail': 'Certificate cannot be issued until all no-dues requirements are cleared.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        certificate_type = request.data.get('certificate_type')

        if certificate_type not in ['TC', 'MIGRATION']:
            return Response(
                {
                    'detail': 'certificate_type must be TC or MIGRATION.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        import uuid

        transfer_request.certificate_type = certificate_type
        transfer_request.certificate_number = (
            f"{certificate_type}-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"
        )
        transfer_request.certificate_issued = True
        transfer_request.certificate_issued_date = timezone.now().date()

        transfer_request.save()

        return Response(
            self.get_serializer(transfer_request).data,
            status=status.HTTP_200_OK
        )
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


from ..models import DisciplinaryCase, Internship, Company, InternshipAuditLog, InternshipWindow, FacultyInternshipOpportunity, InternshipDocument
from ..serializers import DisciplinaryCaseSerializer, InternshipSerializer, CompanySerializer, InternshipAuditLogSerializer, InternshipWindowSerializer, FacultyInternshipOpportunitySerializer, InternshipDocumentSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from users.permissions import IsAdminOrCommittee, IsFacultyRole

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

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrCommittee])
    def record_decision(self, request, pk=None):
        case = self.get_object()
        decision = request.data.get('decision')
        remarks = request.data.get('remarks', '')

        if decision not in ['CLEARED', 'MARKS_CANCELLED', 'SUSPENSION_YEAR_DROP']:
            return Response({"detail": "Invalid decision."}, status=400)

        case.committee_decision = decision
        case.committee_remarks = remarks
        case.status = 'RESOLVED'
        case.reviewed_by = request.user
        case.reviewed_at = timezone.now()
        case.save()

        enrollment = case.enrollment

        if decision == 'CLEARED':
            if enrollment.academic_status == 'DISCIPLINARY_HOLD':
                enrollment.academic_status = 'ACTIVE'
                enrollment.save()
            Notification.objects.create(
                user=enrollment.user,
                title='Disciplinary Case Cleared',
                message='Your disciplinary case has been cleared. You can proceed to examinations.',
                notification_type='SUCCESS'
            )
        elif decision == 'MARKS_CANCELLED':
            if enrollment.academic_status == 'DISCIPLINARY_HOLD':
                enrollment.academic_status = 'ACTIVE'
                enrollment.save()
            if case.course:
                Result.objects.update_or_create(
                    enrollment=enrollment,
                    course=case.course,
                    is_backlog=True,
                    is_revaluation=False,
                    defaults={
                        'marks_obtained': Decimal('0.00'),
                        'grade': 'F'
                    }
                )
            Notification.objects.create(
                user=enrollment.user,
                title='Marks Cancelled',
                message='Your marks have been cancelled for the reported incident. You will need to take the backlog path.',
                notification_type='ALERT'
            )
        elif decision == 'SUSPENSION_YEAR_DROP':
            enrollment.academic_status = 'DROPOUT'
            enrollment.save()
            Notification.objects.create(
                user=enrollment.user,
                title='Suspension / Year Drop',
                message='You have been suspended for a year due to disciplinary actions.',
                notification_type='ALERT'
            )

        return Response(self.get_serializer(case).data)

    @action(detail=False, methods=['get'])
    def module7_summary(self, request):
        try:
            enrollment = Enrollment.objects.get(user=request.user)
            
            assessments = InternalAssessment.objects.filter(enrollment=enrollment)
            cases = DisciplinaryCase.objects.filter(enrollment=enrollment)
            active_cases = cases.exclude(status='RESOLVED')
            
            has_malpractice = cases.exists()
            on_hold = enrollment.academic_status == 'DISCIPLINARY_HOLD' or active_cases.exists()
            
            window = InternshipWindow.objects.filter(is_active=True).first()
            
            summary = {
                'assessments': InternalAssessmentSerializer(assessments, many=True).data,
                'disciplinary': {
                    'has_malpractice': has_malpractice,
                    'on_hold': on_hold,
                    'cases': DisciplinaryCaseSerializer(cases, many=True).data,
                    'academic_status': enrollment.academic_status
                },
                'internship_window': InternshipWindowSerializer(window).data if window else None,
                'module8_ready': not on_hold and enrollment.academic_status == 'ACTIVE' and window is not None
            }
            return Response(summary)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled."}, status=400)



class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]


class FacultyInternshipOpportunityViewSet(viewsets.ModelViewSet):
    queryset = FacultyInternshipOpportunity.objects.all()
    serializer_class = FacultyInternshipOpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['company', 'faculty_creator', 'is_active']
    search_fields = ['role', 'company__name', 'location']

    def perform_create(self, serializer):
        serializer.save(faculty_creator=self.request.user)


class InternshipDocumentViewSet(viewsets.ModelViewSet):
    queryset = InternshipDocument.objects.all()
    serializer_class = InternshipDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['internship', 'document_type']


class InternshipViewSet(viewsets.ModelViewSet):
    queryset = Internship.objects.all()
    serializer_class = InternshipSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'company', 'enrollment', 'internship_type']
    search_fields = ['company_name', 'role', 'enrollment__enrollment_number', 'enrollment__user__first_name', 'enrollment__user__last_name']
    ordering_fields = ['start_date', 'end_date', 'applied_date', 'created_at']

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        try:
            target_user = get_target_user(self.request.user)
            enrollment = Enrollment.objects.get(user=target_user)

            # Mutual Exclusion Check
            active_states = ['DRAFT', 'SUBMITTED', 'PENDING', 'CHANGES_REQUIRED', 'RESUBMITTED', 'APPROVED', 'ASSIGNED', 'ACTIVE']
            if Internship.objects.filter(enrollment=enrollment, status__in=active_states).exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"detail": "You already have an active or pending internship. You cannot apply for or submit another."})

            internship = serializer.save(enrollment=enrollment, status='DRAFT')
            InternshipAuditLog.objects.create(
                internship=internship,
                user=self.request.user,
                action='DRAFT_CREATED',
                remarks='Internship application draft created.'
            )
        except Enrollment.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Not enrolled yet."})

    @action(detail=False, methods=['post'])
    def assign_to_student(self, request):
        if request.user.role != 'FACULTY':
            return Response({"detail": "Only faculty can assign internships."}, status=status.HTTP_403_FORBIDDEN)
        
        enrollment_number = request.data.get('enrollment_number')
        if not enrollment_number:
            return Response({"detail": "Enrollment number is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            enrollment = Enrollment.objects.get(enrollment_number=enrollment_number)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)
            
        # Mutual Exclusion Check
        active_states = ['DRAFT', 'SUBMITTED', 'PENDING', 'CHANGES_REQUIRED', 'RESUBMITTED', 'APPROVED', 'ASSIGNED', 'ACTIVE']
        if Internship.objects.filter(enrollment=enrollment, status__in=active_states).exists():
            return Response({"detail": "This student already has an internship and cannot be assigned another internship."}, status=status.HTTP_400_BAD_REQUEST)
            
        company_id = request.data.get('company_id')
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response({"detail": "Company not found."}, status=status.HTTP_404_NOT_FOUND)
            
        internship = Internship.objects.create(
            enrollment=enrollment,
            company=company,
            company_name=company.name,
            role=request.data.get('role', ''),
            start_date=request.data.get('start_date'),
            end_date=request.data.get('end_date'),
            stipend=request.data.get('stipend', 0),
            location=request.data.get('location', ''),
            work_mode=request.data.get('work_mode', 'ONSITE'),
            description=request.data.get('description', ''),
            status='ASSIGNED'
        )
        
        InternshipAuditLog.objects.create(
            internship=internship,
            user=request.user,
            action='ASSIGNED_BY_FACULTY',
            remarks=f"Internship assigned by faculty {request.user.first_name} {request.user.last_name}"
        )
        
        serializer = self.get_serializer(internship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    @action(detail=True, methods=['post'])
    def accept_assignment(self, request, pk=None):
        internship = self.get_object()
        
        if internship.status != 'ASSIGNED':
            return Response({"detail": "Only ASSIGNED internships can be accepted."}, status=status.HTTP_400_BAD_REQUEST)
            
        if internship.enrollment.user != request.user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            
        internship.status = 'SUBMITTED' # Submitted for faculty to review documents if they want
        internship.save()
        
        InternshipAuditLog.objects.create(
            internship=internship,
            user=request.user,
            action='ASSIGNMENT_ACCEPTED',
            remarks="Student accepted the faculty-assigned internship."
        )
        
        return Response({"detail": "Internship accepted."})

    @action(detail=False, methods=['get'])
    def my_internships(self, request):
        try:
            enrollment = Enrollment.objects.get(user=request.user)
            internships = Internship.objects.filter(enrollment=enrollment)
            serializer = self.get_serializer(internships, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled."}, status=400)

    @action(detail=False, methods=['post'])
    def waive_internship(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled yet."}, status=status.HTTP_404_NOT_FOUND)

        # Assuming business logic dictates if they can waive it manually or if it's automatic.
        # Here we allow them to request a waiver which sets it.
        enrollment.internship_waived = True
        enrollment.save()

        internship = Internship.objects.create(
            enrollment=enrollment,
            company_name="Waived",
            role="N/A",
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            status='WAIVED'
        )
        InternshipAuditLog.objects.create(
            internship=internship,
            user=request.user,
            action='WAIVED',
            remarks='Internship requirement waived.'
        )

        return Response({"detail": "Internship has been waived and flagged in academic profile."})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        internship = self.get_object()
        status_val = request.data.get('status')
        remarks = request.data.get('remarks', '')
        
        # Enforce faculty role for approvals and changes
        if status_val in ['APPROVED', 'REJECTED', 'CHANGES_REQUIRED', 'COMPLETED']:
            if not request.user.is_staff and request.user.role not in ['ADMIN', 'FACULTY']:
                return Response({"detail": "Permission denied. Only Faculty or Admin can perform this action."}, status=status.HTTP_403_FORBIDDEN)
        
        if status_val not in dict(Internship.STATUS_CHOICES):
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = internship.status
        internship.status = status_val
        
        if status_val == 'SUBMITTED':
            Notification.objects.create(
                user=internship.enrollment.user,
                title="Internship Application Submitted",
                message=f"Your internship application for {internship.company_name or 'a company'} has been submitted."
            )
            # Notify faculty (placeholder - assuming all faculty get it or assigned faculty)
            # We'll just notify the student for now
            
        elif status_val == 'APPROVED':
            internship.approved_date = timezone.now()
            if 'faculty_mentor' in request.data:
                internship.faculty_mentor_id = request.data['faculty_mentor']
            Notification.objects.create(
                user=internship.enrollment.user,
                title="Internship Approved",
                message=f"Your internship at {internship.company_name or 'the company'} has been APPROVED."
            )
        elif status_val == 'REJECTED':
            internship.rejection_reason = remarks
            Notification.objects.create(
                user=internship.enrollment.user,
                title="Internship Rejected",
                message=f"Your internship at {internship.company_name or 'the company'} was rejected. Reason: {remarks}"
            )
        elif status_val == 'CHANGES_REQUIRED':
            Notification.objects.create(
                user=internship.enrollment.user,
                title="Changes Required for Internship",
                message=f"Faculty requested changes on your application. Comments: {remarks}"
            )
        elif status_val == 'RESUBMITTED':
            Notification.objects.create(
                user=internship.enrollment.user,
                title="Internship Resubmitted",
                message="Your application has been resubmitted for review."
            )
        elif status_val == 'COMPLETED':
            internship.completion_date = timezone.now().date()
            if 'technical_skills_rating' in request.data:
                internship.technical_skills_rating = request.data['technical_skills_rating']
                internship.communication_rating = request.data.get('communication_rating')
                internship.teamwork_rating = request.data.get('teamwork_rating')
                internship.problem_solving_rating = request.data.get('problem_solving_rating')
                internship.professionalism_rating = request.data.get('professionalism_rating')
                internship.attendance_rating = request.data.get('attendance_rating')
                internship.faculty_remarks = request.data.get('faculty_remarks', '')

        internship.save()
        
        InternshipAuditLog.objects.create(
            internship=internship,
            user=request.user,
            action=status_val,
            remarks=remarks
        )
        
        return Response({"detail": f"Internship status updated from {old_status} to {status_val}."})

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        from django.db.models import Avg, Count
        total = Internship.objects.count()
        pending = Internship.objects.filter(status='PENDING').count()
        active = Internship.objects.filter(status='ACTIVE').count()
        completed = Internship.objects.filter(status='COMPLETED').count()
        avg_stipend = Internship.objects.aggregate(Avg('stipend'))['stipend__avg'] or 0
        return Response({
            'total': total,
            'pending': pending,
            'active': active,
            'completed': completed,
            'avg_stipend': float(avg_stipend)
        })

from ..models import CourseGradingScheme
from ..serializers import CourseGradingSchemeSerializer


class InternshipWindowViewSet(viewsets.ModelViewSet):
    queryset = InternshipWindow.objects.all()
    serializer_class = InternshipWindowSerializer


