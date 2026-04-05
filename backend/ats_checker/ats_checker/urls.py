# ats_checker/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('analyzer.urls')),  # All API routes under /api/
    
    # REMOVE any route that points to a template view like:
    # path('', views.home, name='home'),  # ← DELETE THIS LINE
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)