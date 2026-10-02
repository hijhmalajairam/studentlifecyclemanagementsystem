from rest_framework import serializers
from ..models import Result, RevaluationRequest

class ResultSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    term_name = serializers.CharField(source='academic_term.term_name', read_only=True)

    class Meta:
        model = Result
        fields = '__all__'

class RevaluationRequestSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='result.course.code', read_only=True)
    course_name = serializers.CharField(source='result.course.name', read_only=True)
    original_marks = serializers.DecimalField(source='result.marks_obtained', max_digits=5, decimal_places=2, read_only=True)
    original_grade = serializers.CharField(source='result.grade', read_only=True)

    class Meta:
        model = RevaluationRequest
        fields = '__all__'
        read_only_fields = ('status', 'requested_at', 'new_marks', 'new_grade')

class InternalAssessmentSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        from ..models import InternalAssessment
        model = InternalAssessment
        fields = '__all__'
        read_only_fields = ('recorded_at',)

class CourseGradingSchemeSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    finalized_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        from ..models import CourseGradingScheme
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
