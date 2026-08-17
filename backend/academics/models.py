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
