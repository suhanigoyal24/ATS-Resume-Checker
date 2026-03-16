
                                                                                AI-Based Resume Shortlisting and Job Matching System

Project Overview

The AI-Based Resume Shortlisting and Job Matching System is a web-based application designed to automate the process of evaluating resumes against job descriptions.
Recruiters often receive hundreds of resumes for a single job posting. Manually reviewing these resumes is time-consuming and can lead to inconsistent evaluations. 
This system uses Natural Language Processing (NLP) techniques to analyze resumes, compare them with job descriptions, and generate a ranking score to assist 
recruiters in identifying the most suitable candidates.The system improves recruitment efficiency by automatically parsing resumes, identifying relevant skills, and 
calculating a compatibility score between the resume and the job description.

---

Objectives

* Automate the resume screening process
* Reduce manual effort in candidate shortlisting
* Improve accuracy in matching job requirements with candidate skills
* Provide recruiters with ranked candidate results

---

Key Features

1.Resume Parser
The system extracts text data from resumes uploaded in PDF format.

2.Job Description Matching
The uploaded resume is compared with a provided job description.

3.ATS Score Generation
A compatibility score is generated using text similarity techniques.

4.Candidate Ranking
Resumes are ranked based on their similarity score with the job description.

5.Recruiter Dashboard
Recruiters can view results showing:
* ATS score
* matched skills
* missing skills

---

Technologies Used

Frontend
* HTML
* CSS
* Bootstrap
* JavaScript

Backend
* Python
* Django

Libraries
* spaCy for Natural Language Processing
* scikit-learn for similarity calculations
* PyPDF2 for extracting text from PDF resumes

---

System Architecture

User Uploads Resume
↓
Text Extraction from Resume
↓
Text Preprocessing (cleaning and normalization)
↓
Feature Extraction using TF-IDF
↓
Cosine Similarity Calculation
↓
ATS Score Generation
↓
Resume Ranking and Result Display

---

Algorithm Used

1.Resume Parsing
The system extracts textual data from PDF resumes using the PyPDF2 library.

2.Text Preprocessing
Both resume text and job descriptions are cleaned by:
* converting to lowercase
* removing punctuation
* removing stopwords

3.Feature Extraction
The cleaned text is converted into numerical vectors using the TF-IDF technique.

4.Similarity Calculation
Cosine similarity is calculated between the resume vector and the job description vector.
ATS Score Formula:
ATS Score = Cosine Similarity × 100
This score represents how closely the resume matches the job description.

---

Project Workflow

1. Recruiter enters job description
2. Candidate uploads resume
3. System extracts resume content
4. NLP processes the text
5. Similarity score is calculated
6. Candidates are ranked based on match score
7. Recruiter views shortlisted candidates

---

## Project Structure


resume-shortlisting-system
│
├── README.md
├── requirements.txt
├── manage.py
│
├── resume_matcher
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── analyzer
│   ├── views.py
│   ├── models.py
│   ├── ats_score.py
│   ├── resume_parser.py
│   └── urls.py
│
├── templates
│   ├── index.html
│   ├── upload.html
│   └── results.html
│
├── static
│   ├── css
│   │   └── style.css
│   └── js
│
└── media
    └── resumes


---

Installation Guide

1.Clone the repository
git clone https://github.com/yourusername/resume-shortlisting-system.git

2.Navigate to the project folder
cd resume-shortlisting-system

3.Create virtual environment
python -m venv venv

4.Activate virtual environment

Windows
venv\Scripts\activate

Mac/Linux
source venv/bin/activate

---

Install dependencies
pip install -r requirements.txt


Run the server
python manage.py runserver

Open browser and go to:
http://127.0.0.1:8000/

---

Example Output

Job Description: Python Backend Developer

Candidate Resume Score: **82%**

Matched Skills:

* Python
* Django
* REST API

Missing Skills:

* Docker
* Kubernetes

The system ranks candidates based on their scores to help recruiters shortlist the best applicants.

---

Future Enhancements

* Support for DOCX resumes
* Advanced skill extraction
* Multiple resume ranking
* Machine learning based candidate classification
* Recruiter analytics dashboard

---


Author
Suhani Goyal
Shreya Sharma
Bachelor of Computer Applications (BCA)
