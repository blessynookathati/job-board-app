import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { api } from "../services/api";
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Download,
  Eye,
  Star,
  FileCheck
} from "lucide-react";

export default function ResumeManager() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotifications();
  const [uploading, setUploading] = useState(false);

  const resumes = user?.resumes || [
    {
      _id: "res_default",
      name: "Alex_Rivera_FullStack_2026.pdf",
      url: "/uploads/resumes/sample-alex-resume.pdf",
      uploadedAt: new Date().toISOString(),
      isDefault: true,
      extractedSkills: ["React", "JavaScript", "Node.js", "MongoDB", "TypeScript"]
    }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.uploadResume(formData);
      if (res.success) {
        showToast("Resume uploaded successfully!", "Resume Manager");
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || "Failed to upload resume.", "Error");
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (resumeId) => {
    try {
      await api.setDefaultResume(resumeId);
      showToast("Default resume updated.", "Saved");
      await refreshUser();
    } catch (e) {}
  };

  const handleDelete = async (resumeId) => {
    try {
      await api.deleteResume(resumeId);
      showToast("Resume removed.", "Deleted");
      await refreshUser();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Resume Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store multiple resumes tailored to different roles. Set your primary resume for 1-click applications.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center hover:border-blue-500 hover:bg-blue-50/20 transition cursor-pointer relative shadow-xs">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            {uploading ? "Uploading & Analyzing..." : "Click or Drag to Upload Resume"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Supports PDF, DOC, DOCX up to 10MB. NLP skill extraction occurs automatically.
          </p>
        </div>

        {/* Resume List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Your Stored Resumes ({resumes.length})</h2>

          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm">{resume.name}</h4>
                      {resume.isDefault && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                    </p>

                    {resume.extractedSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resume.extractedSkills.map((s, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  {!resume.isDefault && (
                    <button
                      onClick={() => handleSetDefault(resume._id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                    >
                      Make Default
                    </button>
                  )}

                  <a
                    href={resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                    title="Preview / Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {resumes.length > 1 && (
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
