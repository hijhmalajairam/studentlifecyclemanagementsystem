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

class InternalAssessment(models.Model):
    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted'),
        ('EVALUATED', 'Evaluated'),
        ('FLAGGED_MALPRACTICE', 'Flagged Malpractice'),
    )
    ASSESSMENT_TYPES = (
        ('MID_1', 'Mid 1'),
        ('MID_2', 'Mid 2'),
        ('LAB_1', 'Lab 1'),
        ('LAB_2', 'Lab 2'),
        ('COMPRE', 'Compre'),
    )
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='internal_assessments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='internal_assessments')
    title = models.CharField(max_length=255, choices=ASSESSMENT_TYPES, default='MID_1')
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weightage = models.IntegerField(default=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.course.code} - {self.title}'

class CourseGradingScheme(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('FINALIZED', 'Finalized (Pending Approval)'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    GRADING_TYPE_CHOICES = (
        ('ABSOLUTE', 'Absolute'),
        ('RELATIVE', 'Relative'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grading_schemes')
    grading_type = models.CharField(max_length=20, choices=GRADING_TYPE_CHOICES, default='RELATIVE')
    mean = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    std_dev = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    finalized_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='finalized_courses')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('course',)
    
    def __str__(self):
        return f'{self.course.code} - {self.status}'
