from django.db import models
from django.conf import settings

class Department(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Program(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    duration_years = models.IntegerField(default=4)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.department.code})"

class Enrollment(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('DISCIPLINARY_HOLD', 'Disciplinary Hold'),
        ('SUSPENDED', 'Suspended'),
        ('DROPOUT', 'Dropout'),
        ('GRADUATED', 'Graduated'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollment')
    enrollment_number = models.CharField(max_length=50, unique=True)
    fee_paid = models.BooleanField(default=False)
    academic_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    enrolled_date = models.DateTimeField(auto_now_add=True)
    internship_waived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.enrollment_number} - {self.user.username}"


class Course(models.Model):
    code = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=255)
    credits = models.IntegerField(default=3)
    semester = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.code} - {self.name}"


class SemesterRegistration(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='registrations')
    semester = models.IntegerField()
    is_summer_term = models.BooleanField(default=False)
    courses = models.ManyToManyField(Course, related_name='registrations')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('enrollment', 'semester', 'is_summer_term')

    def __str__(self):
        return f"{self.enrollment.enrollment_number} - Sem {self.semester}"


class Attendance(models.Model):
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
    )
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')

    class Meta:
        unique_together = ('enrollment', 'course', 'date')

    def __str__(self):
        return f"{self.enrollment.enrollment_number} - {self.course.code} on {self.date}"


class Leave(models.Model):
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

class Result(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='results')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='results')
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    grade = models.CharField(max_length=2)
    is_backlog = models.BooleanField(default=False)
    is_revaluation = models.BooleanField(default=False)

    class Meta:
        unique_together = ('enrollment', 'course', 'is_backlog', 'is_revaluation')

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.course.code} - {self.grade}'


class Fee(models.Model):
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


class Timetable(models.Model):
    DAY_CHOICES = (
        ('MON', 'Monday'), ('TUE', 'Tuesday'), ('WED', 'Wednesday'),
        ('THU', 'Thursday'), ('FRI', 'Friday'), ('SAT', 'Saturday'),
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='timetable_slots')
    faculty = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='timetable_slots')
    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['day', 'start_time']

    def __str__(self):
        return f'{self.course.code} - {self.day} {self.start_time}-{self.end_time}'


class Notification(models.Model):
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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.title}'


class RevaluationRequest(models.Model):
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


class TransferRequest(models.Model):
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


class NoDues(models.Model):
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='no_dues')
    library_cleared = models.BooleanField(default=False)
    hostel_cleared = models.BooleanField(default=False)
    fees_cleared = models.BooleanField(default=False)
    department_cleared = models.BooleanField(default=False)
    all_cleared = models.BooleanField(default=False)
    certificate_issued = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'NoDues: {self.enrollment.enrollment_number} - {"Cleared" if self.all_cleared else "Pending"}'


class DisciplinaryCase(models.Model):
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
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='disciplinary_cases')
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
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.title} ({self.status})'


class Company(models.Model):
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    hr_contact_name = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name

class FacultyInternshipOpportunity(models.Model):
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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} at {self.company.name}"

class Internship(models.Model):
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
    
    # Mentors
    faculty_mentor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='mentored_internships')
    supervisor_name = models.CharField(max_length=255, blank=True)
    supervisor_email = models.EmailField(blank=True)
    supervisor_phone = models.CharField(max_length=20, blank=True)
    
    # Workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    applied_date = models.DateTimeField(auto_now_add=True)
    approved_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Documents are now managed by InternshipDocument model

    
    # Evaluations (1-5)
    technical_skills_rating = models.IntegerField(null=True, blank=True)
    communication_rating = models.IntegerField(null=True, blank=True)
    teamwork_rating = models.IntegerField(null=True, blank=True)
    problem_solving_rating = models.IntegerField(null=True, blank=True)
    professionalism_rating = models.IntegerField(null=True, blank=True)
    attendance_rating = models.IntegerField(null=True, blank=True)
    faculty_remarks = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.company_name} ({self.status})'

class InternshipAuditLog(models.Model):
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)
    remarks = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.internship.id} - {self.action} at {self.timestamp}"

class InternshipDocument(models.Model):
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

class InternshipWindow(models.Model):
    title = models.CharField(max_length=255)
    min_semester = models.IntegerField(default=3)
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=6.0)
    min_attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=75.0)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

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

