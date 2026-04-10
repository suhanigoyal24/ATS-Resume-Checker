// src/types/index.ts
// Single, clean Candidate interface

export interface Candidate {
  id?: number;              // Optional: API may not always send id
  name: string;             // Required: candidate name
  score: number;            // Required: ATS match score (0-100)
  skills?: string[];        // Optional: array of matched skills
  resume_url?: string;      // Optional: link to resume file
  [key: string]: any;       // Allow extra fields from API response
}

export interface UploadResumeProps {
  onUpload: (candidate: Candidate) => void;
  onBatchComplete?: () => void;
}

export interface CandidateCardProps extends Candidate {}

export interface DashboardState {
  candidates: Candidate[];
  loading: boolean;
  search: string;
  minScore: number;
}


