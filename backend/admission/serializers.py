from rest_framework import serializers
from .models import AdmissionApplication, Document, Scholarship, ApplicantProfile, SeatAllocation
from users.models import User


class ApplicantProfileSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = ApplicantProfile
        fields = '__all__'
        read_only_fields = ('user', 'registration_number')

    def get_username(self, obj):
        return obj.user.username

    def get_email(self, obj):
        return obj.user.email


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('application', 'uploaded_at')


class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = '__all__'
        read_only_fields = ('application',)


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
