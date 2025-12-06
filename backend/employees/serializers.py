from rest_framework import serializers
from .models import Employee, Department, Designation, Policy


# ==============================================================
#                     DEPARTMENT SERIALIZER
# ==============================================================
class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ("id", "name", "description", "employee_count")

    def get_employee_count(self, obj):
        return obj.employees.count()


# ==============================================================
#                     DESIGNATION SERIALIZER
# ==============================================================
class DesignationSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source="department", read_only=True)

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
            "department_id",
            "department_detail",
        )
        read_only_fields = ("department_detail",)


# ==============================================================
#                  EMPLOYEE SERIALIZER (FINAL)
# ==============================================================
class EmployeeSerializer(serializers.ModelSerializer):

    # Read nested objects
    department = DepartmentSerializer(read_only=True)
    designation = DesignationSerializer(read_only=True)

    # Reporting to detail
    reporting_to_detail = serializers.SerializerMethodField(read_only=True)

    # Write-only foreign keys
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

    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Employee
        fields = [

            # -----------------------------------
            # BASIC INFORMATION
            # -----------------------------------
            "id",
            "emp_code",
            "first_name",
            "middle_name",
            "last_name",
            "gender",
            "date_of_birth",

            # PERSONAL DETAILS
            "father_name",
            "mother_name",
            "spouse_name",
            "religion",
            "nationality",

            # -----------------------------------
            # CONTACT INFORMATION
            # -----------------------------------
            "email",
            "phone",
            "alternate_phone",
            "address",

            # EMERGENCY INFO
            "emergency_contact_name",
            "emergency_contact_number",

            # -----------------------------------
            # DOCUMENTS
            # -----------------------------------
            "aadhar_number",
            "pan_number",
            "passport_number",
            "driving_license_number",

            # -----------------------------------
            # JOB INFO
            # -----------------------------------
            "role",
            "department",
            "department_id",
            "designation",
            "designation_id",
            "joining_date",
            "employment_type",
            "reporting_to",
            "reporting_to_detail",

            # -----------------------------------
            # HR EXTRA
            # -----------------------------------
            "national_id",
            "blood_group",
            "marital_status",
            "work_shift",
            "work_location",

            # PREVIOUS EXPERIENCE
            "previous_company",
            "previous_experience_years",
            "previous_salary",
            "highest_qualification",

            # HR TIMELINE INFO
            "probation_period",
            "confirmation_date",
            "notice_period",

            "resignation_date",
            "resignation_reason",

            # -----------------------------------
            # BANK DETAILS
            # -----------------------------------
            "bank_name",
            "bank_account_number",
            "bank_ifsc",
            "bank_branch",

            # -----------------------------------
            # PHOTO AND PAYROLL
            # -----------------------------------
            "photo",
            "salary",

            # -----------------------------------
            # STATUS
            # -----------------------------------
            "is_active",

            # -----------------------------------
            # AUDIT FIELDS
            # -----------------------------------
            "created_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_at",
            "updated_at",
            "reporting_to_detail",
        ]

    # -----------------------------------------------------------
    # Reporting To detail structure
    # -----------------------------------------------------------
    def get_reporting_to_detail(self, obj):
        if obj.reporting_to:
            return {
                "id": obj.reporting_to.id,
                "name": f"{obj.reporting_to.first_name} {obj.reporting_to.last_name or ''}".strip()
            }
        return None


# ==============================================================
#                     POLICY SERIALIZER
# ==============================================================
class PolicySerializer(serializers.ModelSerializer):

    department_detail = DepartmentSerializer(source="department", read_only=True)

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
            "department_id",
            "department_detail",
            "description",
            "file",
            "created_at",
        ]

        read_only_fields = ("id", "created_at", "department_detail")
