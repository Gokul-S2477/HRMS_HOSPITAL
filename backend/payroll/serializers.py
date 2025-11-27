from rest_framework import serializers
from .models import SalaryComponent, EmployeePayroll
from employee.models import Employee


# 1️⃣ Salary Component Serializer
class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = '__all__'


# 2️⃣ Employee Payroll Serializer
class EmployeePayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    components_details = SalaryComponentSerializer(source='components', many=True, read_only=True)

    class Meta:
        model = EmployeePayroll
        fields = [
            'id',
            'employee',
            'employee_name',
            'month',
            'year',
            'basic_salary',
            'hra',
            'components',
            'components_details',
            'gross_salary',
            'total_deductions',
            'net_salary',
            'created_at',
        ]

    def validate(self, data):
        """
        Prevent duplicate payroll for same month/year/employee
        """
        employee = data.get('employee')
        month = data.get('month')
        year = data.get('year')

        if self.instance is None:  # Creating new record
            if EmployeePayroll.objects.filter(employee=employee, month=month, year=year).exists():
                raise serializers.ValidationError("Payroll already exists for this employee for this month.")
        
        return data

    def create(self, validated_data):
        """
        Auto calculate gross, deductions and net salary
        """
        payroll = EmployeePayroll.objects.create(**validated_data)

        # After save, add components
        components = self.initial_data.get('components', [])
        payroll.components.set(components)

        # Calculate earnings and deductions
        earnings = sum(c.amount for c in payroll.components.filter(component_type='earning'))
        deductions = sum(c.amount for c in payroll.components.filter(component_type='deduction'))

        gross = payroll.basic_salary + payroll.hra + earnings

        payroll.gross_salary = gross
        payroll.total_deductions = deductions
        payroll.net_salary = gross - deductions
        payroll.save()

        return payroll
