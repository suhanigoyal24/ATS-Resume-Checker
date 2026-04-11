// src/components/UploadResume.tsx
import { useState } from "react";
import type { Candidate } from "../types";
import MatchReport from "./MatchReport";

interface UploadResumeProps {
  onUpload?: (candidate: Candidate) => void;
  onBatchComplete?: () => void;
}

export default function UploadResume({ onUpload, onBatchComplete }: UploadResumeProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [processingStep, setProcessingStep] = useState<string>("");
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
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
    setProgress({ current: 0, total: files.length, percent: 0 });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        setProgress(prev => ({ ...prev, current: i + 1, total: files.length }));

        // 🔹 STEP-BY-STEP PROCESSING FEEDBACK
        setProcessingStep("📄 Reading resume file...");
        await new Promise(resolve => setTimeout(resolve, 300)); // UX: show step transition

        setProcessingStep("🔍 Extracting text & skills...");
        await new Promise(resolve => setTimeout(resolve, 400));

        setProcessingStep("🧠 Analyzing against job description...");
        await new Promise(resolve => setTimeout(resolve, 500));

        setProcessingStep("📊 Calculating ATS match score...");
        await new Promise(resolve => setTimeout(resolve, 300));

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

        setProcessingStep("✅ Processing complete!");
        await new Promise(resolve => setTimeout(resolve, 200));

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

        // Build candidate object
        const candidate: Candidate = {
          id: data.id,
          name: data.name || file.name.replace(/\.[^/.]+$/, ""),
          score: typeof data.score === 'number' ? data.score : 0,
          skills: keywords,
          resume_url: data.resume_url,
          ...(keywords.length > 0 && { matched_keywords: keywords }),
          ...Object.fromEntries(
            Object.entries(data).filter(([key]) => 
              !['id', 'name', 'score', 'skills', 'resume_url', 'matched_keywords', 'batch_id'].includes(key)
            )
          ),
        };

        // Update progress percentage
        setProgress(prev => ({ 
          ...prev, 
          percent: Math.round(((i + 1) / files.length) * 100) 
        }));

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
      setCurrentFile("");
      setProcessingStep("");
      setProgress({ current: 0, total: 0, percent: 0 });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6 max-w-3xl mx-auto relative">
      
      {/* 🔹 FULL-SCREEN LOADING OVERLAY (Prominent & Clear) */}
      {loading && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 rounded-xl border-2 border-indigo-200">
          {/* Animated Spinner */}
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
          </div>
          
          {/* Clear Status Messages */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
            Processing Your Resume{files.length > 1 ? 's' : ''}...
          </h3>
          
          {currentFile && (
            <p className="text-sm text-gray-600 mb-1 text-center max-w-xs truncate">
              📁 {currentFile}
            </p>
          )}
          
          {processingStep && (
            <p className="text-indigo-600 font-medium mb-4 text-center animate-pulse">
              {processingStep}
            </p>
          )}
          
          {/* Progress Bar with Percentage */}
          {progress.total > 0 && (
            <div className="w-full max-w-md mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Resume {progress.current} of {progress.total}</span>
                <span className="font-semibold text-indigo-600">{progress.percent}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Helpful Tips While Waiting */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 max-w-sm text-center">
            <p className="text-xs text-indigo-700">
              💡 <span className="font-medium">Tip:</span> Processing time depends on resume length. 
              Most resumes take 5-15 seconds.
            </p>
          </div>
          
          {/* Cancel Button (Optional) */}
          {/* <button 
            onClick={() => setLoading(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel processing
          </button> */}
        </div>
      )}

      {/* Main Content (Blurred When Loading) */}
      <div className={loading ? "opacity-30 pointer-events-none transition-opacity" : ""}>
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
              <span>Processing...</span>
            </>
          ) : (
            <span>🚀 Analyze {files.length} Resume{files.length > 1 ? 's' : ''}</span>
          )}
        </button>

        {/* Batch Results Summary */}
        {results.length > 0 && !loading && (
          <div className="mt-6 space-y-4">
            {/* Summary Stats */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
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
                  <p className="text-xs text-gray-500 uppercase">Qualified (75%+)</p>
                  <p className="font-semibold text-green-600">
                    {results.filter(r => r.score >= 75).length}/{results.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Match Reports */}
            <div className="space-y-4">
              {results.slice(0, 3).map((result, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{result.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      result.score >= 80 ? 'bg-green-100 text-green-700' :
                      result.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {result.score}%
                    </span>
                  </div>
                  
                  {result.match_report ? (
                    <MatchReport report={result.match_report} score={result.score} />
                  ) : (
                    <div className="text-sm text-gray-500">
                      <p>✅ Matched: {(result.matched_keywords || []).length} keywords</p>
                      {result.skills && result.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.skills.slice(0, 5).map((skill, i) => (
                            <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {results.length > 3 && (
                <p className="text-center text-sm text-gray-500">
                  + {results.length - 3} more results added to your dashboard
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 text-center pt-2">
              👉 All results added to dashboard. Use filters to sort & analyze.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}