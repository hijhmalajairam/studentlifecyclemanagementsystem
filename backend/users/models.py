from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
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
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, default='PROSPECTIVE_STUDENT')
    phone = models.CharField(max_length=15, blank=True, null=True)
    student = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='parents')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
