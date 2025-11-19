from django.db import models

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

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    MARITAL_STATUS = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Divorced', 'Divorced'),
        ('Widowed', 'Widowed'),
    ]

    # Basic Information
    employee_id = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    date_of_birth = models.DateField(null=True, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=100, default='India')

    # Job Details
    role = models.CharField(max_length=50, choices=EMPLOYEE_ROLES)
    department = models.CharField(max_length=100, blank=True)
    date_of_joining = models.DateField()
    employment_type = models.CharField(
        max_length=50,
        choices=[('Full-time', 'Full-time'), ('Part-time', 'Part-time'), ('Contract', 'Contract')],
        default='Full-time'
    )
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    reporting_manager = models.CharField(max_length=100, blank=True)

    # Bank & Documents
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=20, blank=True)
    ifsc_code = models.CharField(max_length=15, blank=True)
    pan_number = models.CharField(max_length=15, blank=True)
    aadhaar_number = models.CharField(max_length=20, blank=True)

    # Emergency & Personal
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_number = models.CharField(max_length=15, blank=True)
    marital_status = models.CharField(max_length=15, choices=MARITAL_STATUS, default='Single')
    blood_group = models.CharField(max_length=10, blank=True)

    # Profile Photo
    photo = models.ImageField(upload_to='employee_photos/', blank=True, null=True)

    # Status & Timestamps
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.role}"
