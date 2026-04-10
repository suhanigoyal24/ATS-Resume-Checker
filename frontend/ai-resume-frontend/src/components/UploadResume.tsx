// src/components/UploadResume.tsx
import { useState } from "react";
import type { Candidate } from "../types";

interface UploadResumeProps {
  onUpload?: (candidate: Candidate) => void;
  onBatchComplete?: () => void;
}

export default function UploadResume({ onUpload, onBatchComplete }: UploadResumeProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Candidate[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setFiles(prev => [...prev, ...selected]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBatchUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one resume file");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please provide a job description for accurate matching");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length });

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("job_description", jobDescription);
        formData.append("batch_id", `batch_${Date.now()}`);

        const res = await fetch("http://127.0.0.1:8000/api/upload/", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(`Failed to process ${file.name}: ${errData.detail || res.status}`);
        }

        // CORRECT: variable name + type annotation
        const data: Record<string, any> = await res.json();
        
        // Extract keywords from any possible backend field name
        const keywordFields = ['matched_keywords', 'keywords', 'skills', 'matched_skills', 'extracted_keywords'];
        let keywords: string[] = [];
        for (const field of keywordFields) {
          if (Array.isArray(data[field])) {
            keywords = data[field].map((k: unknown) => String(k));
            break;
          }
        }

        // ✅ CORRECT: Build candidate WITHOUT index signature in object literal
        const candidate: Candidate = {
          id: data.id,
          name: data.name || file.name.replace(/\.[^/.]+$/, ""),
          score: typeof data.score === 'number' ? data.score : 0,
          skills: keywords,
          resume_url: data.resume_url,
          ...(keywords.length > 0 && { matched_keywords: keywords }),
          // Spread extra fields from backend (Candidate interface allows this via [key: string]: any)
          ...Object.fromEntries(
            Object.entries(data).filter(([key]) => 
              !['id', 'name', 'score', 'skills', 'resume_url', 'matched_keywords', 'batch_id'].includes(key)
            )
          ),
        };

        if (onUpload) {
          onUpload(candidate);
        }
        setResults(prev => [...prev, candidate]);
      }

      if (onBatchComplete) {
        onBatchComplete();
      }

    } catch (err) {
      console.error("❌ Batch upload failed:", err);
      setError(err instanceof Error ? err.message : "Batch processing failed");
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Batch Resume Screening</h2>
      
      {/* Job Description - Persistent Input */}
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <label className="block text-sm font-medium text-indigo-900 mb-2">
          🎯 Job Description (Applied to All Resumes)
        </label>
        <textarea
          placeholder="Paste the full job description here. This will be used to score all uploaded resumes..."
          value={jobDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
          className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-800 min-h-[120px] bg-white"
          disabled={loading}
        />
        <p className="text-xs text-indigo-600 mt-1">
          💡 Tip: Include required skills, experience level, and key responsibilities for best matching
        </p>
      </div>

      {/* File Upload Area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📁 Select Resumes ({files.length} selected)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition cursor-pointer bg-gray-50">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
            disabled={loading}
          />
          <label 
            htmlFor="resume-upload" 
            className="cursor-pointer flex flex-col items-center"
          >
            <span className="text-4xl mb-2">📄</span>
            <span className="text-indigo-600 font-medium">Click to select files</span>
            <span className="text-xs text-gray-500 mt-1">Supports PDF, DOC, DOCX • Up to 20 files</span>
          </label>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
              >
                <span className="truncate flex-1 text-gray-700">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 ml-2 text-xs font-medium"
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Progress Bar - Shows During Batch Processing */}
      {loading && progress.total > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Processing resumes... ({progress.current}/{progress.total})
            </span>
            <span className="text-xs text-blue-600">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-blue-700 mt-2">
            ✨ AI is parsing resumes, extracting skills, and calculating ATS match scores...
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleBatchUpload}
        disabled={loading || files.length === 0 || !jobDescription.trim()}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 
          text-white font-semibold py-3 px-6 rounded-lg
          hover:from-indigo-700 hover:to-purple-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            <span>Processing {progress.current}/{progress.total}...</span>
          </>
        ) : (
          <span>🚀 Analyze {files.length} Resume{files.length > 1 ? 's' : ''}</span>
        )}
      </button>

      {/* Batch Results Summary */}
      {results.length > 0 && !loading && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">✅</span>
            <h3 className="font-bold text-green-800">
              Batch Complete! {results.length} resume{results.length > 1 ? 's' : ''} processed
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase">Avg Score</p>
              <p className="text-xl font-bold text-indigo-600">
                {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Top Match</p>
              <p className="font-semibold text-gray-800 truncate">
                {results.reduce((top, r) => r.score > top.score ? r : top, results[0]).name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Qualified</p>
              <p className="font-semibold text-green-600">
                {results.filter(r => r.score >= 75).length}/{results.length}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-3">
            👉 Results have been added to your dashboard. Use the filters above to sort and analyze.
          </p>
        </div>
      )}
    </div>
  );
}