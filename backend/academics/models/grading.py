from django.db import models
from django.conf import settings
from erp_core.base_models import SoftDeleteModel, TimeStampedModel
from .core import Course, AcademicTerm
from .enrollment import Enrollment

class Result(SoftDeleteModel):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='results')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='results')
    academic_term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE, related_name='results', null=True, blank=True)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    grade = models.CharField(max_length=2)
    is_backlog = models.BooleanField(default=False)
    is_revaluation = models.BooleanField(default=False)

    class Meta:
        unique_together = ('enrollment', 'course', 'academic_term', 'is_backlog', 'is_revaluation')

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.course.code} - {self.grade}'

class RevaluationRequest(SoftDeleteModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
    )
    result = models.ForeignKey(Result, on_delete=models.CASCADE, related_name='revaluation_requests')
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    requested_at = models.DateTimeField(auto_now_add=True)
    new_marks = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    new_grade = models.CharField(max_length=2, blank=True)

    def __str__(self):
        return f'Reval: {self.result} - {self.status}'
