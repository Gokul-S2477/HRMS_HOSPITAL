from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from employees.models import Employee
from attendance.models import Attendance
from payroll.models import Payroll


class DashboardView(APIView):
    def get(self, request):
        # 1️⃣ Total employees
        total_employees = Employee.objects.count()

        # 2️⃣ Attendance summary (today)
        today = date.today()
        present_today = Attendance.objects.filter(date=today, status='Present').count()
        absent_today = Attendance.objects.filter(date=today, status='Absent').count()

        # 3️⃣ Payroll summary (for current month)
        current_year = today.year
        current_month = today.month

        # Filter by 'paid_on' month and year (not the text field)
        payroll_records = Payroll.objects.filter(
            paid_on__year=current_year, 
            paid_on__month=current_month
        )

        total_payroll_this_month = payroll_records.count()
        total_salary_sum = sum(float(r.total_salary or 0) for r in payroll_records)

        # 4️⃣ Combine all data
        data = {
            "total_employees": total_employees,
            "present_today": present_today,
            "absent_today": absent_today,
            "total_payroll_records": total_payroll_this_month,
            "total_salary_sum": total_salary_sum,
        }

        return Response(data, status=status.HTTP_200_OK)
