from rest_framework import permissions

def has_role(user, role):
    if not user or not user.is_authenticated:
        return False
    if user.role == role:
        return True
    if user.additional_roles and role in user.additional_roles:
        return True
    return False

class IsAdminUserOrReadOnly(permissions.IsAdminUser):
    def has_permission(self, request, view):
        is_admin = super().has_permission(request, view)
        return request.method in permissions.SAFE_METHODS or is_admin

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (has_role(request.user, 'ADMIN') or request.user.is_staff or has_role(request.user, 'DEAN')))

class IsInterviewerRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, 'INTERVIEWER')

class IsAdminOrInterviewer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (has_role(request.user, 'ADMIN') or has_role(request.user, 'INTERVIEWER') or request.user.is_staff or has_role(request.user, 'DEAN')))

class IsProspectiveStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, 'PROSPECTIVE_STUDENT')

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, 'STUDENT')

class IsCommitteeRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (has_role(request.user, 'COMMITTEE') or request.user.is_staff or has_role(request.user, 'ADMIN')))

class IsAdminOrCommittee(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (has_role(request.user, 'ADMIN') or has_role(request.user, 'COMMITTEE') or request.user.is_staff))

class IsFacultyRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (has_role(request.user, 'FACULTY') or request.user.is_staff or has_role(request.user, 'ADMIN')))

class IsAdminOrDean(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            has_role(request.user, 'ADMIN') or 
            request.user.is_staff or 
            has_role(request.user, 'DEAN')
        ))
