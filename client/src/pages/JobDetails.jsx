import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import ApplicationModal from "../components/ApplicationModal";
import AIResumeAnalyzerModal from "../components/AIResumeAnalyzerModal";
import ReportJobModal from "../components/ReportJobModal";
import {
  Building,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Briefcase,
  Users,
  ArrowLeft
} from "lucide-react";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getJobById(id);
      if (res.success) {
        setJob(res.job);
        // Check saved status
        const localSaved = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");
        const isSaved =
          localSaved.includes(res.job.id) ||
          localSaved.includes(res.job._id) ||
          localSaved.includes(Number(res.job.id)) ||
          res.job.isSaved;
        setSaved(Boolean(isSaved));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!job) return;
    const next = !saved;
    setSaved(next);

    // Sync localStorage
    let localSaved = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");
    const key = job.id || job._id;
    if (next) {
      localSaved.push(key);
    } else {
      localSaved = localSaved.filter((i) => i !== key && String(i) !== String(key));
    }
    localStorage.setItem("bookmarkedJobs", JSON.stringify(localSaved));

    // Sync API
    if (user) {
      try {
        await api.toggleSaveJob(job._id || job.id);
      } catch (e) {}
    }

    showToast(next ? "Job saved to your bookmarks." : "Job removed from bookmarks.", "Bookmarks");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Job link copied to clipboard!", "Share");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-40 bg-slate-200 rounded" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Listing Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-4">The listing may have expired or been removed.</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Openings</span>
        </Link>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                {job.companyInfo?.logo ? (
                  <img src={job.companyInfo.logo} alt={job.company} className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <span className="text-sm font-semibold text-blue-600">{job.company}</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location} ({job.workMode || job.type})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {job.employmentType || "Full-time"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Posted {job.postedDate || "Recently"}
                  </span>
                </div>
              </div>
            </div>

            {/* Salary & Actions */}
            <div className="sm:text-right flex flex-col items-start sm:items-end justify-between">
              <div className="text-emerald-600 font-extrabold text-2xl" data-testid="job-salary">
                ${typeof job.salary === "number" ? job.salary.toLocaleString() : job.salary}
                <span className="text-xs font-normal text-slate-400">/year</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                {job.openings || 1} {job.openings === 1 ? "opening" : "openings"} • {job.applicationsCount || 0} applicants
              </span>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
              >
                <span>Apply Now</span>
              </button>

              <button
                onClick={() => setShowAIModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Match Score</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                data-testid={`bookmark-btn-${job.id || job._id}`}
                onClick={handleToggleSave}
                className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-medium ${
                  saved
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? "fill-amber-500" : ""}`} />
                <span>{saved ? "Saved" : "Save Job"}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5 text-xs font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition text-xs"
                title="Report Job"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info Columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-3">About the Position</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </p>

              {/* Responsibilities */}
              {job.responsibilities?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Key Responsibilities</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Requirements & Skills</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base mb-3">Benefits & Perks</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {job.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Required Skills Widget */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Required Competencies</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Overview Widget */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3">About the Company</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {job.companyInfo?.about || `${job.company} is a leading employer actively hiring technical talent on JobConnect.`}
              </p>
              {job.companyId && (
                <Link
                  to={`/companies/${job.companyId}`}
                  className="mt-4 block text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                >
                  View Company Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApplyModal && (
        <ApplicationModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => fetchJobDetails()}
        />
      )}

      {showAIModal && (
        <AIResumeAnalyzerModal
          job={job}
          onClose={() => setShowAIModal(false)}
        />
      )}

      {showReportModal && (
        <ReportJobModal
          job={job}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
