from django.db import models
from django.conf import settings
from erp_core.base_models import SoftDeleteModel, TimeStampedModel
from .core import Course, Program

class Enrollment(SoftDeleteModel):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('DISCIPLINARY_HOLD', 'Disciplinary Hold'),
        ('DROPOUT', 'Dropout'),
        ('GRADUATED', 'Graduated')
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollment')
    enrollment_number = models.CharField(max_length=50, unique=True)
    program = models.ForeignKey(Program, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrollments')
    academic_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='ACTIVE')
    current_year = models.IntegerField(default=1)
    current_semester = models.IntegerField(default=1)
    internship_waived = models.BooleanField(default=False)
    fee_paid = models.BooleanField(default=False)
    enrolled_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.enrollment_number} - {self.user.username}"

class SemesterRegistration(SoftDeleteModel):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='registrations')
    semester = models.IntegerField()
    courses = models.ManyToManyField(Course, related_name='registrations')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('enrollment', 'semester')

    def __str__(self):
        return f"{self.enrollment.enrollment_number} - Sem {self.semester}"
