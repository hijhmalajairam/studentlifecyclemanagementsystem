from rest_framework import serializers
from .models import AdmissionApplication, Document, Scholarship, ApplicantProfile, SeatAllocation
from users.models import User


class ApplicantProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = ApplicantProfile
        fields = '__all__'
        read_only_fields = ('user', 'registration_number')

    def get_username(self, obj):
        return obj.user.username

    def get_email(self, obj):
        return obj.user.email

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('application', 'uploaded_at')


class ScholarshipSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_username = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    application_number = serializers.CharField(source='application.application_number', read_only=True)
    enrollment_number = serializers.SerializerMethodField()
    program_name = serializers.CharField(source='application.program.name', read_only=True)
    program_code = serializers.CharField(source='application.program.code', read_only=True)
    family_income = serializers.CharField(source='application.profile.family_income', read_only=True)

    class Meta:
        model = Scholarship
        fields = '__all__'
        read_only_fields = ('application',)

    def get_student_name(self, obj):
        if obj.application and obj.application.profile and obj.application.profile.user:
            user = obj.application.profile.user
            return f"{user.first_name} {user.last_name}".strip() or user.username
        return ""

    def get_student_username(self, obj):
        if obj.application and obj.application.profile and obj.application.profile.user:
            return obj.application.profile.user.username
        return ""

    def get_student_email(self, obj):
        if obj.application and obj.application.profile and obj.application.profile.user:
            return obj.application.profile.user.email
        return ""

    def get_enrollment_number(self, obj):
        if obj.application and obj.application.enrollment_number:
            return obj.application.enrollment_number
        if obj.application and obj.application.profile and obj.application.profile.user:
            from academics.models import Enrollment
            enr = Enrollment.objects.filter(user=obj.application.profile.user).first()
            if enr:
                return enr.enrollment_number
        return ""


class SeatAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatAllocation
        fields = '__all__'
        read_only_fields = ('application', 'allocated_by', 'allocated_at')


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')


class AdmissionApplicationSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    scholarship = ScholarshipSerializer(read_only=True)
    seat_allocation = SeatAllocationSerializer(read_only=True)
    profile_details = ApplicantProfileSerializer(source='profile', read_only=True)
    interviewer_details = UserBasicSerializer(source='interviewer', read_only=True)

    class Meta:
        model = AdmissionApplication
        fields = '__all__'
        # The viewset restricts write access to staff.  Keeping workflow fields
        # writable here lets admissions staff schedule interviews and move an
        # application through the workflow from the portal.
        read_only_fields = ('profile', 'application_number', 'applied_date', 'updated_date')
