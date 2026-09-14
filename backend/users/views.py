from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer, RegisterSerializer
from admission.models import ApplicantProfile, AdmissionApplication, SeatAllocation
from academics.models import Enrollment, StudentProfile, FacultyProfile, Department


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Override JWT login to return user role and name alongside tokens."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'is_staff': self.user.is_staff,
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False, # Set to True in production (HTTPS)
                samesite='Lax',
                max_age=3600
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=86400
            )
            
            # Remove tokens from JSON response body for extra security
            del response.data['access']
            del response.data['refresh']

        return response


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "message": "Registration successful"
        }, status=status.HTTP_201_CREATED)

        response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax', max_age=3600)
        response.set_cookie('refresh_token', refresh_token, httponly=True, secure=False, samesite='Lax', max_age=86400)

        return response

class LogoutView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        response = Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class InterviewersListView(generics.ListAPIView):
    queryset = User.objects.filter(role='INTERVIEWER')
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class SystemMappingView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        stats = {
            "total_users": User.objects.count(),
            "students": User.objects.filter(role='STUDENT').count(),
            "faculty": User.objects.filter(role='FACULTY').count(),
            "prospective": User.objects.filter(role='PROSPECTIVE_STUDENT').count(),
            "departments": Department.objects.count(),
            "enrollments": Enrollment.objects.count(),
            "applications": AdmissionApplication.objects.count(),
            "missing_mappings": 0
        }

        nodes = []
        edges = []
        missing_mappings = []

        def add_node(id_str, label, group, status="ok", details=None):
            nodes.append({
                "id": id_str,
                "data": {"label": label, "status": status, "group": group, "details": details or {}},
                "position": {"x": 0, "y": 0}
            })

        def add_edge(source, target, label=""):
            edges.append({
                "id": f"e_{source}_{target}",
                "source": source,
                "target": target,
                "label": label,
                "animated": True if label == "Missing" else False
            })
            
        def log_missing(node_id, type_msg, user_msg):
            stats["missing_mappings"] += 1
            missing_mappings.append({"type": type_msg, "user": user_msg, "severity": "error"})
            for n in nodes:
                if n["id"] == node_id:
                    n["data"]["status"] = "error"
                    break

        # Generate Zones & Groups
        # 1. Departments
        for d in Department.objects.all():
            did = f"dept_{d.id}"
            add_node(did, f"{d.name}", "department", details={"Code": d.code})

        # 2. Users
        for u in User.objects.all():
            uid = f"user_{u.id}"
            
            if u.role == 'STUDENT':
                add_node(uid, f"{u.username}", "student_user", details={"Email": u.email, "Role": u.role})
                try:
                    profile = u.student_profile
                    pid = f"stu_prof_{profile.id}"
                    add_node(pid, "Student Profile", "student_profile")
                    add_edge(uid, pid)
                    
                    if profile.enrollment:
                        eid = f"enr_{profile.enrollment.id}"
                        add_node(eid, f"ENR: {profile.enrollment.enrollment_number}", "enrollment", details={"Status": "Enrolled"})
                        add_edge(pid, eid)
                    else:
                        log_missing(uid, "STUDENT missing Enrollment", u.username)
                except StudentProfile.DoesNotExist:
                    log_missing(uid, "STUDENT missing StudentProfile", u.username)

            elif u.role == 'FACULTY':
                add_node(uid, f"{u.username}", "faculty_user", details={"Email": u.email, "Role": u.role})
                try:
                    profile = u.faculty_profile
                    pid = f"fac_prof_{profile.id}"
                    add_node(pid, f"{profile.designation}", "faculty_profile")
                    add_edge(uid, pid)
                    
                    if profile.department:
                        add_edge(pid, f"dept_{profile.department.id}", "Belongs To")
                    else:
                        log_missing(uid, "FACULTY missing Department", u.username)
                except FacultyProfile.DoesNotExist:
                    log_missing(uid, "FACULTY missing FacultyProfile", u.username)
            
            elif u.role == 'PROSPECTIVE_STUDENT':
                add_node(uid, f"{u.username}", "prospective_user", details={"Email": u.email, "Role": u.role})
                try:
                    profile = u.applicant_profile
                    pid = f"app_prof_{profile.id}"
                    add_node(pid, f"REG: {profile.registration_number}", "applicant_profile")
                    add_edge(uid, pid)
                    
                    apps = profile.applications.all()
                    if not apps:
                        # Warning not error
                        for n in nodes:
                            if n["id"] == uid:
                                n["data"]["status"] = "warning"
                    for app in apps:
                        aid = f"app_{app.id}"
                        add_node(aid, f"App: {app.status}", "application")
                        add_edge(pid, aid)
                        
                        try:
                            seat = app.seat_allocation
                            sid = f"seat_{seat.id}"
                            add_node(sid, f"Seat: {seat.allocated_program}", "seat")
                            add_edge(aid, sid)
                        except SeatAllocation.DoesNotExist:
                            if app.status in ['ENROLLED', 'ADMITTED', 'SELECTED']:
                                log_missing(aid, f"Application {app.status} missing Seat", app.application_number)
                except ApplicantProfile.DoesNotExist:
                    log_missing(uid, "PROSPECTIVE missing ApplicantProfile", u.username)
            else:
                 add_node(uid, f"{u.username}", "other_user", details={"Role": u.role})

        return Response({
            "stats": stats,
            "missing_mappings": missing_mappings,
            "nodes": nodes,
            "edges": edges
        })
