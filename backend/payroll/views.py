from rest_framework import viewsets
from .models import Payroll
from .serializers import PayrollSerializer
from users.permissions import IsAdminOrHR, IsEmployee


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all().order_by('-created_at')
    serializer_class = PayrollSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'DELETE']:
            return [IsAdminOrHR()]
        return [IsAdminOrHR() or IsEmployee()]
