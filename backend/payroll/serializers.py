from rest_framework import serializers
from .models import Payroll
from employees.models import Employee

class EmployeeMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'first_name', 'last_name', 'role', 'department']

class PayrollSerializer(serializers.ModelSerializer):
    employee_details = EmployeeMiniSerializer(source='employee', read_only=True)

    class Meta:
        model = Payroll
        fields = '__all__'
