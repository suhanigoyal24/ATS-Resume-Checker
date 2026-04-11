from django.urls import path
from .views import upload_resume, list_candidates  # Import BOTH functions

urlpatterns = [
    path('upload/', upload_resume, name='upload_resume'),           # POST /api/upload/
    path('candidates/', list_candidates, name='list_candidates'),   # GET /api/candidates/
]
