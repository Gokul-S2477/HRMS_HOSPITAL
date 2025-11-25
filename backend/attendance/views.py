from rest_framework import viewsets
from .models import Attendance
from .serializers import AttendanceSerializer
from users.permissions import IsAdminOrHR, IsEmployee


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by('-date')
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'DELETE']:
            return [IsAdminOrHR()]
        return [IsAdminOrHR() or IsEmployee()]
