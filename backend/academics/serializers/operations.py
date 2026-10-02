from rest_framework import serializers
from ..models import Leave, TransferRequest, NoDues, DisciplinaryCase, Internship, Fee, Notification, Company, FacultyInternshipOpportunity, InternshipAuditLog, InternshipDocument, InternshipWindow

class LeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ('enrollment', 'status', 'applied_on')

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

class InternshipWindowSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipWindow
        fields = '__all__'

class FeeSerializer(serializers.ModelSerializer):
    net_amount = serializers.SerializerMethodField()

    class Meta:
        model = Fee
        fields = '__all__'

    def get_net_amount(self, obj):
        return obj.net_amount()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
