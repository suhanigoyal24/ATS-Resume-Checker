import { useState } from "react";
import { uploadResume } from "../services/api";

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    console.log("BUTTON CLICKED");

    if (!file) {
      alert("Please select a file!");
      return;
    }

    try {
      const data = await uploadResume(file, job);
      console.log("API Response:", data);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Backend error ❌");
    }
  };

  return (
    <div className="flex justify-center mt-20">
      <div className="w-[400px] text-center space-y-4">

        <h2 className="text-xl font-semibold">Upload Resume</h2>

        <input
          type="file"
          onChange={(e: any) => setFile(e.target.files[0])}
          className="w-full"
        />

        <textarea
          placeholder="Job description"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          className="w-full p-2 rounded text-black"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Upload Resume
        </button>

        {result && (
          <div className="mt-4 text-left">
            <h3>Score: {result.score}</h3>
            <p>Keywords: {result.matched_keywords.join(", ")}</p>
          </div>
        )}

      </div>
    </div>
  );
}