from django.contrib import admin
from users.models import User
from admission.models import AdmissionApplication, Document, Scholarship, ApplicantProfile, SeatAllocation
from academics.models import Enrollment, Course, SemesterRegistration, Attendance


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')


@admin.register(ApplicantProfile)
class ApplicantProfileAdmin(admin.ModelAdmin):
    list_display = ('registration_number', 'user', 'phone', 'city')
    search_fields = ('registration_number', 'user__username', 'phone', 'city')
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'registration_number', 'date_of_birth', 'gender', 'category', 'blood_group', 'nationality')
        }),
        ('Parent/Guardian Details', {
            'fields': ('father_name', 'mother_name', 'guardian_name', 'guardian_occupation', 'family_income')
        }),
        ('Contact & Address', {
            'fields': ('phone', 'permanent_address', 'correspondence_address', 'city', 'state', 'pincode')
        }),
    )

@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(admin.ModelAdmin):
    list_display = ('application_number', 'get_username', 'entry_type', 'status', 'applied_date')
    list_filter = ('status', 'entry_type', 'program')
    search_fields = ('application_number', 'profile__user__username', 'profile__user__email')
    fieldsets = (
        ('Application Details', {
            'fields': ('profile', 'program', 'application_number', 'entry_type', 'status', 'enrollment_number', 'scholarship_requested')
        }),
        ('Academic History - 10th', {
            'fields': ('tenth_school_name', 'tenth_board', 'tenth_passing_year', 'tenth_percentage')
        }),
        ('Academic History - 12th', {
            'fields': ('twelfth_school_name', 'twelfth_board', 'twelfth_passing_year', 'twelfth_percentage')
        }),
        ('Other Details', {
            'fields': ('extra_curricular_achievements', 'any_gap_years')
        }),
        ('Interview Tracking', {
            'fields': ('interviewer', 'interview_date', 'interviewer_notes')
        }),
    )

    def get_username(self, obj):
        return obj.profile.user.username
    get_username.short_description = 'User'
    get_username.admin_order_field = 'profile__user__username'

@admin.register(SeatAllocation)
class SeatAllocationAdmin(admin.ModelAdmin):
    list_display = ('application', 'allocated_program', 'allocated_department')
    search_fields = ('application__application_number', 'allocated_program')


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('document_name', 'application', 'status', 'uploaded_at')
    list_filter = ('status',)


@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = ('application', 'status', 'concession_percentage')
    list_filter = ('status',)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('enrollment_number', 'user', 'fee_paid', 'enrolled_date')
    search_fields = ('enrollment_number', 'user__username')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'credits', 'semester')
    list_filter = ('semester',)
    search_fields = ('code', 'name')


@admin.register(SemesterRegistration)
class SemesterRegistrationAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'semester', 'registered_at')
    list_filter = ('semester',)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'course', 'date', 'status')
    list_filter = ('status', 'course', 'date')
