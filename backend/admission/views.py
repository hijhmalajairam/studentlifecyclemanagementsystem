from rest_framework import viewsets, permissions, status, serializers
from users.permissions import IsAdminRole, IsAdminOrInterviewer
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AdmissionApplication, Document, Scholarship, ApplicantProfile, SeatAllocation
from .serializers import AdmissionApplicationSerializer, DocumentSerializer, ScholarshipSerializer, ApplicantProfileSerializer, SeatAllocationSerializer


class ApplicantProfileViewSet(viewsets.ModelViewSet):
    queryset = ApplicantProfile.objects.all()
    serializer_class = ApplicantProfileSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_profile', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        try:
            profile = ApplicantProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ApplicantProfile.DoesNotExist:
            return Response({"detail": "No profile found."}, status=status.HTTP_404_NOT_FOUND)


class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    queryset = AdmissionApplication.objects.select_related('profile__user').prefetch_related('documents', 'scholarship', 'seat_allocation').all()
    serializer_class = AdmissionApplicationSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_applications']:
            return [permissions.IsAuthenticated()]
        if self.action in ['assigned_interviews', 'partial_update', 'update']:
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]

    def perform_create(self, serializer):
        profile, _ = ApplicantProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminRole])
    def create_offline(self, request):
        """Create an offline applicant account, profile, and application together."""
        user_data = request.data.get('user') or {}
        profile_data = request.data.get('profile') or {}
        application_data = request.data.get('application') or {}
        required = ('username', 'email', 'password', 'first_name', 'last_name')
        missing = [field for field in required if not user_data.get(field)]
        if missing:
            raise serializers.ValidationError({'user': f"Missing required fields: {', '.join(missing)}."})

        from django.db import transaction
        from users.models import User

        with transaction.atomic():
            if User.objects.filter(username=user_data['username']).exists():
                raise serializers.ValidationError({'user': 'That username is already in use.'})
            if User.objects.filter(email=user_data['email']).exists():
                raise serializers.ValidationError({'user': 'That email address is already in use.'})
            user = User.objects.create_user(
                username=user_data['username'], email=user_data['email'], password=user_data['password'],
                first_name=user_data['first_name'], last_name=user_data['last_name'],
                phone=user_data.get('phone', ''), role='PROSPECTIVE_STUDENT',
            )
            profile = ApplicantProfile.objects.create(
                user=user, father_name=profile_data.get('father_name', ''),
                mother_name=profile_data.get('mother_name', ''), family_income=profile_data.get('family_income') or None,
                address=profile_data.get('address', ''), phone=profile_data.get('phone', user.phone),
            )
            application = AdmissionApplication.objects.create(
                profile=profile, entry_type='OFFLINE', status='SUBMITTED',
                previous_school_name=application_data.get('previous_school_name', ''),
                previous_marks_percentage=application_data.get('previous_marks_percentage') or None,
                scholarship_requested=bool(application_data.get('scholarship_requested', False)),
            )
        return Response(self.get_serializer(application).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        try:
            profile = ApplicantProfile.objects.get(user=request.user)
            applications = AdmissionApplication.objects.filter(profile=profile)
            serializer = self.get_serializer(applications, many=True)
            return Response(serializer.data)
        except ApplicantProfile.DoesNotExist:
            return Response([])

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def pay_fees(self, request, pk=None):
        try:
            application = self.get_object()
            if application.profile.user != request.user and request.user.role != 'ADMIN':
                return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
                
            if application.status != 'FEE_PENDING':
                return Response({"detail": "Fees are not pending for this application."}, status=status.HTTP_400_BAD_REQUEST)
                
            application.status = 'ENROLLED'
            application.save()
            return Response(self.get_serializer(application).data, status=status.HTTP_200_OK)
        except AdmissionApplication.DoesNotExist:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def assigned_interviews(self, request):
        if request.user.role != 'INTERVIEWER':
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        applications = AdmissionApplication.objects.filter(
            interviewer=request.user,
            status='INTERVIEW_SCHEDULED'
        ).select_related('profile__user').prefetch_related('documents')
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [permissions.IsAuthenticated()]
        if self.action in ['partial_update', 'update']:
            return [IsAdminOrInterviewer()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        application_id = self.request.data.get('application')
        application = AdmissionApplication.objects.get(id=application_id, profile__user=self.request.user)
        serializer.save(application=application)


class ScholarshipViewSet(viewsets.ModelViewSet):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        if self.action in ['partial_update', 'update']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        application_id = self.request.data.get('application')
        application = AdmissionApplication.objects.get(id=application_id, profile__user=self.request.user)
        # Guard: all documents must be VERIFIED before applying for scholarship
        pending_docs = application.documents.exclude(status='VERIFIED')
        if application.documents.count() == 0:
            raise serializers.ValidationError({"detail": "Please upload and get your documents verified before applying for a scholarship."})
        if pending_docs.exists():
            raise serializers.ValidationError({"detail": "All your documents must be verified before you can apply for a scholarship."})
        serializer.save(application=application)


class SeatAllocationViewSet(viewsets.ModelViewSet):
    queryset = SeatAllocation.objects.all()
    serializer_class = SeatAllocationSerializer

    def get_permissions(self):
        return [IsAdminRole()]

    def perform_create(self, serializer):
        application_id = self.request.data.get('application')
        application = AdmissionApplication.objects.get(id=application_id)
        
        # Guard: Ensure they are SELECTED or INTERVIEWed
        if application.status not in ['SELECTED']:
            raise serializers.ValidationError({"detail": "Application must be SELECTED to allocate a seat."})
            
        serializer.save(allocated_by=self.request.user)
        
        # After allocation, they are ready for fee payment/enrollment
        application.status = 'FEE_PENDING'
        application.save()
