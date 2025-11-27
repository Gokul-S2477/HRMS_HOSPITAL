from rest_framework import serializers
from .models import Employee, Department, Designation, Policy


# ==============================================================
#                     DEPARTMENT SERIALIZER
# ==============================================================
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ("id", "name", "description")


# ==============================================================
#                     DESIGNATION SERIALIZER
# ==============================================================
class DesignationSerializer(serializers.ModelSerializer):

    # READ-ONLY nested department info
    department_detail = DepartmentSerializer(source="department", read_only=True)

    # WRITE-ONLY department foreign key
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = Designation
        fields = (
            "id",
            "title",
            "description",
            "department_id",       # write-only FK
            "department_detail",   # read-only nested object
        )
        read_only_fields = ("department_detail",)


# ==============================================================
#                     EMPLOYEE SERIALIZER
# ==============================================================
class EmployeeSerializer(serializers.ModelSerializer):

    # READ nested objects
    department = DepartmentSerializer(read_only=True)
    designation = DesignationSerializer(read_only=True)

    # WRITE-ONLY fields
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True,
        allow_null=True,
        required=False
    )

    designation_id = serializers.PrimaryKeyRelatedField(
        queryset=Designation.objects.all(),
        source="designation",
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
            "id",
            "emp_code",
            "first_name",
            "middle_name",
            "last_name",
            "gender",
            "date_of_birth",

            # Contact
            "email",
            "phone",
            "alternate_phone",
            "address",

            # Emergency
            "emergency_contact_name",
            "emergency_contact_number",

            # Job Info
            "role",
            "department",
            "department_id",
            "designation",
            "designation_id",
            "joining_date",
            "employment_type",
            "reporting_to",

            # HR Info
            "national_id",
            "blood_group",
            "marital_status",
            "work_shift",
            "work_location",

            # Profile
            "photo",

            # Payroll
            "salary",

            # Status
            "is_active",

            # Audit
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("created_at", "updated_at")


# ==============================================================
#                     POLICY SERIALIZER
# ==============================================================
# ==============================================================
#                     POLICY SERIALIZER
# ==============================================================
class PolicySerializer(serializers.ModelSerializer):

    # Read-only nested department
    department_detail = DepartmentSerializer(source="department", read_only=True)

    # Write-only FK field (IMPORTANT)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = Policy
        fields = [
            "id",
            "title",
            "appraisal_date",

            "department_id",      # ← write-only
            "department_detail",  # ← read-only nested

            "description",
            "file",
            "created_at",
        ]
        read_only_fields = ("id", "created_at", "department_detail")
