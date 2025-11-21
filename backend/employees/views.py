# backend/employees/views.py
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import date, timedelta

from .models import Employee, Department, Designation
from .serializers import EmployeeSerializer, DepartmentSerializer, DesignationSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().select_related("department", "designation", "reporting_to")
    serializer_class = EmployeeSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'emp_code', 'first_name', 'middle_name', 'last_name',
        'email', 'phone', 'alternate_phone'
    ]
    ordering_fields = ['joining_date', 'first_name', 'last_name']

    # ================================
    #  CUSTOM FILTERS
    # ================================
    def get_queryset(self):
        qs = Employee.objects.all().select_related("department", "designation")

        department = self.request.query_params.get("department")
        designation = self.request.query_params.get("designation")
        active = self.request.query_params.get("active")
        employment_type = self.request.query_params.get("employment_type")

        if department:
            qs = qs.filter(department_id=department)
        if designation:
            qs = qs.filter(designation_id=designation)
        if active in ["true", "1"]:
            qs = qs.filter(is_active=True)
        if active in ["false", "0"]:
            qs = qs.filter(is_active=False)
        if employment_type:
            qs = qs.filter(employment_type=employment_type)

        return qs

    # ================================
    #  CUSTOM ACTIONS
    # ================================
    @action(detail=False, methods=['get'])
    def birthdays(self, request):
        """Employees whose birthdays fall in the next 7 days."""
        today = date.today()
        end = today + timedelta(days=7)

        results = []
        for emp in Employee.objects.exclude(date_of_birth__isnull=True):
            dob_this_year = emp.date_of_birth.replace(year=today.year)

            if today <= dob_this_year <= end:
                results.append(emp)

        serializer = EmployeeSerializer(results, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def upcoming_birthdays(self, request):
        """Birthdays in the current month."""
        today = date.today()
        qs = Employee.objects.filter(date_of_birth__month=today.month)

        serializer = EmployeeSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_hires(self, request):
        """Employees hired in the last 30 days."""
        cutoff = timezone.now().date() - timedelta(days=30)
        qs = Employee.objects.filter(joining_date__gte=cutoff)

        serializer = EmployeeSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def count(self, request):
        """Returns total employees, active employees, inactive employees."""
        total = Employee.objects.count()
        active = Employee.objects.filter(is_active=True).count()
        inactive = Employee.objects.filter(is_active=False).count()

        return Response({
            "total": total,
            "active": active,
            "inactive": inactive
        })

    @action(detail=False, methods=['get'])
    def department_counts(self, request):
        """Returns employee count grouped by department."""
        data = {}
        for dept in Department.objects.all():
            data[dept.name] = dept.employees.count()

        return Response(data)


# ================================
#   PUBLIC ENDPOINTS FOR REACT
# ================================
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]   # Allow POST, DELETE without auth


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [AllowAny]   # Allow POST, DELETE without auth
