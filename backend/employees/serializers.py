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
            "department_id",        # write-only FK
            "department_detail",    # read-only nested
        )
        read_only_fields = ("department_detail",)


# ==============================================================
#                     EMPLOYEE SERIALIZER
# ==============================================================
class EmployeeSerializer(serializers.ModelSerializer):

    # READ nested objects
    department = DepartmentSerializer(read_only=True)
    designation = DesignationSerializer(read_only=True)

    # READ reporting_to employee details
    reporting_to_detail = serializers.SerializerMethodField(read_only=True)

    # WRITE-ONLY FKs
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

    # SAFE PHOTO UPLOAD HANDLING
    photo = serializers.ImageField(required=False, allow_null=True)

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
            "reporting_to_detail",

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
        read_only_fields = ("created_at", "updated_at", "reporting_to_detail")

    # =======================================================
    # Get reporting_to employee info (name + id)
    # =======================================================
    def get_reporting_to_detail(self, obj):
        if obj.reporting_to:
            return {
                "id": obj.reporting_to.id,
                "name": f"{obj.reporting_to.first_name} {obj.reporting_to.last_name or ''}"
            }
        return None


# ==============================================================
#                     POLICY SERIALIZER
# ==============================================================
class PolicySerializer(serializers.ModelSerializer):

    # Read-only nested department
    department_detail = DepartmentSerializer(source="department", read_only=True)

    # Write-only FK
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

            "department_id",       # write-only
            "department_detail",   # read-only nested

            "description",
            "file",
            "created_at",
        ]
        read_only_fields = ("id", "created_at", "department_detail")
