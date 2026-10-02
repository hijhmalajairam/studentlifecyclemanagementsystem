from rest_framework import serializers
from .models import (
    Department, Program, Enrollment, Course, SemesterRegistration, Attendance, Leave, Result,
    Fee, Timetable, Notification, RevaluationRequest, TransferRequest, NoDues,
    DisciplinaryCase, Internship, Company, InternshipAuditLog, InternalAssessment, InternshipWindow,
    FacultyInternshipOpportunity, InternshipDocument
)

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Program
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('user', 'enrollment_number', 'enrolled_date', 'fee_paid', 'internship_waived')

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class SemesterRegistrationSerializer(serializers.ModelSerializer):
    courses_details = CourseSerializer(source='courses', many=True, read_only=True)
    
    class Meta:
        model = SemesterRegistration
        fields = '__all__'
        read_only_fields = ('enrollment', 'registered_at', 'is_summer_term')

class AttendanceSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'

class LeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ('enrollment', 'status', 'applied_on')

class ResultSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = Result
        fields = '__all__'

class FeeSerializer(serializers.ModelSerializer):
    net_amount = serializers.SerializerMethodField()

    class Meta:
        model = Fee
        fields = '__all__'

    def get_net_amount(self, obj):
        return obj.net_amount()

class TimetableSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = Timetable
        fields = '__all__'

    def get_faculty_name(self, obj):
        if obj.faculty:
            return f"{obj.faculty.first_name} {obj.faculty.last_name}".strip() or obj.faculty.username
        return None

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class RevaluationRequestSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='result.course.code', read_only=True)
    course_name = serializers.CharField(source='result.course.name', read_only=True)
    original_marks = serializers.DecimalField(source='result.marks_obtained', max_digits=5, decimal_places=2, read_only=True)
    original_grade = serializers.CharField(source='result.grade', read_only=True)

    class Meta:
        model = RevaluationRequest
        fields = '__all__'
        read_only_fields = ('status', 'requested_at', 'new_marks', 'new_grade')

class TransferRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransferRequest
        fields = '__all__'
        read_only_fields = ('enrollment', 'status', 'requested_at')

class NoDuesSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoDues
        fields = '__all__'
        read_only_fields = ('enrollment', 'created_at')

from .models import DisciplinaryCase, Internship, InternalAssessment, InternshipWindow

class DisciplinaryCaseSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    course_code = serializers.CharField(source='course.code', read_only=True)

    class Meta:
        model = DisciplinaryCase
        fields = '__all__'
        read_only_fields = ('case_number', 'reported_by', 'created_at', 'reviewed_by', 'reviewed_at', 'status', 'committee_decision')

    def get_reported_by_name(self, obj):
        if obj.reported_by:
            return f"{obj.reported_by.first_name} {obj.reported_by.last_name}".strip() or obj.reported_by.username
        return None

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return f"{obj.reviewed_by.first_name} {obj.reviewed_by.last_name}".strip() or obj.reviewed_by.username
        return None

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class InternshipAuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = InternshipAuditLog
        fields = '__all__'
        
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return 'System'

class FacultyInternshipOpportunitySerializer(serializers.ModelSerializer):
    company_details = CompanySerializer(source='company', read_only=True)
    faculty_creator_name = serializers.SerializerMethodField()

    class Meta:
        model = FacultyInternshipOpportunity
        fields = '__all__'
        read_only_fields = ('faculty_creator',)

    def get_faculty_creator_name(self, obj):
        if obj.faculty_creator:
            return f"{obj.faculty_creator.first_name} {obj.faculty_creator.last_name}".strip() or obj.faculty_creator.username
        return None

class InternshipDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipDocument
        fields = '__all__'
        read_only_fields = ('uploaded_at', 'file_name', 'file_size')

class InternshipSerializer(serializers.ModelSerializer):
    company_details = CompanySerializer(source='company', read_only=True)
    opportunity_details = FacultyInternshipOpportunitySerializer(source='opportunity', read_only=True)
    student_name = serializers.SerializerMethodField()
    enrollment_number = serializers.CharField(source='enrollment.enrollment_number', read_only=True)
    department = serializers.CharField(source='enrollment.program.department.name', read_only=True)
    year = serializers.IntegerField(source='enrollment.current_year', read_only=True)
    semester = serializers.IntegerField(source='enrollment.current_semester', read_only=True)
    faculty_mentor_name = serializers.SerializerMethodField()
    audit_logs = InternshipAuditLogSerializer(many=True, read_only=True)
    documents = InternshipDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Internship
        fields = '__all__'
        read_only_fields = ('enrollment', 'status', 'created_at', 'applied_date', 'approved_date', 'completion_date')

    def get_student_name(self, obj):
        user = obj.enrollment.user
        return f"{user.first_name} {user.last_name}".strip() or user.username

    def get_faculty_mentor_name(self, obj):
        if obj.faculty_mentor:
            return f"{obj.faculty_mentor.first_name} {obj.faculty_mentor.last_name}".strip() or obj.faculty_mentor.username
        return None

class InternalAssessmentSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = InternalAssessment
        fields = '__all__'
        read_only_fields = ('recorded_at',)

class InternshipWindowSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipWindow
        fields = '__all__'

from .models import CourseGradingScheme

class CourseGradingSchemeSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    finalized_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CourseGradingScheme
        fields = '__all__'

    def get_finalized_by_name(self, obj):
        if obj.finalized_by:
            return f"{obj.finalized_by.first_name} {obj.finalized_by.last_name}".strip() or obj.finalized_by.username
        return None

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return f"{obj.approved_by.first_name} {obj.approved_by.last_name}".strip() or obj.approved_by.username
        return None
