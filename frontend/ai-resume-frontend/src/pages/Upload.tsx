// src/pages/Upload.tsx
import UploadResume from "../components/UploadResume";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <UploadResume />
      </div>
    </div>
  );
}