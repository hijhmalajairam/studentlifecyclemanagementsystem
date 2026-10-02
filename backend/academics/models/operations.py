from django.db import models
from django.conf import settings
from erp_core.base_models import SoftDeleteModel, TimeStampedModel
from .enrollment import Enrollment

class Leave(SoftDeleteModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='leaves')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    applied_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.start_date} to {self.end_date}'

class TransferRequest(SoftDeleteModel):
    TYPE_CHOICES = (
        ('TRANSFER_OUT', 'Transfer Out'),
        ('DROPOUT', 'Dropout'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='transfer_requests')
    request_type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.request_type} - {self.status}'

class NoDues(SoftDeleteModel):
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='no_dues')
    library_cleared = models.BooleanField(default=False)
    hostel_cleared = models.BooleanField(default=False)
    fees_cleared = models.BooleanField(default=False)
    department_cleared = models.BooleanField(default=False)
    all_cleared = models.BooleanField(default=False)
    certificate_issued = models.BooleanField(default=False)

    def __str__(self):
        return f'NoDues: {self.enrollment.enrollment_number} - {"Cleared" if self.all_cleared else "Pending"}'

class DisciplinaryCase(SoftDeleteModel):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('UNDER_REVIEW', 'Under Review'),
        ('RESOLVED', 'Resolved'),
    )
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='disciplinary_cases')
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_cases')
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_of_incident = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='OPEN')
    action_taken = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.title} ({self.status})'

class Internship(SoftDeleteModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('COMPLETED', 'Completed'),
        ('REJECTED', 'Rejected'),
    )
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='internships')
    company_name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    stipend = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    supervisor_name = models.CharField(max_length=255, blank=True)
    supervisor_email = models.EmailField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    report_file = models.FileField(upload_to='internships/', blank=True, null=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.company_name} ({self.status})'

class Fee(SoftDeleteModel):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
    )
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='fees')
    semester = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    scholarship_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ('enrollment', 'semester')

    def net_amount(self):
        return float(self.amount) * (1 - float(self.scholarship_discount) / 100)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - Sem {self.semester} - {self.status}'

class Notification(TimeStampedModel):
    TYPE_CHOICES = (
        ('INFO', 'Information'),
        ('WARNING', 'Warning'),
        ('ALERT', 'Alert'),
        ('SUCCESS', 'Success'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='INFO')
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.title}'
