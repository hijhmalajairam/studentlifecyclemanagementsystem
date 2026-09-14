from django.db import models
from django.contrib.auth.models import AbstractUser
from erp_core.base_models import TimeStampedModel

class User(AbstractUser, TimeStampedModel):
    ROLE_CHOICES = (
        ('PROSPECTIVE_STUDENT', 'Prospective Student'),
        ('STUDENT', 'Student'),
        ('FACULTY', 'Faculty'),
        ('ADMIN', 'Admin'),
        ('PARENT', 'Parent'),
        ('HOD', 'Head of Department'),
        ('COMMITTEE', 'Disciplinary Committee'),
        ('INTERVIEWER', 'Interviewer / Document Verifier'),
    )
    
    ADMIN_ROLE_CHOICES = (
        ('FACULTY', 'Faculty'),
        ('HOD', 'Head of Department'),
        ('DEAN', 'Dean'),
        ('WARDEN', 'Warden'),
        ('MESS_INCHARGE', 'Mess Incharge'),
        ('FINANCE', 'Finance Officer'),
        ('PLACEMENT_COORDINATOR', 'Placement Coordinator'),
        ('EXAM_CONTROLLER', 'Exam Controller'),
        ('LAB_INCHARGE', 'Lab In-charge'),
        ('SPORTS_COORDINATOR', 'Sports Coordinator'),
        ('CULTURAL_COORDINATOR', 'Cultural Coordinator'),
        ('LIBRARY_INCHARGE', 'Library Incharge'),
        ('HOSTEL_WARDEN', 'Hostel Warden'),
        ('TRANSPORT_INCHARGE', 'Transport Incharge'),
        ('INTERVIEWER', 'Interviewer / Document Verifier'),
    )
    
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, default='PROSPECTIVE_STUDENT')
    additional_roles = models.JSONField(default=list, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    student = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='parents')
    
    # Dark mode preference
    dark_mode = models.BooleanField(default=False)

    @property
    def all_roles(self):
        """Returns a list of all roles (primary + additional)."""
        roles = [self.role]
        if self.additional_roles:
            roles.extend(self.additional_roles)
        return list(set(roles))
    
    @property
    def is_admin_user(self):
        return self.is_staff or self.role == 'ADMIN'
    
    @property
    def is_faculty_user(self):
        return self.role == 'FACULTY' or 'FACULTY' in (self.additional_roles or [])
    
    @property
    def is_hod(self):
        return self.role == 'HOD' or 'HOD' in (self.additional_roles or [])
    
    def has_admin_role(self, role_key):
        """Check if user has a specific administrative role."""
        return role_key in (self.additional_roles or [])

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
