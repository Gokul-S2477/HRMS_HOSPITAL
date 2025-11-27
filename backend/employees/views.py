from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from datetime import date, timedelta
from django_filters.rest_framework import DjangoFilterBackend

from .models import Employee, Department, Designation, Policy
from .serializers import (
    EmployeeSerializer,
    DepartmentSerializer,
    DesignationSerializer,
    PolicySerializer,
)


# =====================================================
#                EMPLOYEE VIEWSET
# =====================================================
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().select_related(
        "department", "designation", "reporting_to"
    )
    serializer_class = EmployeeSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "emp_code", "first_name", "middle_name", "last_name",
        "email", "phone", "alternate_phone"
    ]
    ordering_fields = ["joining_date", "first_name", "last_name"]

    def get_queryset(self):
        qs = Employee.objects.all().select_related("department", "designation")

        dept = self.request.query_params.get("department")
        desig = self.request.query_params.get("designation")    # FIXED
        active = self.request.query_params.get("active")
        emp_type = self.request.query_params.get("employment_type")

        if dept:
            qs = qs.filter(department_id=dept)

        if desig:
            qs = qs.filter(designation_id=desig)

        if active in ["true", "1"]:
            qs = qs.filter(is_active=True)

        if active in ["false", "0"]:
            qs = qs.filter(is_active=False)

        if emp_type:
            qs = qs.filter(employment_type=emp_type)

        return qs

    # ---- Birthdays next 7 days ----
    @action(detail=False, methods=["get"])
    def birthdays(self, request):
        today = date.today()
        end = today + timedelta(days=7)
        results = []

        for emp in Employee.objects.exclude(date_of_birth__isnull=True):
            dob = emp.date_of_birth.replace(year=today.year)
            if today <= dob <= end:
                results.append(emp)

        return Response(EmployeeSerializer(results, many=True).data)

    # ---- Monthly birthdays ----
    @action(detail=False, methods=["get"])
    def upcoming_birthdays(self, request):
        today = date.today()
        qs = Employee.objects.filter(date_of_birth__month=today.month)
        return Response(EmployeeSerializer(qs, many=True).data)

    # ---- New hires ----
    @action(detail=False, methods=["get"])
    def new_hires(self, request):
        cutoff = timezone.now().date() - timedelta(days=30)
        qs = Employee.objects.filter(joining_date__gte=cutoff)
        return Response(EmployeeSerializer(qs, many=True).data)

    # ---- Employee count ----
    @action(detail=False, methods=["get"])
    def count(self, request):
        return Response({
            "total": Employee.objects.count(),
            "active": Employee.objects.filter(is_active=True).count(),
            "inactive": Employee.objects.filter(is_active=False).count(),
        })

    # ---- Department employee count ----
    @action(detail=False, methods=["get"])
    def department_counts(self, request):
        data = {str(d.id): d.employees.count() for d in Department.objects.all()}
        return Response(data)


# =====================================================
#               DEPARTMENT VIEWSET
# =====================================================
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]     # Allows React to get list


# =====================================================
#               DESIGNATION VIEWSET
# =====================================================
class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [AllowAny]


# =====================================================
#               POLICY VIEWSET
# =====================================================
class PolicyViewSet(viewsets.ModelViewSet):
    queryset = Policy.objects.all().select_related("department")
    serializer_class = PolicySerializer

    parser_classes = (MultiPartParser, FormParser)

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend
    ]

    # Search by title + description
    search_fields = ["title", "description"]

    # Sorting fields
    ordering_fields = ["created_at", "appraisal_date", "title"]

    # Department filtering
    filterset_fields = ["department"]

    def get_queryset(self):
        qs = Policy.objects.all().select_related("department")

        dept = self.request.query_params.get("department")
        frm = self.request.query_params.get("from")
        to = self.request.query_params.get("to")

        # Filter by department
        if dept and dept != "all":
            try:
                qs = qs.filter(department_id=int(dept))
            except ValueError:
                pass

        # Filter by created_at date range
        if frm and to:
            qs = qs.filter(created_at__date__range=[frm, to])

        return qs

    # File upload supported
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
