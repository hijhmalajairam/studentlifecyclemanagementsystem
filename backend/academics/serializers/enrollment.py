from rest_framework import serializers
from ..models import Enrollment, SemesterRegistration
from .core import CourseSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('user', 'enrollment_number', 'enrolled_date', 'fee_paid')

    def get_student_name(self, obj):
        return obj.user.get_full_name() or obj.user.username if obj.user else ''

    def get_student_email(self, obj):
        return obj.user.email if obj.user else ''

class SemesterRegistrationSerializer(serializers.ModelSerializer):
    courses_details = CourseSerializer(source='courses', many=True, read_only=True)
    program_name = serializers.CharField(source='enrollment.program.name', read_only=True)
    enrollment_number = serializers.CharField(source='enrollment.enrollment_number', read_only=True)
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SemesterRegistration
        fields = '__all__'
        read_only_fields = ('enrollment', 'registered_at')

    def get_student_name(self, obj):
        if obj.enrollment and obj.enrollment.user:
            return obj.enrollment.user.get_full_name() or obj.enrollment.user.username
        return ''
