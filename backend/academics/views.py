from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Enrollment, Course, SemesterRegistration, Attendance, Leave, Result,
    Fee, Timetable, Notification, RevaluationRequest, TransferRequest, NoDues
)
from .serializers import (
    DepartmentSerializer, ProgramSerializer, EnrollmentSerializer, CourseSerializer, SemesterRegistrationSerializer,
    AttendanceSerializer, LeaveSerializer, ResultSerializer,
    FeeSerializer, TimetableSerializer, NotificationSerializer,
    RevaluationRequestSerializer, TransferRequestSerializer, NoDuesSerializer
)
from admission.models import AdmissionApplication
from .models import Department, Program
import uuid
from decimal import Decimal
from django.utils import timezone

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.select_related('department').all()
    serializer_class = ProgramSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

import uuid
from decimal import Decimal
from django.utils import timezone


def get_target_user(user):
    if user.role == 'PARENT' and user.student:
        return user.student
    return user


GRADE_POINTS = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
}


def calculate_gpa(results_qs):
    """Calculate GPA from a queryset of Result objects."""
    total_credits = 0
    total_points = 0
    for r in results_qs.select_related('course'):
        credits = r.course.credits
        gp = GRADE_POINTS.get(r.grade, 0)
        total_credits += credits
        total_points += credits * gp
    if total_credits == 0:
        return 0.0
    return round(total_points / total_credits, 2)


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.select_related('user').all()
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.action in ['pay_fee', 'my_enrollment']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['post'])
    def pay_fee(self, request):
        try:
            app = AdmissionApplication.objects.get(profile__user=request.user)
        except AdmissionApplication.DoesNotExist:
            return Response({"detail": "No application found."}, status=status.HTTP_404_NOT_FOUND)

        if app.status not in ['SELECTED', 'FEE_PENDING']:
            return Response({"detail": "Your application is not pending fee payment."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate Enrollment
        enrollment_num = f"ENR-{uuid.uuid4().hex[:8].upper()}"
        if app.documents.count() == 0:
            return Response({"detail": "Please upload your documents first."}, status=status.HTTP_400_BAD_REQUEST)
        unverified = app.documents.exclude(status='VERIFIED')
        if unverified.exists():
            return Response({"detail": "All your documents must be verified before you can pay the fee."}, status=status.HTTP_400_BAD_REQUEST)

        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            defaults={
                'enrollment_number': f"ENR-{uuid.uuid4().hex[:8].upper()}",
                'fee_paid': True
            }
        )

        if not created and not enrollment.fee_paid:
            enrollment.fee_paid = True
            enrollment.save()

        if request.user.role == 'PROSPECTIVE_STUDENT':
            request.user.role = 'STUDENT'
            request.user.save(update_fields=['role'])

        # Create a welcome notification
        Notification.objects.create(
            user=request.user,
            title='Welcome to the University!',
            message=f'Your enrollment number is {enrollment.enrollment_number}. You can now register for courses.',
            notification_type='SUCCESS'
        )

        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_enrollment(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            serializer = self.get_serializer(enrollment)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled yet."}, status=status.HTTP_404_NOT_FOUND)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]


class SemesterRegistrationViewSet(viewsets.ModelViewSet):
    queryset = SemesterRegistration.objects.prefetch_related('courses').all()
    serializer_class = SemesterRegistrationSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        enrollment = Enrollment.objects.get(user=self.request.user)
        try:
            app = AdmissionApplication.objects.get(profile__user=self.request.user)
            default_semester = 3 if app.entry_type == 'LATERAL' else 1
        except AdmissionApplication.DoesNotExist:
            default_semester = 1

        semester = self.request.data.get('semester', default_semester)
        serializer.save(enrollment=enrollment, semester=int(semester))

    @action(detail=False, methods=['get'])
    def my_registrations(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            registrations = SemesterRegistration.objects.filter(enrollment=enrollment).prefetch_related('courses')
            serializer = self.get_serializer(registrations, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled yet."}, status=status.HTTP_404_NOT_FOUND)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('enrollment', 'course').all()
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.action in ['my_attendance']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def my_attendance(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled yet."}, status=status.HTTP_404_NOT_FOUND)

        attendance_records = Attendance.objects.filter(enrollment=enrollment).select_related('course')

        summary = {}
        for record in attendance_records:
            cid = record.course.id
            if cid not in summary:
                summary[cid] = {
                    'course_code': record.course.code,
                    'course_name': record.course.name,
                    'total': 0,
                    'present': 0,
                }
            summary[cid]['total'] += 1
            if record.status == 'PRESENT':
                summary[cid]['present'] += 1

        result = []
        for v in summary.values():
            v['percentage'] = round((v['present'] / v['total']) * 100, 1) if v['total'] > 0 else 0
            v['warning'] = v['percentage'] < 75
            result.append(v)

        return Response(result)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        course_id = request.data.get('course_id')
        date = request.data.get('date')
        students = request.data.get('students', [])

        if not course_id or not date:
            return Response({"detail": "course_id and date are required."}, status=status.HTTP_400_BAD_REQUEST)

        created_count = 0
        for student in students:
            _, created = Attendance.objects.update_or_create(
                course_id=course_id,
                date=date,
                enrollment_id=student['enrollment_id'],
                defaults={'status': student['status']}
            )
            created_count += 1

        return Response({"detail": f"Attendance marked for {created_count} students."})


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
                sem_results = results.filter(course_id__in=course_ids, is_backlog=False)
                sgpa_data[reg.semester] = calculate_gpa(sem_results)

            cgpa = calculate_gpa(results.filter(is_backlog=False))

            return Response({
                'results': serializer.data,
                'sgpa': sgpa_data,
                'cgpa': cgpa,
            })
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


class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.select_related('course', 'faculty').all()
    serializer_class = TimetableSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_timetable']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def my_timetable(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            registrations = SemesterRegistration.objects.filter(enrollment=enrollment)
            course_ids = set()
            for reg in registrations:
                course_ids.update(reg.courses.values_list('id', flat=True))
            slots = Timetable.objects.filter(course_id__in=course_ids).select_related('course', 'faculty')
            serializer = self.get_serializer(slots, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled yet.'}, status=status.HTTP_404_NOT_FOUND)


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


class RevaluationRequestViewSet(viewsets.ModelViewSet):
    queryset = RevaluationRequest.objects.select_related('result__course', 'result__enrollment').all()
    serializer_class = RevaluationRequestSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_revaluations']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save()

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

from .models import DisciplinaryCase, Internship, InternalAssessment, InternshipWindow
from .serializers import DisciplinaryCaseSerializer, InternshipSerializer, InternalAssessmentSerializer, InternshipWindowSerializer
from users.permissions import IsAdminOrCommittee

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


class InternshipWindowViewSet(viewsets.ModelViewSet):
    queryset = InternshipWindow.objects.all()
    serializer_class = InternshipWindowSerializer


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
