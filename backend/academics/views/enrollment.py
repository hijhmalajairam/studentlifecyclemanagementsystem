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
            registrations = SemesterRegistration.objects.filter(enrollment=enrollment).prefetch_related('courses').order_by('semester')
            serializer = self.get_serializer(registrations, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled yet."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def registration_window(self, request):
        from academics.models import Attendance, Fee, Course
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Student enrollment record not found."}, status=status.HTTP_404_NOT_FOUND)

        current_sem = enrollment.current_semester
        target_sem = current_sem + 1
        target_year = (target_sem + 1) // 2

        # Check existing registration for target semester
        existing_reg = SemesterRegistration.objects.filter(enrollment=enrollment, semester=target_sem).first()

        # Eligibility checks
        att_records = Attendance.objects.filter(enrollment=enrollment)
        total_classes = att_records.count()
        attended = att_records.filter(status__in=['PRESENT', 'EXCUSED']).count()
        att_pct = round((attended / total_classes) * 100, 1) if total_classes > 0 else 100.0
        att_passed = att_pct >= 75.0

        unpaid_fee = Fee.objects.filter(enrollment=enrollment, semester=current_sem).exclude(status='PAID').exists()
        fee_passed = not unpaid_fee

        eligible = att_passed and fee_passed

        # Fetch available courses for target semester
        dept = enrollment.program.department if enrollment.program else None
        courses_qs = Course.objects.filter(semester=target_sem).select_related('department')
        if dept:
            courses_qs = courses_qs.filter(
                db_models.Q(department=dept) | 
                db_models.Q(department__code__in=['MATH', 'PHY', 'CHEM', 'ECE', 'CSE'])
            )

        courses_data = []
        for c in courses_qs.order_by('-course_type', 'code'):
            courses_data.append({
                'id': c.id,
                'code': c.code,
                'name': c.name,
                'credits': c.credits,
                'semester': c.semester,
                'department_code': c.department.code if c.department else 'GEN',
                'department_name': c.department.name if c.department else 'General',
                'course_type': c.course_type,
                'is_core': c.course_type == 'CORE',
                'is_elective': c.course_type in ['ELECTIVE', 'OPEN_ELECTIVE'],
                'description': f"{c.name} course conducted by the {c.department.name if c.department else 'Engineering'} department.",
            })

        return Response({
            'student_name': target_user.get_full_name() or target_user.username,
            'enrollment_number': enrollment.enrollment_number,
            'program_name': enrollment.program.name if enrollment.program else 'General Degree',
            'current_semester': current_sem,
            'target_semester': target_sem,
            'target_year': target_year,
            'academic_year': '2026-27',
            'term_name': f"Semester {target_sem} (Autumn 2026-27)",
            'is_registered': existing_reg is not None,
            'existing_registration': SemesterRegistrationSerializer(existing_reg).data if existing_reg else None,
            'eligibility': {
                'eligible': eligible,
                'attendance_percentage': att_pct,
                'attendance_passed': att_passed,
                'fee_passed': fee_passed,
                'message': 'Eligible for subject choice & next-semester registration.' if eligible else (
                    'Attendance below statutory 75% minimum.' if not att_passed else 'Outstanding fees pending for current term.'
                )
            },
            'credit_rules': {
                'min_credits': 12,
                'max_credits': 24,
                'recommended_credits': 18
            },
            'available_courses': courses_data
        })

    @action(detail=False, methods=['post'])
    def register_semester(self, request):
        from academics.models import Attendance, Fee, Course, Notification
        from datetime import timedelta

        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Student enrollment record not found."}, status=status.HTTP_404_NOT_FOUND)

        target_sem = request.data.get('target_semester', enrollment.current_semester + 1)
        course_ids = request.data.get('course_ids', [])

        if not course_ids or not isinstance(course_ids, list):
            return Response({"detail": "Please select at least one course to register."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Eligibility verification (75% attendance + fee clearance)
        att_records = Attendance.objects.filter(enrollment=enrollment)
        total_classes = att_records.count()
        attended = att_records.filter(status__in=['PRESENT', 'EXCUSED']).count()
        att_pct = (attended / total_classes) * 100 if total_classes > 0 else 100.0
        if att_pct < 75.0:
            return Response(
                {"detail": f"Cannot register: Current attendance ({att_pct:.1f}%) is below the statutory 75% bar."},
                status=status.HTTP_400_BAD_REQUEST
            )

        unpaid = Fee.objects.filter(enrollment=enrollment, semester=enrollment.current_semester).exclude(status='PAID').exists()
        if unpaid:
            return Response(
                {"detail": f"Cannot register: Term fees for Semester {enrollment.current_semester} are unpaid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Credit verification
        selected_courses = Course.objects.filter(id__in=course_ids)
        if not selected_courses.exists():
            return Response({"detail": "No valid courses found for the provided IDs."}, status=status.HTTP_400_BAD_REQUEST)

        total_credits = sum(c.credits for c in selected_courses)
        if total_credits < 12:
            return Response(
                {"detail": f"Selected load of {total_credits} credits is below the minimum statutory threshold of 12 credits."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if total_credits > 24:
            return Response(
                {"detail": f"Selected load of {total_credits} credits exceeds the institutional cap of 24 credits."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Create or update SemesterRegistration
        sem_reg, created = SemesterRegistration.objects.get_or_create(
            enrollment=enrollment,
            semester=int(target_sem),
            defaults={
                'status': 'APPROVED',
                'total_credits': total_credits,
                'academic_year': '2026-27'
            }
        )
        sem_reg.courses.set(selected_courses)
        sem_reg.status = 'APPROVED'
        sem_reg.total_credits = total_credits
        sem_reg.academic_year = '2026-27'
        sem_reg.save()

        # 4. Generate fee invoice for the new semester if not exists
        prev_fee = Fee.objects.filter(enrollment=enrollment, semester=int(target_sem) - 1).first()
        discount = prev_fee.scholarship_discount if prev_fee else 0.00
        Fee.objects.get_or_create(
            enrollment=enrollment,
            semester=int(target_sem),
            defaults={
                'amount': 45000.00,
                'scholarship_discount': discount,
                'status': 'PENDING',
                'due_date': timezone.now().date() + timedelta(days=30)
            }
        )

        # 5. Dispatch notification
        Notification.objects.create(
            user=enrollment.user,
            title=f"Semester {target_sem} Course Registration Confirmed",
            message=f"You have successfully selected your subjects and registered for Semester {target_sem} ({selected_courses.count()} courses, {total_credits} Credits).",
            notification_type="SUCCESS"
        )

        return Response({
            'success': True,
            'detail': f"Successfully registered for Semester {target_sem}.",
            'registration': SemesterRegistrationSerializer(sem_reg).data,
            'total_credits': total_credits,
            'courses_count': selected_courses.count()
        })
