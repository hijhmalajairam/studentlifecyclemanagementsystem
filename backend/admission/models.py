from django.db import models
from django.conf import settings
from django.utils import timezone
import random
import string

class ApplicantProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applicant_profile')
    registration_number = models.CharField(max_length=50, unique=True, blank=True)
    father_name = models.CharField(max_length=255, blank=True)
    mother_name = models.CharField(max_length=255, blank=True)
    family_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=15, blank=True)

    def save(self, *args, **kwargs):
        if not self.registration_number:
            year = timezone.now().year
            # e.g., REG-2024-XXXX
            rand_str = ''.join(random.choices(string.digits, k=4))
            self.registration_number = f"REG-{year}-{rand_str}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.registration_number} - {self.user.username}"


class AdmissionApplication(models.Model):
    ENTRY_CHOICES = (
        ('ONLINE', 'Online Regular'),
        ('OFFLINE', 'Offline/Paper Application'),
        ('LATERAL', 'Lateral Entry Yr2'),
        ('TRANSFER', 'Transfer Student'),
        ('DIRECT', 'Direct Admission'),
    )
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('INTERVIEW_SCHEDULED', 'Interview Scheduled'),
        ('INTERVIEW_PASSED', 'Interview Passed (Eligible)'),
        ('INTERVIEW_FAILED', 'Interview Failed (Not Eligible)'),
        ('SELECTED', 'Selected for Admission'),
        ('REJECTED', 'Rejected'),
        ('FEE_PENDING', 'Fee Pending'),
        ('ENROLLED', 'Enrolled'),
    )

    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='applications')
    application_number = models.CharField(max_length=50, unique=True, blank=True)
    entry_type = models.CharField(max_length=15, choices=ENTRY_CHOICES, default='ONLINE')
    
    # Academic Details
    previous_school_name = models.CharField(max_length=255)
    previous_marks_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    scholarship_requested = models.BooleanField(default=False)
    
    # Interview Tracking
    interviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='interviews_assigned')
    interview_date = models.DateTimeField(null=True, blank=True)
    interviewer_notes = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    enrollment_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    applied_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.application_number and self.status != 'DRAFT':
            year = timezone.now().year
            # In a real app this would lock and increment, using random for prototype
            rand_str = ''.join(random.choices(string.digits, k=4))
            self.application_number = f"APP-{year}-{rand_str}"
        
        if not self.enrollment_number and self.status == 'ENROLLED':
            year = timezone.now().year
            rand_str = ''.join(random.choices(string.digits, k=4))
            self.enrollment_number = f"ENR-{year}-{rand_str}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.application_number or 'DRAFT'} - {self.profile.user.username}"


class Document(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('FORGED', 'Forged/Rejected'),
    )
    application = models.ForeignKey(AdmissionApplication, on_delete=models.CASCADE, related_name='documents')
    document_name = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_name} for {self.application.application_number}"


class Scholarship(models.Model):
    STATUS_CHOICES = (
        ('APPLIED', 'Applied'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    application = models.OneToOneField(AdmissionApplication, on_delete=models.CASCADE, related_name='scholarship')
    reason = models.TextField()
    concession_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='APPLIED')

    def __str__(self):
        return f"Scholarship for {self.application.application_number}"

class SeatAllocation(models.Model):
    application = models.OneToOneField(AdmissionApplication, on_delete=models.CASCADE, related_name='seat_allocation')
    allocated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Ideally these would be ForeignKeys to Department/Batch models
    # but for now we store the requested strings before the Hierarchy phase
    allocated_department = models.CharField(max_length=100)
    allocated_program = models.CharField(max_length=100)
    allocated_batch = models.CharField(max_length=100)
    
    allocated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Seat for {self.application.application_number} in {self.allocated_program}"
