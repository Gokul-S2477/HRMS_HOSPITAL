from rest_framework import serializers
from .models import SalaryComponent, EmployeePayroll
from employees.models import Employee


class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = ['id', 'name', 'component_type', 'amount']


class EmployeePayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    components_details = SalaryComponentSerializer(source='components', many=True, read_only=True)

    class Meta:
        model = EmployeePayroll
        fields = [
            'id', 'employee', 'employee_name', 'month', 'year',
            'basic_salary', 'hra', 'components', 'components_details',
            'gross_salary', 'total_deductions', 'net_salary', 'notes', 'created_at'
        ]
        read_only_fields = ('gross_salary','total_deductions','net_salary','created_at')

    def validate(self, data):
        # Prevent duplicate payroll entries
        if self.instance is None:
            emp = data.get('employee')
            if emp and EmployeePayroll.objects.filter(employee=emp, month=data.get('month'), year=data.get('year')).exists():
                raise serializers.ValidationError("Payroll already exists for this employee/month/year.")
        return data

    def create(self, validated_data):
        components = self.initial_data.get('components', [])
        payroll = EmployeePayroll.objects.create(**validated_data)
        if components:
            payroll.components.set(components)
        payroll.calculate()
        payroll.save()
        return payroll

    def update(self, instance, validated_data):
        components = self.initial_data.get('components', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if components is not None:
            instance.components.set(components)
        instance.calculate()
        instance.save()
        return instance
