from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, RegisterView, ProfileView, InterviewersListView, LogoutView, SystemMappingView, FacultyListView, UpdateUserRolesView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('interviewers/', InterviewersListView.as_view(), name='interviewers'),
    path('system/map/', SystemMappingView.as_view(), name='system_map'),
    path('faculty/', FacultyListView.as_view(), name='faculty_list'),
    path('<int:pk>/roles/', UpdateUserRolesView.as_view(), name='update_roles'),
]
