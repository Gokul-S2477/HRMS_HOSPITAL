from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import SalaryComponent, EmployeePayroll
from .serializers import (
    SalaryComponentSerializer,
    EmployeePayrollSerializer
)


class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.all().order_by('name')
    serializer_class = SalaryComponentSerializer
    permission_classes = [IsAuthenticated]


class EmployeePayrollViewSet(viewsets.ModelViewSet):
    queryset = EmployeePayroll.objects.all().order_by('-created_at')
    serializer_class = EmployeePayrollSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        emp = self.request.query_params.get('employee')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if emp:
            qs = qs.filter(employee_id=emp)
        if month:
            qs = qs.filter(month=month)
        if year:
            qs = qs.filter(year=year)

        return qs

    def perform_create(self, serializer):
        payroll = serializer.save()
        payroll.calculate()
        payroll.save()

    def perform_update(self, serializer):
        payroll = serializer.save()
        payroll.calculate()
        payroll.save()

    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        payroll = self.get_object()
        payroll.calculate()
        payroll.save()
        serializer = self.get_serializer(payroll)
        return Response(serializer.data)
