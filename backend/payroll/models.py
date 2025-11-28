from django.db import models
from django.utils import timezone

# import your employee model - change path only if employee app label differs
from employees.models import Employee


class SalaryComponent(models.Model):
    COMPONENT_TYPES = (
        ('earning', 'Earning'),
        ('deduction', 'Deduction'),
    )
    name = models.CharField(max_length=120)
    component_type = models.CharField(max_length=20, choices=COMPONENT_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Fixed amount")

    def __str__(self):
        return f"{self.name} ({self.component_type})"


class EmployeePayroll(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="payrolls")
    month = models.PositiveSmallIntegerField()  # 1..12
    year = models.PositiveSmallIntegerField()
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    hra = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    components = models.ManyToManyField(SalaryComponent, blank=True)  # selected components

    gross_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('employee', 'month', 'year')
        ordering = ['-year', '-month', '-employee']

    def __str__(self):
        return f"{self.employee} - {self.month}/{self.year}"

    def calculate(self):
        earnings = sum([c.amount for c in self.components.filter(component_type='earning')])
        deductions = sum([c.amount for c in self.components.filter(component_type='deduction')])
        gross = (self.basic_salary or 0) + (self.hra or 0) + earnings
        self.gross_salary = gross
        self.total_deductions = deductions
        self.net_salary = gross - deductions
        return self.net_salary
