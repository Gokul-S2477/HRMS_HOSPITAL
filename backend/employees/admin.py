from django.contrib import admin
from .models import Employee, Department, Designation


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title')
    search_fields = ('title',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'emp_code', 'first_name', 'last_name', 'department',
        'designation', 'email', 'phone', 'joining_date', 'is_active'
    )
    list_filter = ('department', 'designation', 'is_active', 'employment_type')
    search_fields = (
        'emp_code', 'first_name', 'middle_name', 'last_name',
        'email', 'phone', 'alternate_phone'
    )
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('Basic Information', {
            'fields': (
                'emp_code', 'first_name', 'middle_name', 'last_name',
                'gender', 'date_of_birth', 'photo'
            )
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'alternate_phone', 'address')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_number')
        }),
        ('Work Details', {
            'fields': (
                'role', 'department', 'designation', 'joining_date',
                'employment_type', 'reporting_to', 'work_shift', 'work_location'
            )
        }),
        ('HR Details', {
            'fields': ('national_id', 'blood_group', 'marital_status', 'salary')
        }),
        ('System Information', {
            'fields': ('is_active', 'created_by', 'created_at', 'updated_at')
        }),
    )
