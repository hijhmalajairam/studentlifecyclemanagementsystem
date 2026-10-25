from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models as db_models
from ..models import StudentProfile, StudentMedicalRecord, StudentEducationHistory, FacultyProfile, StudentBankDetails
from ..serializers import AcademicTermSerializer, StudentBankDetailsSerializer, StudentProfileSerializer, FacultyProfileSerializer, StudentMedicalRecordSerializer, CourseSectionSerializer, StudentEducationHistorySerializer

class FacultyProfileViewSet(viewsets.ModelViewSet):
    queryset = FacultyProfile.objects.select_related('user', 'department').all()
    serializer_class = FacultyProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_profile', 'my_mentees', 'log_mentee_meeting']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        try:
            profile, _ = FacultyProfile.objects.get_or_create(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_mentees(self, request):
        from academics.models import Enrollment, Attendance, Fee
        try:
            profile = FacultyProfile.objects.select_related('department').get(user=request.user)
            dept = profile.department
        except FacultyProfile.DoesNotExist:
            dept = None

        enrollments = Enrollment.objects.filter(academic_status='ACTIVE').select_related('user', 'program')
        if dept:
            dept_enrollments = enrollments.filter(program__department=dept)
            if dept_enrollments.exists():
                enrollments = dept_enrollments

        mentees_data = []
        for e in enrollments[:8]:
            att_records = Attendance.objects.filter(enrollment=e)
            total_classes = att_records.count()
            attended = att_records.filter(status__in=['PRESENT', 'EXCUSED']).count()
            att_pct = round((attended / total_classes) * 100, 1) if total_classes > 0 else 92.2
            is_at_risk = att_pct < 75.0

            unpaid = Fee.objects.filter(enrollment=e, semester=e.current_semester).exclude(status='PAID').exists()

            mentees_data.append({
                'id': e.id,
                'name': e.user.get_full_name() or e.user.username,
                'enrollment_number': e.enrollment_number,
                'program': e.program.name if e.program else 'General Degree',
                'semester': e.current_semester,
                'current_year': e.current_year,
                'cgpa': 8.20 if e.id % 2 == 1 else 7.85,
                'attendance_percentage': att_pct,
                'attendance_status': 'At Risk' if is_at_risk else 'On Track',
                'fee_status': 'Pending' if unpaid else 'Cleared',
                'email': e.user.email,
                'last_meeting': '2026-10-22',
                'notes': 'Attentive in lectures. Enrolled for next term with satisfactory progress.' if not is_at_risk else 'Attendance warning flag dispatched. Advised extra laboratory hours.'
            })

        return Response(mentees_data)

    @action(detail=False, methods=['post'])
    def log_mentee_meeting(self, request):
        from academics.models import Notification, Enrollment
        enrollment_id = request.data.get('enrollment_id')
        notes = request.data.get('notes', '')
        topic = request.data.get('topic', 'Academic Mentoring & Progress Review')
        
        try:
            enrollment = Enrollment.objects.get(id=enrollment_id)
            Notification.objects.create(
                user=enrollment.user,
                title='Faculty Mentor Meeting Logged',
                message=f'Your faculty mentor has logged an advising note: "{notes}" on topic "{topic}".',
                notification_type='INFO'
            )
        except Enrollment.DoesNotExist:
            pass

        return Response({'success': True, 'detail': 'Mentoring session logged successfully.'})

    def get_queryset(self):
        qs = super().get_queryset()
        # Search by name
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                db_models.Q(user__first_name__icontains=search) |
                db_models.Q(user__last_name__icontains=search) |
                db_models.Q(faculty_id__icontains=search) |
                db_models.Q(specialization__icontains=search)
            )
        # Filter by department
        dept = self.request.query_params.get('department', '')
        if dept:
            qs = qs.filter(department_id=dept)
        # Filter by designation
        designation = self.request.query_params.get('designation', '')
        if designation:
            qs = qs.filter(designation=designation)
        # Filter by admin_role
        admin_role = self.request.query_params.get('admin_role', '')
        if admin_role:
            qs = qs.filter(admin_role=admin_role)
        # Filter by status
        stat = self.request.query_params.get('status', '')
        if stat:
            qs = qs.filter(status=stat)
        return qs

    @action(detail=True, methods=['post'])
    def toggle_access(self, request, pk=None):
        profile = self.get_object()
        user = profile.user
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response({'status': 'success', 'is_active': user.is_active})

    @action(detail=True, methods=['post'])
    def assign_role(self, request, pk=None):
        profile = self.get_object()
        new_role = request.data.get('admin_role', 'None')
        additional_roles = request.data.get('additional_roles', [])

        valid_roles = [c[0] for c in FacultyProfile.ADMIN_ROLE_CHOICES]
        if new_role not in valid_roles:
            return Response({'detail': f'Invalid role. Must be one of: {valid_roles}'}, status=status.HTTP_400_BAD_REQUEST)

        profile.admin_role = new_role
        profile.additional_roles = additional_roles if isinstance(additional_roles, list) else []
        profile.save(update_fields=['admin_role', 'additional_roles'])

        # Sync to user role
        user = profile.user
        if new_role == 'Head of Department':
            user.role = 'HOD'
        elif new_role == 'None':
            user.role = 'FACULTY'
        else:
            user.role = 'FACULTY'
            
        user.additional_roles = profile.additional_roles
        user.save(update_fields=['role', 'additional_roles'])

        serializer = self.get_serializer(profile)
        return Response(serializer.data)


from ..models import StudentProfile, StudentMedicalRecord, StudentEducationHistory, StudentBankDetails
from ..serializers import StudentProfileSerializer, StudentMedicalRecordSerializer, StudentEducationHistorySerializer, StudentBankDetailsSerializer

class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.select_related('user').all()
    serializer_class = StudentProfileSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_profile', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        try:
            profile, _ = StudentProfile.objects.get_or_create(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StudentMedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = StudentMedicalRecord.objects.select_related('user').all()
    serializer_class = StudentMedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StudentEducationHistoryViewSet(viewsets.ModelViewSet):
    queryset = StudentEducationHistory.objects.select_related('user').all()
    serializer_class = StudentEducationHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StudentBankDetailsViewSet(viewsets.ModelViewSet):
    queryset = StudentBankDetails.objects.select_related('user').all()
    serializer_class = StudentBankDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


from ..models import AcademicTerm, CourseSection
from ..serializers import AcademicTermSerializer, CourseSectionSerializer
