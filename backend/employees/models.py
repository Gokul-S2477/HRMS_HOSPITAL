# backend/employees/models.py
from django.db import models
from django.utils import timezone

class Department(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Designation(models.Model):
    title = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title


class Employee(models.Model):
    EMPLOYEE_ROLES = [
        ('Doctor', 'Doctor'),
        ('Nurse', 'Nurse'),
        ('Admin', 'Admin'),
        ('HR', 'HR'),
        ('Technician', 'Technician'),
        ('Receptionist', 'Receptionist'),
        ('Pharmacist', 'Pharmacist'),
        ('Other', 'Other'),
    ]

    EMPLOYMENT_TYPES = [
        ('Full-Time', 'Full-Time'),
        ('Part-Time', 'Part-Time'),
        ('Contract', 'Contract'),
        ('Intern', 'Intern'),
    ]

    MARITAL_STATUS = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Divorced', 'Divorced'),
        ('Widowed', 'Widowed'),
    ]

    # Basic Details
    emp_code = models.CharField(max_length=50, unique=True, verbose_name="Employee ID")
    first_name = models.CharField(max_length=120)
    middle_name = models.CharField(max_length=120, blank=True, null=True)
    last_name = models.CharField(max_length=120, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    # Contact Details
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    alternate_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=120, blank=True, null=True)
    emergency_contact_number = models.CharField(max_length=15, blank=True, null=True)

    # Work Information
    role = models.CharField(max_length=60, choices=EMPLOYEE_ROLES, default='Other')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees")
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True, related_name="employees")
    joining_date = models.DateField(null=True, blank=True)
    employment_type = models.CharField(max_length=30, choices=EMPLOYMENT_TYPES, default='Full-Time')
    reporting_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name="subordinates")

    # Optional HR Fields
    national_id = models.CharField(max_length=120, blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    marital_status = models.CharField(max_length=15, choices=MARITAL_STATUS, default='Single')

    # Work Shift Info (useful for scheduling)
    work_shift = models.CharField(max_length=120, blank=True, null=True)
    work_location = models.CharField(max_length=120, blank=True, null=True)

    # Profile Photo
    photo = models.ImageField(upload_to='employee_photos/', blank=True, null=True)

    # Payroll
    salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Status Flags
    is_active = models.BooleanField(default=True)

    # Audit
    created_by = models.CharField(max_length=120, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name or ''} ({self.emp_code})"
