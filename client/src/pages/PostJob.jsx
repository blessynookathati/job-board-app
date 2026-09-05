import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useNotifications } from "../context/NotificationContext";
import { Briefcase, ArrowLeft, Send, Save } from "lucide-react";

export default function PostJob() {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Remote");
  const [workMode, setWorkMode] = useState("Remote");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [salary, setSalary] = useState(90000);
  const [experience, setExperience] = useState("2-4 years");
  const [skills, setSkills] = useState("React, Node.js, TypeScript, MongoDB");
  const [openings, setOpenings] = useState(2);
  const [deadline, setDeadline] = useState("2026-12-31");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState(
    "Develop scalable features across our core web applications.\nCollaborate in agile sprint cycles.\nWrite high quality unit tests and participate in code reviews."
  );
  const [requirements, setRequirements] = useState(
    "3+ years hands-on experience in full-stack web engineering.\nProficiency with JavaScript, React, and Node.js.\nExperience with database modeling in MongoDB."
  );

  const handleSubmit = async (status = "published") => {
    if (!title.trim() || !description.trim()) {
      showToast("Please provide a title and job description.", "Validation");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        location,
        workMode,
        employmentType,
        salary: Number(salary),
        experience,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        openings: Number(openings),
        deadline,
        description,
        responsibilities: responsibilities.split("\n").filter(Boolean),
        requirements: requirements.split("\n").filter(Boolean),
        status
      };

      const res = await api.createJob(payload);
      if (res.success) {
        showToast(`Job ${status === "draft" ? "saved as draft" : "published successfully"}!`, "Success");
        navigate("/recruiter/jobs");
      }
    } catch (err) {
      showToast(err.message || "Failed to create job posting.", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Manage Jobs</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Post a New Job Opening
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create a targeted job requisition with technical skill requirements for AI candidate ranking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Publish Job</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">1. Role Overview</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={title}
                  placeholder="e.g. Senior Frontend Engineer"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  placeholder="e.g. San Francisco, CA / Remote"
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Salary ($)</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Experience</label>
                <input
                  type="text"
                  value={experience}
                  placeholder="e.g. 2-4 years"
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Openings</label>
                <input
                  type="number"
                  value={openings}
                  onChange={(e) => setOpenings(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Required Technical Skills (Comma-separated for AI extraction)
              </label>
              <input
                type="text"
                value={skills}
                placeholder="React, JavaScript, TypeScript, Node.js"
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
          </div>

          {/* Description & Responsibilities */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">2. Position Details</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Description *</label>
              <textarea
                rows={4}
                value={description}
                placeholder="Describe the company context, the mission of the team, and what makes this position exciting..."
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Key Responsibilities (one per line)</label>
              <textarea
                rows={4}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qualifications & Requirements (one per line)</label>
              <textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
