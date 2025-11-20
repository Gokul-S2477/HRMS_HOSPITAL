# backend/employees/urls.py
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, DepartmentViewSet, DesignationViewSet

router = DefaultRouter()

# Main Employee CRUD
router.register(r'employees', EmployeeViewSet, basename='employee')

# Department CRUD
router.register(r'departments', DepartmentViewSet, basename='department')

# Designation CRUD
router.register(r'designations', DesignationViewSet, basename='designation')

urlpatterns = router.urls
