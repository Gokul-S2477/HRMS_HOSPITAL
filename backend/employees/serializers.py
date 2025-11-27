from rest_framework import serializers
from .models import Employee, Department, Designation, Policy


# =====================================
#        DEPARTMENT SERIALIZER
# =====================================
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'name', 'description')


# =====================================
#        DESIGNATION SERIALIZER
# =====================================
class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = ('id', 'title', 'description')


# =====================================
#        EMPLOYEE SERIALIZER
# =====================================
class EmployeeSerializer(serializers.ModelSerializer):

    department = DepartmentSerializer(read_only=True)
    designation = DesignationSerializer(read_only=True)

    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        allow_null=True,
        required=False
    )
    designation_id = serializers.PrimaryKeyRelatedField(
        queryset=Designation.objects.all(),
        source='designation',
        write_only=True,
        allow_null=True,
        required=False
    )

    reporting_to = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Employee
        fields = [
            # Basic Info
            'id', 'emp_code', 'first_name', 'middle_name', 'last_name',
            'gender', 'date_of_birth',

            # Contact
            'email', 'phone', 'alternate_phone', 'address',

            # Emergency
            'emergency_contact_name', 'emergency_contact_number',

            # Job Info
            'role',
            'department', 'department_id',
            'designation', 'designation_id',
            'joining_date',
            'employment_type',
            'reporting_to',

            # Extra HR info
            'national_id', 'blood_group', 'marital_status',
            'work_shift', 'work_location',

            # File
            'photo',

            # Payroll
            'salary',

            # Status
            'is_active',

            # Audit
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ('created_at', 'updated_at')


# =====================================
#           POLICY SERIALIZER
# =====================================
class PolicySerializer(serializers.ModelSerializer):

    # Read-only department details
    department_detail = DepartmentSerializer(source="department", read_only=True)

    class Meta:
        model = Policy
        fields = [
            "id",
            "title",            # 🟢 FIXED (was `name`)
            "appraisal_date",
            "department",       # write
            "department_detail",  # read
            "description",
            "file",
            "created_at",
        ]
        read_only_fields = ("id", "created_at", "department_detail")
