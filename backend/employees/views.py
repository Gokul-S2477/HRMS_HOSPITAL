from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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
    permission_classes = [IsAuthenticated]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend
    ]

    search_fields = [
        "emp_code", "first_name", "middle_name", "last_name",
        "email", "phone", "alternate_phone"
    ]

    ordering_fields = ["joining_date", "first_name", "last_name"]
    filterset_fields = ["department", "designation", "employment_type", "is_active"]

    def get_queryset(self):
        qs = self.queryset

        dept = self.request.query_params.get("department")
        desig = self.request.query_params.get("designation")
        active = self.request.query_params.get("active")
        emp_type = self.request.query_params.get("employment_type")

        if dept:
            qs = qs.filter(department_id=dept)

        if desig:
            qs = qs.filter(designation_id=desig)

        if active in ["true", "1"]:
            qs = qs.filter(is_active=True)
        elif active in ["false", "0"]:
            qs = qs.filter(is_active=False)

        if emp_type:
            qs = qs.filter(employment_type=emp_type)

        return qs

    # ===== Birthday in next 7 days =====
    @action(detail=False, methods=["get"])
    def birthdays(self, request):
        today = date.today()
        end = today + timedelta(days=7)

        qs = Employee.objects.exclude(date_of_birth__isnull=True)
        result = []

        for emp in qs:
            try:
                dob_this_year = emp.date_of_birth.replace(year=today.year)
            except ValueError:
                # Handles Feb 29 on non-leap years
                dob_this_year = emp.date_of_birth.replace(year=today.year, day=28)

            if today <= dob_this_year <= end:
                result.append(emp)

        return Response(EmployeeSerializer(result, many=True).data)

    # ===== Birthday this month =====
    @action(detail=False, methods=["get"])
    def upcoming_birthdays(self, request):
        today = date.today()
        qs = Employee.objects.filter(date_of_birth__month=today.month)
        return Response(EmployeeSerializer(qs, many=True).data)

    # ===== New hires in last 30 days =====
    @action(detail=False, methods=["get"])
    def new_hires(self, request):
        cutoff = timezone.now().date() - timedelta(days=30)
        qs = Employee.objects.filter(joining_date__gte=cutoff)
        return Response(EmployeeSerializer(qs, many=True).data)

    # ===== Employee counts =====
    @action(detail=False, methods=["get"])
    def count(self, request):
        return Response({
            "total": Employee.objects.count(),
            "active": Employee.objects.filter(is_active=True).count(),
            "inactive": Employee.objects.filter(is_active=False).count(),
        })

    # ===== Department counts =====
    @action(detail=False, methods=["get"])
    def department_counts(self, request):
        data = {
            d.name: d.employees.count()
            for d in Department.objects.all()
        }
        return Response(data)


# =====================================================
#                DEPARTMENT VIEWSET
# =====================================================
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]


# =====================================================
#                DESIGNATION VIEWSET
# =====================================================
class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all().select_related("department")
    serializer_class = DesignationSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["department"]
    search_fields = ["title", "description"]


# =====================================================
#                POLICY VIEWSET
# =====================================================
class PolicyViewSet(viewsets.ModelViewSet):
    queryset = Policy.objects.all().select_related("department")
    serializer_class = PolicySerializer
    permission_classes = [IsAuthenticated]

    parser_classes = (MultiPartParser, FormParser)

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
        DjangoFilterBackend
    ]

    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "appraisal_date", "title"]
    filterset_fields = ["department"]

    def get_queryset(self):
        qs = self.queryset

        dept = self.request.query_params.get("department")
        frm = self.request.query_params.get("from")
        to = self.request.query_params.get("to")

        if dept and dept != "all":
            qs = qs.filter(department_id=dept)

        if frm and to:
            qs = qs.filter(created_at__date__range=[frm, to])

        return qs
