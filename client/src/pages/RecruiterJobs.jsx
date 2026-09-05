import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useNotifications } from "../context/NotificationContext";
import {
  Briefcase,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  Play,
  Pause,
  XCircle,
  ExternalLink,
  Eye
} from "lucide-react";

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getJobs({ limit: 100, status: "all" });
      if (res.success) setJobs(res.jobs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const res = await api.updateJobStatus(jobId, newStatus);
      if (res.success) {
        showToast(`Job status updated to ${newStatus}.`, "Status");
        setJobs(jobs.map((j) => (j._id === jobId || j.id === jobId ? { ...j, status: newStatus } : j)));
      }
    } catch (e) {
      showToast("Failed to update status", "Error");
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.deleteJob(jobId);
      showToast("Job removed successfully.", "Deleted");
      setJobs(jobs.filter((j) => j._id !== jobId && j.id !== jobId));
    } catch (e) {
      showToast("Failed to delete job", "Error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Active</span>;
      case "draft":
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">Draft</span>;
      case "paused":
        return <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Paused</span>;
      case "closed":
        return <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">Closed</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Job Postings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Publish, pause, reopen, or review candidates for your active job requisitions.
            </p>
          </div>

          <Link
            to="/recruiter/jobs/create"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 self-start"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 h-24 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Jobs Posted Yet</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Get started by creating your first job opening to attract top applicants.
            </p>
            <Link
              to="/recruiter/jobs/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Post a Job Now
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Location / Mode</th>
                    <th className="p-4">Salary</th>
                    <th className="p-4">Applicants</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job._id || job.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <Link
                          to={`/jobs/${job._id || job.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm block line-clamp-1"
                        >
                          {job.title}
                        </Link>
                        <span className="text-[11px] text-slate-400">
                          Posted: {job.postedDate || "Recently"} • {job.openings || 1} Openings
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(job.status || "published")}</td>
                      <td className="p-4 text-slate-600">
                        {job.location} ({job.workMode || job.type})
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        ${typeof job.salary === "number" ? job.salary.toLocaleString() : job.salary}
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/recruiter/jobs/${job._id || job.id}/applicants`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{job.applicationsCount || 0} Candidates</span>
                        </Link>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {job.status === "published" ? (
                            <button
                              onClick={() => handleStatusChange(job._id || job.id, "paused")}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg"
                              title="Pause job"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(job._id || job.id, "published")}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg"
                              title="Publish / Reopen"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          <Link
                            to={`/recruiter/jobs/${job._id || job.id}/applicants`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            title="View Candidates"
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(job._id || job.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
