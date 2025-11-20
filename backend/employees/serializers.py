# backend/employees/serializers.py
from rest_framework import serializers
from .models import Employee, Department, Designation

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'name', 'description')


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = ('id', 'title', 'description')


class EmployeeSerializer(serializers.ModelSerializer):
    # READ-ONLY nested serializers
    department = DepartmentSerializer(read_only=True)
    designation = DesignationSerializer(read_only=True)

    # WRITE-ONLY fields (for POST/PUT)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False,
        allow_null=True
    )
    designation_id = serializers.PrimaryKeyRelatedField(
        queryset=Designation.objects.all(),
        source='designation',
        write_only=True,
        required=False,
        allow_null=True
    )

    reporting_to = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Employee
        fields = [
            # Basic Info
            'id',
            'emp_code',
            'first_name',
            'middle_name',
            'last_name',
            'gender',
            'date_of_birth',

            # Contact Info
            'email',
            'phone',
            'alternate_phone',
            'address',

            # Emergency Contact
            'emergency_contact_name',
            'emergency_contact_number',

            # Job Info
            'role',
            'department',
            'department_id',
            'designation',
            'designation_id',
            'joining_date',
            'employment_type',
            'reporting_to',

            # Extra HR info
            'national_id',
            'blood_group',
            'marital_status',
            'work_shift',
            'work_location',

            # Profile photo
            'photo',

            # Payroll
            'salary',

            # Status
            'is_active',

            # Audit
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('created_at', 'updated_at')
