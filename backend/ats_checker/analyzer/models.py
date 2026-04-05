# analyzer/models.py
from django.db import models

class JobDescription(models.Model):
    title = models.CharField(max_length=255)
    requirements = models.TextField()
    extracted_skills = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Candidate(models.Model):
    name = models.CharField(max_length=100, blank=True, default="Anonymous")
    email = models.EmailField(blank=True)
    resume_file = models.FileField(upload_to='resumes/%Y/%m/%d/')
    extracted_text = models.TextField(blank=True)
    extracted_skills = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.created_at.strftime('%Y-%m-%d')}"

class MatchScore(models.Model):  # ← This was missing!
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='matches')
    job = models.ForeignKey(JobDescription, on_delete=models.CASCADE, null=True, blank=True)
    job_description_text = models.TextField(blank=True)  # Optional: store raw JD if no JobDescription object
    score = models.FloatField()  # 0.0 to 1.0
    semantic_similarity = models.FloatField(default=0.0)
    skill_match_score = models.FloatField(default=0.0)
    experience_score = models.FloatField(default=0.0)
    education_score = models.FloatField(default=0.0)
    matched_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-score', '-created_at']
    
    def __str__(self):
        return f"{self.candidate.name} → {self.score*100:.1f}%"