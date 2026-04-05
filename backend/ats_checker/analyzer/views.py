# analyzer/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.conf import settings
import os, mimetypes
from .models import Candidate, JobDescription, MatchScore
from .utils import extract_text_from_file, extract_skills, calculate_weighted_score, nlp

@api_view(['POST'])
@permission_classes([AllowAny])  # Restrict in production!
def upload_resume(request):
    if request.method != 'POST':
        return Response({"error": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    resume = request.FILES.get('resume')
    job_description_text = request.data.get('job_description')  # Raw text or job_id
    
    if not resume or not job_description_text:
        return Response({"error": "Missing resume or job description"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file type
    file_ext = os.path.splitext(resume.name)[1].lower()
    if file_ext not in ['.pdf', '.docx', '.doc']:
        return Response({"error": "Unsupported file type"}, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
    
    # Save file temporarily
    file_path = default_storage.save(f"resumes/{resume.name}", resume)
    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
    
    try:
        # Extract & process
        resume_text = extract_text_from_file(full_path, file_ext[1:])
        if not resume_text.strip():
            return Response({"error": "Could not extract text from resume"}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        # Extract skills
        resume_skills = extract_skills(resume_text)
        job_skills = extract_skills(job_description_text)
        
        # Parse with spaCy for experience/education heuristics
        resume_doc = nlp(resume_text)
        job_doc = nlp(job_description_text)
        
        # Calculate score
        result = calculate_weighted_score(
            resume_text, job_description_text,
            resume_skills, job_skills,
            resume_doc, job_doc
        )
        
        # Save to DB (optional but recommended)
        candidate = Candidate.objects.create(
            name=request.data.get('name', 'Anonymous'),
            resume_file=file_path,
            extracted_text=resume_text[:5000],  # Truncate for storage
            extracted_skills=resume_skills
        )
        MatchScore.objects.create(
            candidate=candidate,
            # If using JobDescription model: job=job_obj,
            score=result['score']/100,
            missing_skills=result['missing_skills']
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"[CRITICAL ERROR] {str(e)}")
        return Response({"error": "Processing failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        # Cleanup temp file
        if os.path.exists(full_path):
            os.remove(full_path)