from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models as db_models
from .utils import get_target_user, calculate_gpa
from ..models import Attendance, Timetable, Enrollment, SemesterRegistration, Course
from ..serializers import AttendanceSerializer, TimetableSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('enrollment', 'course').all()
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.action in ['my_attendance', 'my_daily_logs']:
            return [permissions.IsAuthenticated()]
        if self.action in ['bulk_mark', 'faculty_stats']:
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

    @action(detail=False, methods=['get'])
    def faculty_stats(self, request):
        user = request.user
        # Identify courses taught by faculty
        if user.role == 'FACULTY' or getattr(user, 'is_faculty_user', False):
            course_ids = list(Timetable.objects.filter(faculty=user).values_list('course_section__course_id', flat=True).distinct())
        else:
            course_ids = list(Course.objects.values_list('id', flat=True))

        courses = Course.objects.filter(id__in=course_ids)

        course_list = []
        recent_sessions_map = {}
        at_risk_students = []

        total_faculty_records = 0
        total_faculty_present = 0
        all_unique_sessions = set()
        enrolled_student_ids = set()

        for c in courses:
            c_records = Attendance.objects.filter(course=c).select_related('enrollment__user')
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

            course_list.append({
                'course_id': c.id,
                'course_code': c.code,
                'course_name': c.name,
                'credits': c.credits,
                'semester': c.semester,
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

        return Response({
            'kpis': {
                'overall_avg_percentage': overall_avg,
                'total_sessions_conducted': len(all_unique_sessions),
                'total_students_enrolled': len(enrolled_student_ids),
                'total_at_risk_students': len(at_risk_students)
            },
            'courses': course_list,
            'recent_sessions': recent_sessions,
            'at_risk_students': at_risk_students
        })

    @action(detail=False, methods=['get'])
    def my_daily_logs(self, request):
        try:
            target_user = get_target_user(request.user)
            enrollment = Enrollment.objects.get(user=target_user)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Not enrolled yet."}, status=status.HTTP_404_NOT_FOUND)

        course_id = request.query_params.get('course_id')
        records = Attendance.objects.filter(enrollment=enrollment).select_related('course')
        if course_id:
            records = records.filter(course_id=course_id)

        records = records.order_by('-date')[:60]
        data = [{
            'id': r.id,
            'date': str(r.date),
            'course_id': r.course.id,
            'course_code': r.course.code,
            'course_name': r.course.name,
            'status': r.status
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
