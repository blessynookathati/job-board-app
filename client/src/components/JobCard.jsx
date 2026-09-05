import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  MapPin,
  Building,
  DollarSign,
  Bookmark,
  Sparkles,
  ArrowRight,
  Clock
} from "lucide-react";

export default function JobCard({ job, onApplyClick, onSaveChange }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const jobId = job.id || job._id;

  useEffect(() => {
    // Check both localStorage bookmarks (for existing tests) and user.savedJobs
    const localSaved = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");
    const userSaved = user?.savedJobs || [];
    const isBookmarked =
      localSaved.includes(jobId) ||
      localSaved.includes(Number(jobId)) ||
      localSaved.includes(String(jobId)) ||
      userSaved.includes(String(job._id)) ||
      userSaved.includes(String(job.id));

    setSaved(Boolean(isBookmarked));
  }, [jobId, user?.savedJobs]);

  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Maintain backward compatibility with localStorage
    let localSaved = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");
    const idKey = Number(jobId) || jobId;
    let nextState = false;

    if (localSaved.includes(idKey) || localSaved.includes(String(idKey))) {
      localSaved = localSaved.filter((id) => id !== idKey && String(id) !== String(idKey));
      nextState = false;
    } else {
      localSaved.push(idKey);
      nextState = true;
    }
    localStorage.setItem("bookmarkedJobs", JSON.stringify(localSaved));
    setSaved(nextState);

    // 2. Sync to MongoDB API if user is authenticated
    if (user) {
      setLoadingSave(true);
      try {
        const res = await api.toggleSaveJob(job._id || job.id);
        if (res.success) {
          setSaved(res.isSaved);
        }
      } catch (err) {
        // quiet fallback
      } finally {
        setLoadingSave(false);
      }
    }

    if (onSaveChange) onSaveChange(jobId, nextState);
  };

  // Salary formatting
  const formattedSalary = typeof job.salary === "number"
    ? `$${job.salary.toLocaleString()}/yr`
    : job.salary;

  return (
    <div
      data-testid={`job-card-${jobId}`}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between group relative"
    >
      <div>
        {/* Header Row: Company, Title & Save button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {job.companyInfo?.logo ? (
                <img src={job.companyInfo.logo} alt={job.company} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-500 truncate block">
                {job.company}
              </span>
              <Link
                to={`/jobs/${job._id || job.id}`}
                className="font-bold text-slate-900 hover:text-blue-600 transition text-base line-clamp-1 group-hover:text-blue-600"
              >
                {job.title}
              </Link>
            </div>
          </div>

          <button
            data-testid={`bookmark-btn-${jobId}`}
            data-bookmarked={saved}
            onClick={toggleBookmark}
            disabled={loadingSave}
            title={saved ? "Remove from saved" : "Save job"}
            className={`p-2 rounded-xl transition shrink-0 ${
              saved
                ? "bg-amber-50 text-amber-500 border border-amber-200"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-amber-500" : ""}`} />
          </button>
        </div>

        {/* Badges: Type, Location, Experience */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
            {job.type || job.workMode}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {job.location}
          </span>
          {job.experience && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {job.experience}
            </span>
          )}
          {job.matchScore && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {job.matchScore}% Match
            </span>
          )}
        </div>

        {/* Salary */}
        <div className="mt-3 flex items-center gap-1 text-emerald-600 font-bold text-base">
          <span data-testid="job-salary">
            ${job.salary}
          </span>
          <span className="text-xs font-normal text-slate-400">/year</span>
        </div>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {(job.skills || []).slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium"
            >
              {skill}
            </span>
          ))}
          {(job.skills || []).length > 4 && (
            <span className="text-xs text-slate-400 self-center font-medium pl-1">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/jobs/${job._id || job.id}`}
          className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          View Details
        </Link>

        <button
          onClick={() => onApplyClick ? onApplyClick(job) : null}
          className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
