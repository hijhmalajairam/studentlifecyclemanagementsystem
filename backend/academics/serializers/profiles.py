from rest_framework import serializers
from ..models import FacultyProfile, StudentProfile, StudentMedicalRecord, StudentEducationHistory, StudentBankDetails

class FacultyProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = FacultyProfile
        fields = '__all__'
        read_only_fields = ('user', 'faculty_id')

class StudentProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ('user',)

class StudentMedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentMedicalRecord
        fields = '__all__'
        read_only_fields = ('user',)

class StudentEducationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentEducationHistory
        fields = '__all__'
        read_only_fields = ('user',)

class StudentBankDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentBankDetails
        fields = '__all__'
        read_only_fields = ('user',)
