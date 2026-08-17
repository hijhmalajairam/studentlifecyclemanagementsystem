from rest_framework import serializers
from .models import (
    Department, Program, Enrollment, Course, SemesterRegistration, Attendance, Leave, Result,
    Fee, Timetable, Notification, RevaluationRequest, TransferRequest, NoDues
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
        read_only_fields = ('user', 'enrollment_number', 'enrolled_date', 'fee_paid')

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class SemesterRegistrationSerializer(serializers.ModelSerializer):
    courses_details = CourseSerializer(source='courses', many=True, read_only=True)
    
    class Meta:
        model = SemesterRegistration
        fields = '__all__'
        read_only_fields = ('enrollment', 'registered_at')

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

from .models import DisciplinaryCase, Internship

class DisciplinaryCaseSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DisciplinaryCase
        fields = '__all__'
        read_only_fields = ('enrollment', 'reported_by', 'created_at')

    def get_reported_by_name(self, obj):
        if obj.reported_by:
            return f"{obj.reported_by.first_name} {obj.reported_by.last_name}".strip() or obj.reported_by.username
        return None

class InternshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Internship
        fields = '__all__'
        read_only_fields = ('enrollment', 'status', 'created_at')
