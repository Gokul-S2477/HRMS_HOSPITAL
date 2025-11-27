from rest_framework.routers import DefaultRouter
from .views import SalaryComponentViewSet, EmployeePayrollViewSet

router = DefaultRouter()
router.register(r'salary-components', SalaryComponentViewSet, basename='salary-components')
router.register(r'payroll', EmployeePayrollViewSet, basename='payroll')

urlpatterns = router.urls
