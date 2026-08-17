from django.contrib import admin
from .models import (
    Department, Program, Leave, Result, Fee, Timetable, Notification,
    RevaluationRequest, TransferRequest, NoDues
)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name')

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'duration_years')


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'start_date', 'end_date', 'status')
    list_filter = ('status',)


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'course', 'grade', 'marks_obtained', 'is_backlog')
    list_filter = ('grade', 'is_backlog')


@admin.register(Fee)
class FeeAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'semester', 'amount', 'scholarship_discount', 'status', 'due_date')
    list_filter = ('status', 'semester')


@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ('course', 'faculty', 'day', 'start_time', 'end_time', 'room')
    list_filter = ('day',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')


@admin.register(RevaluationRequest)
class RevaluationRequestAdmin(admin.ModelAdmin):
    list_display = ('result', 'status', 'requested_at')
    list_filter = ('status',)


@admin.register(TransferRequest)
class TransferRequestAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'request_type', 'status', 'requested_at')
    list_filter = ('request_type', 'status')


@admin.register(NoDues)
class NoDuesAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'library_cleared', 'hostel_cleared', 'fees_cleared', 'department_cleared', 'all_cleared')
    list_filter = ('all_cleared',)

from .models import DisciplinaryCase, Internship

@admin.register(DisciplinaryCase)
class DisciplinaryCaseAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'title', 'status', 'date_of_incident')
    list_filter = ('status',)

@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'company_name', 'role', 'status')
    list_filter = ('status',)
