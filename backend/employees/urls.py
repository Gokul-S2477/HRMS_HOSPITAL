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
router.register(r'employees', EmployeeViewSet, basename='employee')

# Departments
router.register(r'departments', DepartmentViewSet, basename='department')

# Designations
router.register(r'designations', DesignationViewSet, basename='designation')

# Policies
router.register(r'policies', PolicyViewSet, basename='policy')

urlpatterns = router.urls
