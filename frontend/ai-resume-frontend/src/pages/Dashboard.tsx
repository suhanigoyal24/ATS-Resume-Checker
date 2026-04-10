// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import UploadResume from "../components/UploadResume";
import ChatBot from "../components/ChatBot";
import CandidateCard from "../components/CandidateCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Candidate } from "../types";

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch candidates from Django API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setError(null);
        const response = await fetch("http://127.0.0.1:8000/api/candidates/");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: Candidate[] = await response.json();
        console.log("📥 Fetched candidates:", data);
        setCandidates(data);
      } catch (err) {
        console.error("❌ Error fetching candidates:", err);
        setError("Failed to load candidates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Upload handler - adds new candidate to the list
  const handleUpload = (newCandidate: Candidate) => {
    setCandidates((prev) => [...prev, newCandidate]);
  };

  // Filter + ranking logic
  const filteredCandidates = candidates
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const meetsScore = c.score >= minScore;
      return matchesSearch && meetsScore;
    })
    .sort((a, b) => b.score - a.score);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-red-700 underline text-sm hover:text-red-900"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            🚀 AI Resume Screening System
          </h1>
          <p className="text-gray-500 mt-2">
            Upload resumes, get instant ATS scores, and find your top candidates
          </p>
        </header>

        {/* Upload Component */}
        <UploadResume onUpload={handleUpload} />

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mt-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            aria-label="Search candidates"
          />

          <select
            className="border border-gray-300 p-2.5 rounded-lg w-full md:w-48 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            value={minScore}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMinScore(Number(e.target.value))}
            aria-label="Filter by minimum score"
          >
            <option value={0}>All Scores</option>
            <option value={60}>60%+</option>
            <option value={75}>75%+</option>
            <option value={85}>85%+</option>
          </select>
        </div>

        {/* Candidate Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
          {filteredCandidates.map((candidate, index) => (
            <div key={candidate.id || index} className="relative group">
              {/* Top Candidate Badge */}
              {index === 0 && filteredCandidates.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg z-10 animate-pulse">
                  🏆 #1
                </span>
              )}
              <CandidateCard {...candidate} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium">
              {candidates.length === 0 
                ? "🚫 No candidates yet. Upload some resumes to get started!" 
                : "No candidates match your filters. Try adjusting your search."}
            </p>
          </div>
        )}

        {/* Analytics Chart */}
        {filteredCandidates.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm mt-10 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              📊 Candidate Score Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={filteredCandidates.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar 
                  dataKey="score" 
                  fill="#6366F1" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Floating ChatBot */}
      <ChatBot />
    </>
  );
}