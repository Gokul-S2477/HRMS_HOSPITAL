from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SalaryComponent, EmployeePayroll
from .serializers import SalaryComponentSerializer, EmployeePayrollSerializer


# 1️⃣ Salary Components API
class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer


# 2️⃣ Employee Payroll API
class EmployeePayrollViewSet(viewsets.ModelViewSet):
    queryset = EmployeePayroll.objects.all().order_by('-created_at')
    serializer_class = EmployeePayrollSerializer

    # Filter payroll by employee / month / year
    def get_queryset(self):
        queryset = EmployeePayroll.objects.all().order_by('-created_at')

        employee = self.request.query_params.get('employee')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if employee:
            queryset = queryset.filter(employee_id=employee)
        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)

        return queryset

    # Calculate payroll again (recalculate components)
    @action(detail=True, methods=['POST'])
    def recalculate(self, request, pk=None):
        payroll = self.get_object()

        # Recalculate earnings & deductions
        earnings = sum(c.amount for c in payroll.components.filter(component_type='earning'))
        deductions = sum(c.amount for c in payroll.components.filter(component_type='deduction'))

        gross = payroll.basic_salary + payroll.hra + earnings
        payroll.gross_salary = gross
        payroll.total_deductions = deductions
        payroll.net_salary = gross - deductions
        payroll.save()

        serializer = self.get_serializer(payroll)
        return Response(serializer.data)
