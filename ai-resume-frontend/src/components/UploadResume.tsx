import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ✅ IMPORTANT FIX (worker)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const skillsDB = [
  "react",
  "node",
  "python",
  "java",
  "machine learning",
  "ai",
  "sql",
  "javascript",
  "html",
  "css",
];

export default function UploadResume({ onUpload }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState("");

  const extractSkills = (text: string) => {
    const lower = text.toLowerCase();
    return skillsDB.filter((skill) => lower.includes(skill));
  };

  const calculateScore = (resumeSkills: string[], jobSkills: string[]) => {
    if (jobSkills.length === 0) return 0;
    const match = resumeSkills.filter((s) => jobSkills.includes(s));
    return Math.floor((match.length / jobSkills.length) * 100);
  };

  // ✅ READ PDF
  const readPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += pageText + " ";
    }

    return text;
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    try {
      let text = "";

      if (file.type === "application/pdf") {
        text = await readPDF(file);
      } else {
        text = await file.text();
      }

      console.log("Extracted Text:", text);

      const resumeSkills = extractSkills(text);
      const jobSkills = extractSkills(job);

      const score = calculateScore(resumeSkills, jobSkills);

      const newCandidate = {
        name: file.name.split(".")[0],
        skills: resumeSkills,
        score,
      };

      onUpload(newCandidate);

      alert("Resume analyzed successfully ✅");
    } catch (error) {
      console.error(error);
      alert("Error reading PDF ❌");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow text-center max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-3 text-blue-600">
        Upload Resume (PDF Supported)
      </h2>

      <input
        type="file"
        onChange={(e: any) => setFile(e.target.files[0])}
        className="mb-3"
      />

      <textarea
        placeholder="Paste Job Description..."
        className="border p-2 rounded w-full mb-3"
        value={job}
        onChange={(e) => setJob(e.target.value)}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Analyze Resume
      </button>
    </div>
  );
}
