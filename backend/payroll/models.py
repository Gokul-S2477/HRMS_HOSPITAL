from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from employees.models import Employee

class Payroll(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_records')
    month = models.CharField(max_length=20)  # e.g. "November 2025"
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    bonuses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    paid_on = models.DateField(default=timezone.now)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calculate total salary
        self.total_salary = (self.basic_salary + self.bonuses) - self.deductions
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.first_name} - {self.month}"
