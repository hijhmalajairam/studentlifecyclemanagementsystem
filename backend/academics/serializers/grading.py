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
