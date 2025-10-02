from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Frontend URLs
    path('', include('medical.urls')),
    path('reports/', include('reports.urls')),  # Frontend reports URLs
    path('users/', include('users.urls')),  # Frontend users URLs
    path('communication/', include('communication.urls')),  # Communication URLs
    
    # API URLs
    path('api/auth/', include('users.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/activities/', include('activities.urls')),
]

# Servir les fichiers média en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)