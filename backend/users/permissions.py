from rest_framework import permissions

class IsAdminOrHR(permissions.BasePermission):
    """Allow full access to Admin and HR."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.role == 'Admin' or request.user.role == 'HR')
        )

class IsEmployee(permissions.BasePermission):
    """Allow access only to logged-in Employees."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Employee'
