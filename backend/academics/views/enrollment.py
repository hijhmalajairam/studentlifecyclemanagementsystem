from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models as db_models
from admission.models import AdmissionApplication
from users.permissions import IsAdminRole
from .utils import get_target_user, calculate_gpa
from ..models import Enrollment, SemesterRegistration
from ..serializers import SemesterRegistrationSerializer, EnrollmentSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.select_related('user').all()
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.action in ['my_enrollment']:
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]


    @action(detail=False, methods=['get'])
    def my_enrollment(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            serializer = self.get_serializer(enrollment)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled yet."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def progression_audit(self, request):
        from academics.models import Attendance, Fee
        enrollments = Enrollment.objects.filter(academic_status='ACTIVE').select_related('user', 'program').order_by('enrollment_number')
        
        program_id = request.query_params.get('program_id')
        if program_id:
            enrollments = enrollments.filter(program_id=program_id)

        current_sem = request.query_params.get('semester')
        if current_sem:
            enrollments = enrollments.filter(current_semester=int(current_sem))

        audit_data = []
        for e in enrollments:
            att_records = Attendance.objects.filter(enrollment=e)
            total_classes = att_records.count()
            attended = att_records.filter(status__in=['PRESENT', 'EXCUSED']).count()
            att_pct = round((attended / total_classes) * 100, 1) if total_classes > 0 else 100.0
            att_passed = att_pct >= 75.0

            unpaid = Fee.objects.filter(enrollment=e, semester=e.current_semester).exclude(status='PAID').exists()
            fee_passed = not unpaid

            audit_data.append({
                'enrollment_id': e.id,
                'enrollment_number': e.enrollment_number,
                'student_name': e.user.get_full_name() or e.user.username,
                'program_id': e.program_id,
                'program_name': e.program.name if e.program else 'General',
                'program_code': e.program.code if e.program else 'GEN',
                'current_year': e.current_year,
                'current_semester': e.current_semester,
                'target_semester': e.current_semester + 1,
                'target_year': (e.current_semester + 2) // 2,
                'attendance_percentage': att_pct,
                'attendance_passed': att_passed,
                'fee_passed': fee_passed,
                'eligible': att_passed and fee_passed,
            })
        return Response(audit_data)

    @action(detail=True, methods=['post'])
    def progress_semester(self, request, pk=None):
        from academics.models import Course, SemesterRegistration, Fee, Notification, Attendance
        from datetime import timedelta

        enrollment = self.get_object()
        override_checks = request.data.get('override_checks', False)

        if not override_checks:
            att_records = Attendance.objects.filter(enrollment=enrollment)
            total_classes = att_records.count()
            attended = att_records.filter(status__in=['PRESENT', 'EXCUSED']).count()
            att_pct = (attended / total_classes) * 100 if total_classes > 0 else 100.0
            if att_pct < 75.0:
                return Response(
                    {'detail': f'Cannot progress: Student attendance ({att_pct:.1f}%) is below statutory 75% minimum.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            unpaid = Fee.objects.filter(enrollment=enrollment, semester=enrollment.current_semester).exclude(status='PAID').exists()
            if unpaid:
                return Response(
                    {'detail': f'Cannot progress: Term fees for Semester {enrollment.current_semester} are unpaid.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        next_sem = enrollment.current_semester + 1
        next_yr = (next_sem + 1) // 2

        if next_sem > 8:
            enrollment.academic_status = 'GRADUATED'
            enrollment.save()
            Notification.objects.create(
                user=enrollment.user,
                title='Congratulations on Graduation!',
                message='You have completed all 8 academic semesters. Your standing is now GRADUATED.',
                notification_type='SUCCESS'
            )
            return Response({'status': 'GRADUATED', 'detail': 'Student graduated.'})

        enrollment.current_semester = next_sem
        enrollment.current_year = next_yr
        enrollment.save()

        # Auto-create SemesterRegistration with courses for the new semester
        sem_reg, _ = SemesterRegistration.objects.get_or_create(
            enrollment=enrollment,
            semester=next_sem
        )
        new_courses = Course.objects.filter(semester=next_sem)
        if enrollment.program and enrollment.program.department:
            dept_c = Course.objects.filter(department=enrollment.program.department, semester=next_sem)
            if dept_c.exists():
                new_courses = dept_c
        sem_reg.courses.set(new_courses[:5])

        # Generate fee invoice for the new semester (carry over scholarship discount)
        prev_fee = Fee.objects.filter(enrollment=enrollment, semester=next_sem - 1).first()
        discount = prev_fee.scholarship_discount if prev_fee else 0.00
        Fee.objects.get_or_create(
            enrollment=enrollment,
            semester=next_sem,
            defaults={
                'amount': 45000.00,
                'scholarship_discount': discount,
                'status': 'PENDING',
                'due_date': timezone.now().date() + timedelta(days=30)
            }
        )

        suffix = 'st' if next_yr == 1 else 'nd' if next_yr == 2 else 'rd' if next_yr == 3 else 'th'
        Notification.objects.create(
            user=enrollment.user,
            title='Academic Term Promotion Confirmed',
            message=f'Congratulations! You have officially progressed to {next_yr}{suffix} Year, Semester {next_sem}. Your new course curriculum and term fee invoice have been issued.',
            notification_type='SUCCESS'
        )

        return Response({
            'detail': f'Student successfully promoted to Year {next_yr}, Semester {next_sem}.',
            'current_semester': next_sem,
            'current_year': next_yr,
            'courses_registered': sem_reg.courses.count()
        })

    @action(detail=False, methods=['post'])
    def bulk_rollover(self, request):
        from academics.models import Course, SemesterRegistration, Fee, Notification, Attendance
        from datetime import timedelta

        program_id = request.data.get('program_id')
        current_sem = request.data.get('current_semester')
        override_checks = request.data.get('override_checks', False)

        students = Enrollment.objects.filter(academic_status='ACTIVE')
        if program_id:
            students = students.filter(program_id=program_id)
        if current_sem:
            students = students.filter(current_semester=int(current_sem))

        promoted = 0
        skipped = 0

        for e in students:
            if not override_checks:
                att_records = Attendance.objects.filter(enrollment=e)
                total_classes = att_records.count()
                attended = att_records.filter(status__in=['PRESENT', 'EXCUSED']).count()
                att_pct = (attended / total_classes) * 100 if total_classes > 0 else 100.0
                unpaid = Fee.objects.filter(enrollment=e, semester=e.current_semester).exclude(status='PAID').exists()
                if att_pct < 75.0 or unpaid:
                    skipped += 1
                    continue

            next_s = e.current_semester + 1
            next_y = (next_s + 1) // 2
            if next_s > 8:
                e.academic_status = 'GRADUATED'
                e.save()
            else:
                e.current_semester = next_s
                e.current_year = next_y
                e.save()

                sr, _ = SemesterRegistration.objects.get_or_create(enrollment=e, semester=next_s)
                c_set = Course.objects.filter(semester=next_s)
                if e.program and e.program.department:
                    dept_c = Course.objects.filter(department=e.program.department, semester=next_s)
                    if dept_c.exists():
                        c_set = dept_c
                sr.courses.set(c_set[:5])

                prev_fee = Fee.objects.filter(enrollment=e, semester=next_s - 1).first()
                discount = prev_fee.scholarship_discount if prev_fee else 0.00
                Fee.objects.get_or_create(
                    enrollment=e,
                    semester=next_s,
                    defaults={'amount': 45000.00, 'scholarship_discount': discount, 'status': 'PENDING', 'due_date': timezone.now().date() + timedelta(days=30)}
                )

                Notification.objects.create(
                    user=e.user,
                    title='Academic Term Promotion Confirmed',
                    message=f'Congratulations! You have progressed to Semester {next_s}.',
                    notification_type='SUCCESS'
                )
                promoted += 1

        return Response({
            'detail': f'Bulk rollover complete. {promoted} students promoted, {skipped} students held back.',
            'promoted': promoted,
            'skipped': skipped
        })

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
