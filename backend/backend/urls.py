# backend/backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # AUTH
    path('api/auth/', include('users.auth_urls')),

    # USERS
    path('api/users/', include('users.urls')),

    # EMPLOYEES + DEPARTMENTS + DESIGNATIONS + POLICIES  (IMPORTANT)
    path('api/', include('employees.urls')),

    # ATTENDANCE
    path('api/attendance/', include('attendance.urls')),

    # PAYROLL
    path('api/payroll/', include('payroll.urls')),

    # DASHBOARD
    path('api/dashboard/', include('dashboard.urls')),

    path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
