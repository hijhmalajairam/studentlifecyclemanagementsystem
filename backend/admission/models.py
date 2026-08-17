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
    guardian_name = models.CharField(max_length=255, blank=True)
    guardian_occupation = models.CharField(max_length=255, blank=True)
    family_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Demographics
    date_of_birth = models.DateField(null=True, blank=True)
    GENDER_CHOICES = (('M', 'Male'), ('F', 'Female'), ('O', 'Other'))
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    CATEGORY_CHOICES = (('GEN', 'General'), ('SC', 'SC'), ('ST', 'ST'), ('OBC', 'OBC'), ('OTHER', 'Other'))
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='GEN')
    blood_group = models.CharField(max_length=5, blank=True)
    nationality = models.CharField(max_length=50, default='Indian')
    
    # Contact & Address
    phone = models.CharField(max_length=15, blank=True)
    permanent_address = models.TextField(blank=True)
    correspondence_address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=20, blank=True)

    def save(self, *args, **kwargs):
        import uuid
        if not self.registration_number:
            year = timezone.now().year
            # e.g., REG-2024-XXXX
            rand_str = uuid.uuid4().hex[:6].upper()
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
    program = models.ForeignKey('academics.Program', on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    application_number = models.CharField(max_length=50, unique=True, blank=True)
    entry_type = models.CharField(max_length=15, choices=ENTRY_CHOICES, default='ONLINE')
    
    # 10th Academic Details
    tenth_school_name = models.CharField(max_length=255, blank=True)
    tenth_board = models.CharField(max_length=100, blank=True)
    tenth_passing_year = models.IntegerField(null=True, blank=True)
    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # 12th Academic Details
    twelfth_school_name = models.CharField(max_length=255, blank=True)
    twelfth_board = models.CharField(max_length=100, blank=True)
    twelfth_passing_year = models.IntegerField(null=True, blank=True)
    twelfth_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    extra_curricular_achievements = models.TextField(blank=True)
    any_gap_years = models.BooleanField(default=False)
    
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
        import uuid
        if not self.application_number and self.status != 'DRAFT':
            year = timezone.now().year
            # In a real app this would lock and increment, using random for prototype
            rand_str = uuid.uuid4().hex[:6].upper()
            self.application_number = f"APP-{year}-{rand_str}"
        
        if not self.enrollment_number and self.status == 'ENROLLED':
            year = timezone.now().year
            rand_str = uuid.uuid4().hex[:6].upper()
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
