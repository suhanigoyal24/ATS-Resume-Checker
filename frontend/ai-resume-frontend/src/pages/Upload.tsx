import { useState } from "react";
import { uploadResume } from "../services/api";

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    try {
      const data = await uploadResume(file, job);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Backend error ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white px-4">
      
      {/* Title */}
      <h2 className="text-4xl font-extrabold mb-4 text-center">
        📄 Upload Resume
      </h2>

      {/* Input Card */}
      <div className="bg-white text-black p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4">
        
        <input
          type="file"
          onChange={(e: any) => setFile(e.target.files[0])}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Paste Job Description..."
          value={job}
          onChange={(e) => setJob(e.target.value)}
          className="border p-2 rounded h-28"
        />

        <button
          onClick={handleUpload}
          className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          🚀 Analyze Resume
        </button>
      </div>

      {/* Result Section */}
      {result && (
        <div className="mt-6 bg-white text-black p-6 rounded-xl shadow-lg w-full max-w-md text-center">
          <h3 className="text-xl font-bold mb-2">
            Score: {result.score}
          </h3>
          <p>
            Keywords: {result.matched_keywords?.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}