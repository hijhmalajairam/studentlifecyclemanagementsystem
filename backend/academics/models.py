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
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollment')
    enrollment_number = models.CharField(max_length=50, unique=True)
    fee_paid = models.BooleanField(default=False)
    enrolled_date = models.DateTimeField(auto_now_add=True)

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
    courses = models.ManyToManyField(Course, related_name='registrations')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('enrollment', 'semester')

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
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='disciplinary_cases')
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_cases')
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_of_incident = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='OPEN')
    action_taken = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.title} ({self.status})'


class Internship(models.Model):
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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.enrollment.enrollment_number} - {self.company_name} ({self.status})'


class FacultyProfile(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    DESIGNATION_CHOICES = (
        ('Assistant Professor', 'Assistant Professor'),
        ('Associate Professor', 'Associate Professor'),
        ('Professor', 'Professor'),
        ('Lecturer', 'Lecturer'),
        ('Senior Lecturer', 'Senior Lecturer'),
    )
    ADMIN_ROLE_CHOICES = (
        ('None', 'None'),
        ('Head of Department', 'Head of Department'),
        ('Dean', 'Dean'),
        ('Exam Controller', 'Exam Controller'),
        ('Warden', 'Warden'),
        ('Hostel Warden', 'Hostel Warden'),
        ('Mess Incharge', 'Mess Incharge'),
        ('Finance Officer', 'Finance Officer'),
        ('Placement Coordinator', 'Placement Coordinator'),
        ('Lab In-charge', 'Lab In-charge'),
        ('Sports Coordinator', 'Sports Coordinator'),
        ('Cultural Coordinator', 'Cultural Coordinator'),
        ('Library Incharge', 'Library Incharge'),
        ('Transport Incharge', 'Transport Incharge'),
    )
    EMPLOYMENT_TYPE_CHOICES = (
        ('Permanent', 'Permanent'),
        ('Contract', 'Contract'),
        ('Visiting', 'Visiting'),
    )
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('On Leave', 'On Leave'),
        ('Sabbatical', 'Sabbatical'),
        ('Retired', 'Retired'),
    )

    faculty_id = models.CharField(max_length=10, unique=True)
    faculty_enrollment_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    institutional_email = models.EmailField(blank=True, null=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='faculty_profile')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    date_of_birth = models.DateField(null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='faculty_members')
    designation = models.CharField(max_length=100, choices=DESIGNATION_CHOICES, default='Assistant Professor')
    admin_role = models.CharField(max_length=50, choices=ADMIN_ROLE_CHOICES, default='None')
    additional_roles = models.JSONField(default=list, blank=True)
    highest_qualification = models.CharField(max_length=255, blank=True)
    alma_mater = models.CharField(max_length=255, blank=True)
    specialization = models.CharField(max_length=255, blank=True)
    years_of_experience = models.IntegerField(default=0)
    date_of_joining = models.DateField(null=True, blank=True)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='Permanent')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    phone = models.CharField(max_length=15, blank=True)
    office_room = models.CharField(max_length=50, blank=True)
    courses_taught = models.TextField(blank=True, help_text='Semicolon-separated list of courses')
    research_publications = models.IntegerField(default=0)
    sample_publication_venues = models.TextField(blank=True, help_text='Semicolon-separated venues')
    research_grants_received = models.IntegerField(default=0)
    total_grant_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    awards = models.TextField(blank=True)
    orcid_id = models.CharField(max_length=50, blank=True)
    linkedin = models.CharField(max_length=255, blank=True)
    student_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    leaves_taken_this_year = models.IntegerField(default=0)
    current_project = models.CharField(max_length=255, blank=True)
    
    # About / Bio
    about = models.TextField(blank=True, help_text='Short bio or about text')

    class Meta:
        ordering = ['faculty_id']

    def __str__(self):
        return f"Faculty: {self.faculty_id} - {self.user.get_full_name()} ({self.designation})"


class StudentProfile(models.Model):
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    enrollment = models.OneToOneField(Enrollment, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_profile')
    
    # Personal Details
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    nationality = models.CharField(max_length=50, default='Indian')
    religion = models.CharField(max_length=50, blank=True, null=True)
    domicile = models.CharField(max_length=50, blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    differently_abled = models.CharField(max_length=10, default='No')
    
    # Contact Details
    dob = models.DateField(null=True, blank=True)
    institutional_email = models.EmailField(blank=True, null=True)
    personal_email = models.EmailField(blank=True, null=True)
    alternate_email = models.EmailField(blank=True, null=True)
    mobile_no = models.CharField(max_length=15, blank=True, null=True)
    alternate_mobile_no = models.CharField(max_length=15, blank=True, null=True)
    sip_mobile = models.CharField(max_length=15, blank=True, null=True)
    skype_id = models.CharField(max_length=100, blank=True, null=True)
    birth_place = models.CharField(max_length=100, blank=True, null=True)
    native_place = models.CharField(max_length=100, blank=True, null=True)
    home_town = models.CharField(max_length=100, blank=True, null=True)
    home_state = models.CharField(max_length=100, blank=True, null=True)

    # Official Documents
    name_as_per_ssc = models.CharField(max_length=255, blank=True, null=True)
    name_as_per_aadhaar = models.CharField(max_length=255, blank=True, null=True)
    aadhaar_number = models.CharField(max_length=20, blank=True, null=True)

    # Academic Record
    class_10_school = models.CharField(max_length=255, blank=True, null=True)
    class_10_city = models.CharField(max_length=100, blank=True, null=True)
    class_10_board = models.CharField(max_length=100, blank=True, null=True)
    class_10_medium = models.CharField(max_length=50, blank=True, null=True)
    class_10_year = models.CharField(max_length=4, blank=True, null=True)
    class_10_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class_12_school = models.CharField(max_length=255, blank=True, null=True)
    class_12_city = models.CharField(max_length=100, blank=True, null=True)
    class_12_board = models.CharField(max_length=100, blank=True, null=True)
    class_12_medium = models.CharField(max_length=50, blank=True, null=True)
    class_12_year = models.CharField(max_length=4, blank=True, null=True)
    class_12_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # Permanent Address
    permanent_address = models.TextField(blank=True, null=True)
    permanent_city = models.CharField(max_length=100, blank=True, null=True)
    permanent_state = models.CharField(max_length=100, blank=True, null=True)
    permanent_pin = models.CharField(max_length=20, blank=True, null=True)

    # Mailing Address
    mailing_address = models.TextField(blank=True, null=True)
    mailing_city = models.CharField(max_length=100, blank=True, null=True)
    mailing_state = models.CharField(max_length=100, blank=True, null=True)
    mailing_pin = models.CharField(max_length=20, blank=True, null=True)

    # Local Address
    local_address = models.TextField(blank=True, null=True)
    local_city = models.CharField(max_length=100, blank=True, null=True)
    local_state = models.CharField(max_length=100, blank=True, null=True)
    local_pin = models.CharField(max_length=20, blank=True, null=True)
    
    # Father's Details
    father_name = models.CharField(max_length=255, blank=True, null=True)
    father_mobile = models.CharField(max_length=20, blank=True, null=True)
    father_email = models.EmailField(blank=True, null=True)
    father_qualification = models.CharField(max_length=100, blank=True, null=True)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    father_designation = models.CharField(max_length=100, blank=True, null=True)
    father_organisation = models.CharField(max_length=255, blank=True, null=True)
    father_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    father_office_address = models.TextField(blank=True, null=True)

    # Profile Fields
    objective = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    qualifications = models.TextField(blank=True, null=True)
    computer_proficiency = models.TextField(blank=True, null=True)
    awards_achievements = models.TextField(blank=True, null=True)
    extra_curricular_interests = models.TextField(blank=True, null=True)
    mis = models.TextField(blank=True, null=True)
    languages_known = models.CharField(max_length=255, blank=True, null=True)
    specialisation = models.CharField(max_length=255, blank=True, null=True)
    specialisation_ii = models.CharField(max_length=255, blank=True, null=True)
    minor = models.CharField(max_length=255, blank=True, null=True)

    # Medical Record & Family Doctor
    blood_group = models.CharField(max_length=20, blank=True, null=True)
    medical_conditions = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    family_doctor_name = models.CharField(max_length=100, blank=True, null=True)
    family_doctor_phone = models.CharField(max_length=20, blank=True, null=True)
    family_doctor_hospital = models.CharField(max_length=100, blank=True, null=True)

    # Bank A/C Details
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    branch = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)

    # Photo (Optional)
    photo = models.ImageField(upload_to='student_photos/', blank=True, null=True)

    def __str__(self):
        return f"Profile: {self.user.username}"
