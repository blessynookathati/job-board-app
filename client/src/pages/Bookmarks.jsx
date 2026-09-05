import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import ApplicationModal from "../components/ApplicationModal";
import { Bookmark, Briefcase, ArrowLeft } from "lucide-react";

export default function Bookmarks() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    loadSavedJobs();
  }, [user]);

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      // 1. Check local storage bookmarks
      const localIds = JSON.parse(localStorage.getItem("bookmarkedJobs") || "[]");

      // 2. Fetch all jobs from backend to filter matching IDs
      const res = await api.getJobs({ limit: 100, status: "all" });
      if (res.success) {
        const userSavedIds = user?.savedJobs || [];
        const combinedIds = Array.from(
          new Set([...localIds.map(String), ...userSavedIds.map(String)])
        );

        const filtered = res.jobs.filter(
          (j) =>
            combinedIds.includes(String(j._id)) ||
            combinedIds.includes(String(j.id)) ||
            localIds.includes(j.id) ||
            localIds.includes(Number(j.id))
        );

        setJobs(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChange = (jobId, isNowSaved) => {
    if (!isNowSaved) {
      setJobs((prev) => prev.filter((j) => (j.id || j._id) !== jobId && String(j._id) !== String(jobId)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Bookmark className="w-5 h-5 fill-amber-500" />
              <span className="text-xs uppercase font-bold tracking-wider">Candidate Bookmarks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Saved Job Listings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Jobs you’ve bookmarked are saved securely and synchronized across your sessions.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Find More Jobs</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-48" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">No Saved Jobs Yet</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              When you find a position you like, click the bookmark icon to save it for later review.
            </p>
            <Link
              to="/"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Explore Job Board
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id || job._id}
                job={job}
                onApplyClick={(j) => setSelectedJobForApply(j)}
                onSaveChange={handleSaveChange}
              />
            ))}
          </div>
        )}
      </div>

      {selectedJobForApply && (
        <ApplicationModal
          job={selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={() => loadSavedJobs()}
        />
      )}
    </div>
  );
}
