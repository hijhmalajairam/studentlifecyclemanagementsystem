from django.db import models
from django.conf import settings
from erp_core.base_models import SoftDeleteModel, TimeStampedModel

class Department(SoftDeleteModel):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Program(SoftDeleteModel):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    duration_years = models.IntegerField(default=4)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.department.code})"

class Course(SoftDeleteModel):
    code = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=255)
    credits = models.IntegerField(default=3)
    semester = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.code} - {self.name}"

class AcademicTerm(SoftDeleteModel):
    term_name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    term_type = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.term_name

class CourseSection(SoftDeleteModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    academic_term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE, related_name='sections')
    capacity = models.IntegerField(default=60)

    def __str__(self):
        return f"{self.course.code} - {self.academic_term.term_name}"
