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
    ASSESSMENT_TYPE_CHOICES = (
        ('INTERNAL_EXAM', 'Internal Exam'),
        ('ASSIGNMENT', 'Assignment'),
        ('LAB_PRACTICAL', 'Lab Practical'),
        ('SEMESTER_EXAM', 'Semester Exam'),
        ('CONDUCT', 'Conduct'),
    )
    COMMITTEE_DECISION_CHOICES = (
        ('PENDING', 'Pending'),
        ('CLEARED', 'Cleared'),
        ('MARKS_CANCELLED', 'Marks Cancelled'),
        ('SUSPENSION_YEAR_DROP', 'Suspension / Year Drop'),
    )
    case_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='disciplinary_cases')
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_cases')
    course = models.ForeignKey('Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='disciplinary_cases')
    title = models.CharField(max_length=255)
    description = models.TextField()
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPE_CHOICES, default='CONDUCT')
    date_of_incident = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='OPEN')
    action_taken = models.TextField(blank=True, null=True)
    evidence_file = models.FileField(upload_to='disciplinary_evidence/', blank=True, null=True)
    
    committee_decision = models.CharField(max_length=25, choices=COMMITTEE_DECISION_CHOICES, default='PENDING')
    committee_remarks = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_cases')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.title} ({self.status})'

class Company(SoftDeleteModel):
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    hr_contact_name = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name

class FacultyInternshipOpportunity(SoftDeleteModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    faculty_creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.TextField(blank=True)
    eligibility = models.TextField(blank=True)
    duration_months = models.IntegerField()
    stipend = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    location = models.CharField(max_length=255, blank=True)
    work_mode = models.CharField(max_length=20, default='ONSITE')
    application_deadline = models.DateField()
    available_positions = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.role} at {self.company.name}"

class Internship(SoftDeleteModel):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('PENDING', 'Pending Faculty Review'),
        ('CHANGES_REQUIRED', 'Changes Required'),
        ('RESUBMITTED', 'Resubmitted'),
        ('APPROVED', 'Approved'),
        ('ASSIGNED', 'Assigned by Faculty'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
        ('WAIVED', 'Waived'),
    )
    WORK_MODE_CHOICES = (
        ('ONSITE', 'On-site'),
        ('REMOTE', 'Remote'),
        ('HYBRID', 'Hybrid'),
    )
    
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='internships')
    opportunity = models.ForeignKey(FacultyInternshipOpportunity, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='internships')
    company_name = models.CharField(max_length=255, help_text="Legacy or custom company name", blank=True)
    role = models.CharField(max_length=255)
    internship_type = models.CharField(max_length=100, blank=True)
    work_mode = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, default='ONSITE')
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    
    start_date = models.DateField()
    end_date = models.DateField()
    stipend = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    faculty_mentor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='mentored_internships')
    supervisor_name = models.CharField(max_length=255, blank=True)
    supervisor_email = models.EmailField(blank=True)
    supervisor_phone = models.CharField(max_length=20, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    applied_date = models.DateTimeField(auto_now_add=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    technical_skills_rating = models.IntegerField(null=True, blank=True)
    communication_rating = models.IntegerField(null=True, blank=True)
    teamwork_rating = models.IntegerField(null=True, blank=True)
    problem_solving_rating = models.IntegerField(null=True, blank=True)
    professionalism_rating = models.IntegerField(null=True, blank=True)
    attendance_rating = models.IntegerField(null=True, blank=True)
    faculty_remarks = models.TextField(blank=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.company_name} ({self.status})'

class InternshipAuditLog(SoftDeleteModel):
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)
    remarks = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.internship.id} - {self.action} at {self.timestamp}"

class InternshipDocument(SoftDeleteModel):
    DOCUMENT_TYPES = (
        ('RESUME', 'Resume/CV'),
        ('OFFER_LETTER', 'Offer Letter'),
        ('CONFIRMATION', 'Internship Confirmation Letter'),
        ('COVER_LETTER', 'Cover Letter'),
        ('OTHER', 'Other Supporting Document'),
    )
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='internships/documents/')
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_type} for {self.internship}"

class InternshipWindow(SoftDeleteModel):
    title = models.CharField(max_length=255)
    min_semester = models.IntegerField(default=3)
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=6.0)
    min_attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=75.0)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

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
