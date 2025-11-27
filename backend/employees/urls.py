# backend/employees/urls.py

from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet,
    DepartmentViewSet,
    DesignationViewSet,
    PolicyViewSet,
)

router = DefaultRouter()

# Employee CRUD
router.register(r'employees', EmployeeViewSet, basename='employees')

# Departments CRUD
router.register(r'departments', DepartmentViewSet, basename='departments')

# Designations CRUD
router.register(r'designations', DesignationViewSet, basename='designations')

# Policies CRUD
router.register(r'policies', PolicyViewSet, basename='policies')

urlpatterns = router.urls
