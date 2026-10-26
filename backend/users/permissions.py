from rest_framework import permissions

def has_role(user, role):
    if not user or not user.is_authenticated:
        return False
    if user.role == role:
        return True
    if user.additional_roles and role in user.additional_roles:
        return True
    return False

def is_finance_incharge(user):
    if not user or not user.is_authenticated:
        return False
    if (
        has_role(user, 'ADMIN') or 
        user.is_staff or 
        has_role(user, 'DEAN') or 
        has_role(user, 'FINANCE') or 
        has_role(user, 'BURSAR')
    ):
        return True
    if hasattr(user, 'faculty_profile') and user.faculty_profile:
        fp = user.faculty_profile
        admin_role = (fp.admin_role or '').upper()
        if 'FINANCE' in admin_role or 'BURSAR' in admin_role or 'SCHOLARSHIP' in admin_role:
            return True
        if fp.additional_roles and any(r in ['FINANCE', 'BURSAR'] for r in fp.additional_roles):
            return True
    return False

class IsAdminUserOrReadOnly(permissions.IsAdminUser):
    def has_permission(self, request, view):
        is_admin = super().has_permission(request, view)
        return request.method in permissions.SAFE_METHODS or is_admin

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            has_role(request.user, 'ADMIN') or 
            request.user.is_staff or 
            has_role(request.user, 'DEAN') or 
            has_role(request.user, 'HOD') or
            has_role(request.user, 'FINANCE') or
            is_finance_incharge(request.user)
        ))

class IsAdminOrFinanceOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_finance_incharge(request.user)

class IsInterviewerRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            has_role(request.user, 'INTERVIEWER') or 
            has_role(request.user, 'FACULTY') or 
            has_role(request.user, 'HOD') or 
            has_role(request.user, 'DEAN') or 
            has_role(request.user, 'ADMIN')
        ))

class IsAdminOrInterviewer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            has_role(request.user, 'ADMIN') or 
            has_role(request.user, 'INTERVIEWER') or 
            request.user.is_staff or 
            has_role(request.user, 'DEAN') or 
            has_role(request.user, 'HOD') or 
            has_role(request.user, 'FACULTY')
        ))

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
