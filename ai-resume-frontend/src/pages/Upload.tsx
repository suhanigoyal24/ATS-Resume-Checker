import { useState } from "react";
import ChatBot from "../components/ChatBot";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    alert(`Uploaded: ${file.name}`);
  };

  return (
    <>
      {/* 🌈 Background */}
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-6">
        {/* 📄 Upload Card */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
          <h2 className="text-3xl font-extrabold mb-4 text-indigo-600">
            📄 Upload Resume
          </h2>

          <p className="text-gray-500 mb-4 text-sm">
            Only PDF files are supported
          </p>

          {/* File Input */}
          <label className="block border-2 border-dashed border-indigo-400 p-6 rounded-xl cursor-pointer hover:bg-indigo-50 transition">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <p className="text-indigo-600 font-medium">Click to choose file</p>
          </label>

          {/* Show file */}
          {file && (
            <p className="mt-4 text-sm text-gray-700 font-medium">
              📎 {file.name}
            </p>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            🚀 Upload Resume
          </button>
        </div>
      </div>

      {/* 🤖 ChatBot FIXED */}
      <ChatBot />
    </>
  );
}
