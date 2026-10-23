from rest_framework import serializers
from ..models import Department, Program, AcademicTerm, Course, CourseSection, Batch

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class ProgramSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Program
        fields = '__all__'

class BatchSerializer(serializers.ModelSerializer):
    program_code = serializers.CharField(source='program.code', read_only=True)

    class Meta:
        model = Batch
        fields = '__all__'

class AcademicTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicTerm
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    department_code = serializers.CharField(source='department.code', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    academic_year = serializers.SerializerMethodField()
    semester_label = serializers.SerializerMethodField()
    class_label = serializers.SerializerMethodField()
    section = serializers.SerializerMethodField()
    faculty_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_academic_year(self, obj):
        sem = getattr(obj, 'semester', 1) or 1
        yr = (sem + 1) // 2
        suffix = 'st' if yr == 1 else 'nd' if yr == 2 else 'rd' if yr == 3 else 'th'
        return f"{yr}{suffix} Year"

    def get_semester_label(self, obj):
        sem = getattr(obj, 'semester', 1) or 1
        return f"Semester {sem}"

    def get_class_label(self, obj):
        sem = getattr(obj, 'semester', 1) or 1
        yr = (sem + 1) // 2
        suffix = 'st' if yr == 1 else 'nd' if yr == 2 else 'rd' if yr == 3 else 'th'
        return f"{yr}{suffix} Year • Sem {sem} • Sec A"

    def get_section(self, obj):
        return "Section A"

    def get_faculty_name(self, obj):
        from ..models import Timetable
        tt = Timetable.objects.filter(course_section__course=obj, faculty__isnull=False).select_related('faculty').first()
        if tt and tt.faculty:
            name = f"{tt.faculty.first_name} {tt.faculty.last_name}".strip()
            return f"Prof. {name}" if name else tt.faculty.username
        return "Course Coordinator TBA"

class CourseSectionSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    term_name = serializers.CharField(source='academic_term.term_name', read_only=True)

    class Meta:
        model = CourseSection
        fields = '__all__'
