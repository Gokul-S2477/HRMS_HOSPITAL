from rest_framework import serializers
from .models import Attendance
from employees.models import Employee

class EmployeeMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'first_name', 'last_name', 'role', 'department']

class AttendanceSerializer(serializers.ModelSerializer):
    employee_details = EmployeeMiniSerializer(source='employee', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
