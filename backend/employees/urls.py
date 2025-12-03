# backend/employees/urls.py

from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet,
    DepartmentViewSet,
    DesignationViewSet,
    PolicyViewSet,
)

app_name = "employees"   # Prevents reverse-url conflicts

router = DefaultRouter()

# Employee CRUD
router.register(r'employees', EmployeeViewSet, basename='employees')

# Department CRUD
router.register(r'departments', DepartmentViewSet, basename='departments')

# Designation CRUD
router.register(r'designations', DesignationViewSet, basename='designations')

# Policy CRUD
router.register(r'policies', PolicyViewSet, basename='policies')

urlpatterns = router.urls
