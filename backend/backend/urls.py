# backend/backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication
    path('api/', include('users.auth_urls')),

    # App APIs
    path('api/', include('users.urls')),
    path('api/', include('employees.urls')),   # Employees + Departments + Designations + Policies
    path('api/', include('attendance.urls')),
    path('api/', include('payroll.urls')),
    path('api/', include('dashboard.urls')),




    # DRF login (helps with form-data / file uploads)
    path('api-auth/', include('rest_framework.urls')),
]

# Media file support for file uploads (policy file, employee photo)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
