from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models as db_models
from .utils import get_target_user, calculate_gpa
from ..models import Attendance, Timetable, Enrollment, SemesterRegistration, Course, Department, Notification
from ..serializers import AttendanceSerializer, TimetableSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('enrollment', 'course', 'faculty').all()
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.action in ['my_attendance', 'my_daily_logs']:
            return [permissions.IsAuthenticated()]
        if self.action in ['bulk_mark', 'faculty_stats', 'send_warning']:
            class IsAdminOrFaculty(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.is_authenticated and (request.user.is_staff or request.user.role in ['ADMIN', 'FACULTY'] or getattr(request.user, 'is_faculty_user', False))
            return [IsAdminOrFaculty()]
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

        # Auto-set faculty to the logged-in user if they are faculty
        marking_faculty = request.user if request.user.role == 'FACULTY' else None

        created_count = 0
        for student in students:
            _, created = Attendance.objects.update_or_create(
                course_id=course_id,
                date=date,
                enrollment_id=student['enrollment_id'],
                defaults={
                    'status': student['status'],
                    'faculty': marking_faculty
                }
            )
            created_count += 1

        return Response({"detail": f"Attendance marked for {created_count} students."})

    def _get_faculty_department(self, user):
        """Get the department of a faculty member via their FacultyProfile."""
        try:
            from ..models.profiles import FacultyProfile
            fp = FacultyProfile.objects.select_related('department').get(user=user)
            return fp.department, fp.admin_role
        except Exception:
            return None, None

    def _get_scoped_course_ids(self, user):
        """
        Return (course_ids, scope_label, department_faculty_list) based on user role:
        - Admin: all courses, 'university'
        - HOD: all courses in their department, 'department'
        - Faculty: only courses they teach, 'personal'
        """
        is_faculty = user.role == 'FACULTY' or getattr(user, 'is_faculty_user', False)

        if not is_faculty:
            # Admin: all courses
            return list(Course.objects.values_list('id', flat=True)), 'university', None

        department, admin_role = self._get_faculty_department(user)

        if admin_role == 'Head of Department' and department:
            # HOD: all courses in their department
            dept_course_ids = list(Course.objects.filter(department=department).values_list('id', flat=True))

            # Also get department faculty list for the HOD dashboard
            from ..models.profiles import FacultyProfile
            dept_faculty = []
            for fp in FacultyProfile.objects.filter(department=department).select_related('user'):
                fac_user = fp.user
                fac_taught_ids = list(Timetable.objects.filter(faculty=fac_user).values_list('course_section__course_id', flat=True).distinct())
                fac_taught_codes = list(Course.objects.filter(id__in=fac_taught_ids).values_list('code', flat=True))

                # Lecture conduction count for this faculty
                sessions_conducted = Attendance.objects.filter(
                    faculty=fac_user, course_id__in=dept_course_ids
                ).values('course_id', 'date').distinct().count()

                # Total attendance records for avg calculation
                fac_records = Attendance.objects.filter(faculty=fac_user, course_id__in=dept_course_ids)
                fac_total = fac_records.count()
                fac_present = fac_records.filter(status='PRESENT').count()
                fac_avg = round((fac_present / fac_total) * 100, 1) if fac_total > 0 else 0

                dept_faculty.append({
                    'faculty_id': fac_user.id,
                    'faculty_name': fac_user.get_full_name() or fac_user.username,
                    'username': fac_user.username,
                    'designation': fp.designation or 'Faculty',
                    'admin_role': fp.admin_role or 'None',
                    'courses_taught': fac_taught_codes,
                    'sessions_conducted': sessions_conducted,
                    'avg_attendance': fac_avg,
                })

            return dept_course_ids, 'department', dept_faculty
        else:
            # Standard faculty: only their taught courses
            course_ids = list(Timetable.objects.filter(faculty=user).values_list('course_section__course_id', flat=True).distinct())
            return course_ids, 'personal', None

    @action(detail=False, methods=['get'])
    def faculty_stats(self, request):
        user = request.user

        # Scope courses based on user role
        course_ids, scope, dept_faculty = self._get_scoped_course_ids(user)

        # Optional department filter for admin
        dept_filter = request.query_params.get('department')
        if dept_filter and scope == 'university':
            course_ids = list(Course.objects.filter(department__code=dept_filter).values_list('id', flat=True))

        courses = Course.objects.filter(id__in=course_ids).select_related('department')

        course_list = []
        recent_sessions_map = {}
        at_risk_students = []

        total_faculty_records = 0
        total_faculty_present = 0
        all_unique_sessions = set()
        enrolled_student_ids = set()

        for c in courses:
            c_records = Attendance.objects.filter(course=c).select_related('enrollment__user', 'faculty')
            c_total = c_records.count()
            c_pres = c_records.filter(status='PRESENT').count()
            c_pct = round((c_pres / c_total) * 100, 1) if c_total > 0 else 0

            # Enrolled count in this course
            regs = SemesterRegistration.objects.filter(courses=c).select_related('enrollment__user')
            c_enrolled = regs.count()
            for r in regs:
                enrolled_student_ids.add(r.enrollment_id)

            # Check individual student attendance in this course
            student_stats = {}
            for rec in c_records:
                eid = rec.enrollment_id
                if eid not in student_stats:
                    student_stats[eid] = {
                        'enrollment_id': eid,
                        'enrollment_number': rec.enrollment.enrollment_number,
                        'student_name': rec.enrollment.user.get_full_name() if rec.enrollment.user else 'Unknown',
                        'total': 0,
                        'present': 0
                    }
                student_stats[eid]['total'] += 1
                if rec.status == 'PRESENT':
                    student_stats[eid]['present'] += 1

                # Group for recent sessions
                session_key = (c.id, str(rec.date))
                all_unique_sessions.add(session_key)
                if session_key not in recent_sessions_map:
                    recent_sessions_map[session_key] = {
                        'course_id': c.id,
                        'course_code': c.code,
                        'course_name': c.name,
                        'date': str(rec.date),
                        'total': 0,
                        'present': 0,
                        'absent': 0
                    }
                recent_sessions_map[session_key]['total'] += 1
                if rec.status == 'PRESENT':
                    recent_sessions_map[session_key]['present'] += 1
                else:
                    recent_sessions_map[session_key]['absent'] += 1

            # Identify at-risk students (<75%)
            course_at_risk_count = 0
            for s in student_stats.values():
                s_pct = round((s['present'] / s['total']) * 100, 1) if s['total'] > 0 else 0
                if s_pct < 75.0:
                    course_at_risk_count += 1
                    at_risk_students.append({
                        'enrollment_id': s['enrollment_id'],
                        'enrollment_number': s['enrollment_number'],
                        'student_name': s['student_name'],
                        'course_code': c.code,
                        'course_name': c.name,
                        'total': s['total'],
                        'present': s['present'],
                        'percentage': s_pct,
                        'status': 'CRITICAL' if s_pct < 65 else 'WARNING'
                    })

            total_faculty_records += c_total
            total_faculty_present += c_pres

            # Get instructor name(s) for this course
            instructors = list(
                Timetable.objects.filter(course_section__course=c)
                .select_related('faculty')
                .values_list('faculty__first_name', 'faculty__last_name', 'faculty__username')
                .distinct()
            )
            instructor_names = [
                f"{fn} {ln}".strip() or un for fn, ln, un in instructors if un
            ]

            course_list.append({
                'course_id': c.id,
                'course_code': c.code,
                'course_name': c.name,
                'credits': c.credits,
                'semester': c.semester,
                'department_code': c.department.code if c.department else None,
                'department_name': c.department.name if c.department else None,
                'instructors': instructor_names,
                'enrolled_students': c_enrolled,
                'total_sessions': len(set(rec.date for rec in c_records)),
                'avg_percentage': c_pct,
                'at_risk_count': course_at_risk_count
            })

        # Sort recent sessions by date descending
        recent_sessions = sorted(recent_sessions_map.values(), key=lambda x: x['date'], reverse=True)[:10]
        for sess in recent_sessions:
            sess['percentage'] = round((sess['present'] / sess['total']) * 100, 1) if sess['total'] > 0 else 0

        # Sort at_risk_students by percentage ascending
        at_risk_students.sort(key=lambda x: x['percentage'])

        overall_avg = round((total_faculty_present / total_faculty_records) * 100, 1) if total_faculty_records > 0 else 0

        # Build response
        response_data = {
            'scope': scope,
            'kpis': {
                'overall_avg_percentage': overall_avg,
                'total_sessions_conducted': len(all_unique_sessions),
                'total_students_enrolled': len(enrolled_student_ids),
                'total_at_risk_students': len(at_risk_students)
            },
            'courses': course_list,
            'recent_sessions': recent_sessions,
            'at_risk_students': at_risk_students
        }

        # Include department faculty list for HODs
        if dept_faculty is not None:
            response_data['department_faculty'] = dept_faculty

        # Include department list for admin filter
        if scope == 'university':
            response_data['departments'] = list(
                Department.objects.filter(is_active=True).values('id', 'code', 'name').order_by('name')
            )

        return Response(response_data)

    @action(detail=False, methods=['post'])
    def send_warning(self, request):
        """Send an official attendance warning notification to a student."""
        enrollment_id = request.data.get('enrollment_id')
        course_code = request.data.get('course_code', '')
        course_name = request.data.get('course_name', '')
        percentage = request.data.get('percentage', 0)

        if not enrollment_id:
            return Response({"detail": "enrollment_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            enrollment = Enrollment.objects.select_related('user').get(id=enrollment_id)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Enrollment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Create notification for the student
        faculty_name = request.user.get_full_name() or request.user.username
        title = f"Attendance Warning: {course_code}"
        message = (
            f"Dear {enrollment.user.get_full_name() or enrollment.user.username}, "
            f"your attendance in {course_code} ({course_name}) is currently at {percentage}%, "
            f"which is below the mandatory 75% threshold required for examination eligibility. "
            f"Please ensure regular attendance immediately. "
            f"— {faculty_name}"
        )

        Notification.objects.create(
            user=enrollment.user,
            title=title,
            message=message,
            notification_type='WARNING'
        )

        return Response({"detail": f"Warning notification sent to {enrollment.user.get_full_name() or enrollment.user.username}."})

    @action(detail=False, methods=['get'])
    def my_daily_logs(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled yet."}, status=status.HTTP_404_NOT_FOUND)

        course_id = request.query_params.get('course_id')
        records = Attendance.objects.filter(enrollment=enrollment).select_related('course', 'faculty')
        if course_id:
            records = records.filter(course_id=course_id)

        records = records.order_by('-date')[:60]
        data = [{
            'id': r.id,
            'date': str(r.date),
            'course_id': r.course.id,
            'course_code': r.course.code,
            'course_name': r.course.name,
            'status': r.status,
            'marked_by': r.faculty.get_full_name() if r.faculty else None
        } for r in records]

        return Response(data)

class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.select_related('course_section__course', 'faculty').all()
    serializer_class = TimetableSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_timetable']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def my_timetable(self, request):
        if request.user.role == 'FACULTY' or getattr(request.user, 'is_faculty_user', False):
            slots = Timetable.objects.filter(faculty=request.user).select_related('course_section__course', 'faculty')
            serializer = self.get_serializer(slots, many=True)
            return Response(serializer.data)
            
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
            registrations = SemesterRegistration.objects.filter(enrollment=enrollment)
            course_ids = set()
            for reg in registrations:
                course_ids.update(reg.courses.values_list('id', flat=True))
            slots = Timetable.objects.filter(course_section__course_id__in=course_ids).select_related('course_section__course', 'faculty')
            serializer = self.get_serializer(slots, many=True)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response({'detail': 'Not enrolled yet.'}, status=status.HTTP_404_NOT_FOUND)
