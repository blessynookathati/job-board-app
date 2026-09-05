import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import confetti from "canvas-confetti";
import {
  X,
  CheckCircle2,
  FileText,
  User,
  MessageSquareText,
  HelpCircle,
  Eye,
  Send,
  Upload,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

export default function ApplicationModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedApp, setSubmittedApp] = useState(null);

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "Alex Rivera",
    email: user?.email || "alex@example.com",
    phone: user?.phone || "+1 (555) 234-5678",
    location: user?.location || "San Francisco, CA"
  });

  const [selectedResume, setSelectedResume] = useState(
    user?.resumes?.[0]?.url || "/uploads/resumes/sample-alex-resume.pdf"
  );
  const [coverLetter, setCoverLetter] = useState(
    `Dear Hiring Team at ${job.company},\n\nI am thrilled to submit my application for the ${job.title} position. With my background in modern software engineering and proven track record of shipping scalable applications, I am confident in my ability to make an immediate impact on your team.\n\nThank you for your consideration.`
  );
  const [answers, setAnswers] = useState({
    noticePeriod: "2 weeks",
    expectedSalary: `$${(job.salary || 80000).toLocaleString()}`,
    workAuthorization: "Authorized to work in country",
    remotePreference: job.workMode || "Remote"
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        jobId: job._id || job.id,
        resumeUrl: selectedResume,
        coverLetter,
        answers,
        personalInfo
      };

      const res = await api.submitApplication(payload);
      if (res.success) {
        setSubmittedApp(res.application);
        setStep(6);
        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        if (onSuccess) onSuccess(res.application);
      }
    } catch (err) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepsHeader = [
    { num: 1, title: "Personal" },
    { num: 2, title: "Resume" },
    { num: 3, title: "Cover Letter" },
    { num: 4, title: "Questions" },
    { num: 5, title: "Review" },
    { num: 6, title: "Status" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Apply for {job.title}</h3>
            <p className="text-xs text-slate-500">{job.company} • {job.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            {stepsHeader.map((s) => {
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isDone ? "✓" : s.num}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 mt-1 hidden sm:block">
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <User className="w-4 h-4 text-blue-600" />
                <span>Step 1: Contact & Personal Information</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Current Location</label>
                  <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Resume */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Step 2: Select or Upload Resume</span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">Attached Resume</label>
                <div className="p-4 border-2 border-blue-500/40 bg-blue-50/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {user?.resumes?.[0]?.name || "Alex_Rivera_Resume_2026.pdf"}
                      </p>
                      <p className="text-xs text-slate-400">PDF • Primary Verified Resume</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
                    Selected ✓
                  </span>
                </div>
              </div>

              <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">Click or drag a new file to replace resume</p>
                <p className="text-[11px] text-slate-400 mt-1">Supports PDF, DOC, DOCX up to 10MB</p>
              </div>
            </div>
          )}

          {/* STEP 3: Cover Letter */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <MessageSquareText className="w-4 h-4 text-blue-600" />
                <span>Step 3: Cover Letter</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Why are you a great match for this role?
                </label>
                <textarea
                  rows={7}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full p-3 border rounded-xl text-xs sm:text-sm font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Additional Questions */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Step 4: Additional Screening Questions</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notice Period</label>
                  <input
                    type="text"
                    value={answers.noticePeriod}
                    onChange={(e) => setAnswers({ ...answers, noticePeriod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Salary (Annual)</label>
                  <input
                    type="text"
                    value={answers.expectedSalary}
                    onChange={(e) => setAnswers({ ...answers, expectedSalary: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Work Authorization</label>
                  <input
                    type="text"
                    value={answers.workAuthorization}
                    onChange={(e) => setAnswers({ ...answers, workAuthorization: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Confirm */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Step 5: Review Application Before Submission</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-200 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Position</p>
                  <p className="font-bold text-slate-800 text-sm">{job.title} at {job.company}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Applicant</p>
                    <p className="font-semibold text-slate-700">{personalInfo.name}</p>
                    <p className="text-slate-500">{personalInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Resume</p>
                    <p className="font-semibold text-slate-700">Primary PDF Selected</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Expected Salary</p>
                    <p className="font-semibold text-emerald-600">{answers.expectedSalary}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Notice Period</p>
                    <p className="font-semibold text-slate-700">{answers.noticePeriod}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Submission Result */}
          {step === 6 && submittedApp && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900">Application Submitted!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your application has been received and routed to {job.company}'s recruitment team.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Application ID:</span>
                  <span className="font-mono font-bold text-slate-800">{submittedApp._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Initial Status:</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    {submittedApp.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted At:</span>
                  <span className="text-slate-700">{new Date(submittedApp.appliedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {step > 1 && step < 6 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 5 && (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 5 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          )}

          {step === 6 && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
            >
              Done & Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
