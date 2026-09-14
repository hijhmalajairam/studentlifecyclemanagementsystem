from django.db import models
from django.conf import settings
from erp_core.base_models import SoftDeleteModel, TimeStampedModel
from .core import Course, CourseSection
from .enrollment import Enrollment

class Attendance(SoftDeleteModel):
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

class Timetable(SoftDeleteModel):
    DAY_CHOICES = (
        ('MON', 'Monday'), ('TUE', 'Tuesday'), ('WED', 'Wednesday'),
        ('THU', 'Thursday'), ('FRI', 'Friday'), ('SAT', 'Saturday'),
    )
    course_section = models.ForeignKey(CourseSection, on_delete=models.CASCADE, related_name='timetable_slots', null=True, blank=True)
    faculty = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='timetable_slots')
    day = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['day', 'start_time']

    def __str__(self):
        return f'{self.course_section} - {self.day} {self.start_time}-{self.end_time}'
