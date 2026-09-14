from rest_framework import serializers
from ..models import Enrollment, SemesterRegistration
from .core import CourseSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('user', 'enrollment_number', 'enrolled_date', 'fee_paid')

class SemesterRegistrationSerializer(serializers.ModelSerializer):
    courses_details = CourseSerializer(source='courses', many=True, read_only=True)
    
    class Meta:
        model = SemesterRegistration
        fields = '__all__'
        read_only_fields = ('enrollment', 'registered_at')
