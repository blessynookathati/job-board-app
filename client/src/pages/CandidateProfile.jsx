import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  FolderGit2,
  Share2,
  Sliders,
  Plus,
  Trash2,
  Save,
  CheckCircle
} from "lucide-react";

export default function CandidateProfile() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [social, setSocial] = useState({ github: "", linkedin: "", portfolio: "" });
  const [preferences, setPreferences] = useState({
    preferredLocation: "Remote",
    expectedSalary: 110000,
    noticePeriod: "2 weeks",
    workMode: "Remote"
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setHeadline(user.headline || "");
      setAbout(user.about || "");
      setLocation(user.location || "");
      setPhone(user.phone || "");
      setSkills(user.skills || []);
      setEducation(user.education || []);
      setExperience(user.experience || []);
      setProjects(user.projects || []);
      setSocial(user.social || { github: "", linkedin: "", portfolio: "" });
      if (user.preferences) setPreferences(user.preferences);
    }
  }, [user]);

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { degree: "B.S. in Computer Science", university: "University Name", startYear: 2020, endYear: 2024, cgpa: "3.8" }
    ]);
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { company: "Company Name", role: "Software Engineer", startDate: "2022-01", endDate: "Present", description: "Built scalable web applications." }
    ]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.updateProfile({
        name,
        headline,
        about,
        location,
        phone,
        skills,
        education,
        experience,
        projects,
        social,
        preferences
      });
      if (res.success) {
        showToast("Profile successfully updated!", "Saved");
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message || "Failed to save profile.", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidate Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              A comprehensive profile improves your AI match score and makes you stand out to recruiters.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 self-start"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. PERSONAL INFORMATION */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Details</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  placeholder="e.g. Senior Full Stack Developer"
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
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
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  placeholder="+1 (555) 000-0000"
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">About Me</label>
              <textarea
                rows={3}
                value={about}
                placeholder="Share your technical background and career objectives..."
                onChange={(e) => setAbout(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs"
              />
            </div>
          </div>

          {/* 2. TECHNICAL SKILLS */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span>Skills & Competencies</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                placeholder="Add skill (e.g. React, Node.js, Docker, AWS)..."
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); }}}
                className="flex-1 p-2.5 border rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-400 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 3. EXPERIENCE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>Work Experience</span>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Add Role</span>
              </button>
            </div>

            {experience.map((exp, idx) => (
              <div key={idx} className="p-4 border rounded-2xl bg-slate-50 space-y-3 relative text-xs">
                <button
                  type="button"
                  onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[idx].company = e.target.value;
                        setExperience(copy);
                      }}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Role</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[idx].role = e.target.value;
                        setExperience(copy);
                      }}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. PREFERENCES */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Career & Work Preferences</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Preference</label>
                <select
                  value={preferences.workMode}
                  onChange={(e) => setPreferences({ ...preferences, workMode: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Salary ($/yr)</label>
                <input
                  type="number"
                  value={preferences.expectedSalary}
                  onChange={(e) => setPreferences({ ...preferences, expectedSalary: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Period</label>
                <input
                  type="text"
                  value={preferences.noticePeriod}
                  placeholder="e.g. 2 weeks, Immediate"
                  onChange={(e) => setPreferences({ ...preferences, noticePeriod: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
