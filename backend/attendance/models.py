from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from employees.models import Employee  # link to Employee table

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('On Leave', 'On Leave'),
        ('Half Day', 'Half Day'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(default=timezone.now)
    check_in = models.TimeField(blank=True, null=True)
    check_out = models.TimeField(blank=True, null=True)
    work_duration = models.DurationField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Calculate total work duration automatically
        if self.check_in and self.check_out:
            start = timezone.datetime.combine(self.date, self.check_in)
            end = timezone.datetime.combine(self.date, self.check_out)
            if end > start:
                self.work_duration = end - start
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.first_name} - {self.date} ({self.status})"
