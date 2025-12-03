from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class IsHR(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='HR').exists()


class CanViewTicket(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        if obj.raised_by == request.user:
            return True
        
        if obj.assigned_to == request.user:
            return True

        # HR can see Recruitment category
        if request.user.groups.filter(name='HR').exists() and obj.category.key == 'RECRUIT':
            return True
        
        return False


class CanTransitionTicket(BasePermission):
    """
    Permission for stage changes: only Admin, HR, 
    or the user assigned to the ticket can move it forward.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        if obj.assigned_to == request.user:
            return True
        
        if request.user.groups.filter(name='HR').exists():
            return True

        return False
