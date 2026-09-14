from django.db import models
from django.conf import settings
from erp_core.base_models import SoftDeleteModel, TimeStampedModel
from .core import Department

class StudentProfile(SoftDeleteModel):
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    
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

    photo = models.ImageField(upload_to='student_photos/', blank=True, null=True)

    def __str__(self):
        return f"Profile: {self.user.username}"

class StudentMedicalRecord(SoftDeleteModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_medical')
    blood_group = models.CharField(max_length=20, blank=True, null=True)
    medical_conditions = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    family_doctor_name = models.CharField(max_length=100, blank=True, null=True)
    family_doctor_phone = models.CharField(max_length=20, blank=True, null=True)
    family_doctor_hospital = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Medical Record: {self.user.username}"

class StudentEducationHistory(SoftDeleteModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_education')
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

    def __str__(self):
        return f"Education History: {self.user.username}"

class StudentBankDetails(SoftDeleteModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_bank')
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    branch = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Bank Details: {self.user.username}"

class FacultyProfile(SoftDeleteModel):
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
    about = models.TextField(blank=True, help_text='Short bio or about text')

    class Meta:
        ordering = ['faculty_id']

    def __str__(self):
        return f"Faculty: {self.faculty_id} - {self.user.get_full_name()} ({self.designation})"
