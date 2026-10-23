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
    semester = serializers.IntegerField(source='course_section.course.semester', read_only=True)
    department_code = serializers.CharField(source='course_section.course.department.code', read_only=True)
    department_name = serializers.CharField(source='course_section.course.department.name', read_only=True)
    academic_year = serializers.SerializerMethodField()
    class_label = serializers.SerializerMethodField()
    section = serializers.SerializerMethodField()
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = Timetable
        fields = '__all__'

    def get_academic_year(self, obj):
        if obj.course_section and obj.course_section.course:
            sem = obj.course_section.course.semester
            yr = (sem + 1) // 2
            suffix = 'st' if yr == 1 else 'nd' if yr == 2 else 'rd' if yr == 3 else 'th'
            return f"{yr}{suffix} Year"
        return "1st Year"

    def get_class_label(self, obj):
        if obj.course_section and obj.course_section.course:
            sem = obj.course_section.course.semester
            yr = (sem + 1) // 2
            suffix = 'st' if yr == 1 else 'nd' if yr == 2 else 'rd' if yr == 3 else 'th'
            return f"{yr}{suffix} Year • Sem {sem} • Sec A"
        return "1st Year • Sem 1 • Sec A"

    def get_section(self, obj):
        return "Section A"

    def get_faculty_name(self, obj):
        if obj.faculty:
            return f"{obj.faculty.first_name} {obj.faculty.last_name}".strip() or obj.faculty.username
        return None
