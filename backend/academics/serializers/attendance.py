from rest_framework import serializers
from ..models import Attendance, Timetable

class AttendanceSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_name = serializers.SerializerMethodField()
    faculty_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = '__all__'

    def get_student_name(self, obj):
        if obj.enrollment and obj.enrollment.user:
            return obj.enrollment.user.get_full_name() or obj.enrollment.user.username
        return None

    def get_faculty_name(self, obj):
        if obj.faculty:
            return obj.faculty.get_full_name() or obj.faculty.username
        return None

class TimetableSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course_section.course.code', read_only=True)
    course_name = serializers.CharField(source='course_section.course.name', read_only=True)
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = Timetable
        fields = '__all__'

    def get_faculty_name(self, obj):
        if obj.faculty:
            return f"{obj.faculty.first_name} {obj.faculty.last_name}".strip() or obj.faculty.username
        return None
