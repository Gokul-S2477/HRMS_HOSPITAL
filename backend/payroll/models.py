from django.db import models
from backend.employee.models import Employee

# 1️⃣ Salary Component Model
class SalaryComponent(models.Model):
    COMPONENT_TYPES = (
        ('earning', 'Earning'),
        ('deduction', 'Deduction'),
    )

    name = models.CharField(max_length=100)
    component_type = models.CharField(max_length=20, choices=COMPONENT_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.component_type})"


# 2️⃣ Employee Payroll Model
class EmployeePayroll(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.IntegerField()  # 1-12
    year = models.IntegerField()

    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Many components → one payroll
    components = models.ManyToManyField(SalaryComponent, blank=True)

    gross_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.name} - {self.month}/{self.year}"
