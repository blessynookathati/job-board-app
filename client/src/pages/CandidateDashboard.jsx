import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  XCircle,
  ArrowRight,
  Sparkles,
  Building,
  TrendingUp
} from "lucide-react";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, intRes] = await Promise.all([
        api.getCandidateApplications(),
        api.getInterviews()
      ]);
      if (appRes.success) setApplications(appRes.applications);
      if (intRes.success) setInterviews(intRes.interviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Pipeline metrics
  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "Applied").length,
    underReview: applications.filter((a) => a.status === "Under Review").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    interview: applications.filter((a) => a.status === "Interview").length,
    offer: applications.filter((a) => a.status === "Offer").length,
    hired: applications.filter((a) => a.status === "Hired").length,
    rejected: applications.filter((a) => a.status === "Rejected").length
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Applied":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">Applied</span>;
      case "Under Review":
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">Under Review</span>;
      case "Shortlisted":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">Shortlisted ★</span>;
      case "Interview":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">Interview Scheduled</span>;
      case "Offer":
        return <span className="bg-green-100 text-green-800 border border-green-300 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse">Offer Received 🎉</span>;
      case "Hired":
        return <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">Hired 🚀</span>;
      case "Rejected":
        return <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-medium">Not Selected</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-blue-200">Candidate Recruitment Hub</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Welcome back, {user?.name || "Alex"}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Track your hiring progress, manage upcoming interviews, and optimize your application pipeline in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/candidate/recommendations"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Job Matches</span>
            </Link>
            <Link
              to="/candidate/profile"
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* 📈 ATS PIPELINE SUMMARY CARDS */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Application Pipeline Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Total</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{counts.total}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-blue-500 block">Applied</span>
              <span className="text-2xl font-extrabold text-blue-600 mt-0.5 block">{counts.applied}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-purple-500 block">Under Review</span>
              <span className="text-2xl font-extrabold text-purple-600 mt-0.5 block">{counts.underReview}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-500 block">Shortlisted</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-0.5 block">{counts.shortlisted}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-500 block">Interviews</span>
              <span className="text-2xl font-extrabold text-amber-600 mt-0.5 block">{counts.interview}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-green-600 block">Offers</span>
              <span className="text-2xl font-extrabold text-green-600 mt-0.5 block">{counts.offer}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Rejected</span>
              <span className="text-2xl font-extrabold text-slate-500 mt-0.5 block">{counts.rejected}</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Applications & Upcoming Interviews */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Submitted Applications</h2>
              <Link to="/" className="text-xs text-blue-600 hover:underline font-semibold">
                Explore More Openings →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 h-28 animate-pulse" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">No Applications Yet</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">You haven't submitted any job applications yet.</p>
                <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
                  Browse Active Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-blue-300 transition shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-slate-500">{app.company || app.jobDetails?.company}</span>
                        <h3 className="text-base font-bold text-slate-900">
                          {app.jobTitle || app.jobDetails?.title}
                        </h3>
                      </div>
                      <div>{getStatusBadge(app.status)}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span>Applied: <strong>{new Date(app.appliedDate).toLocaleDateString()}</strong></span>
                      {app.matchScore && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {app.matchScore}% Match
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-slate-400">ID: {app._id}</span>
                    </div>

                    {/* Timeline History snippet */}
                    {app.timeline && app.timeline.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-3 text-[11px] space-y-1">
                        <span className="font-semibold text-slate-600">Latest Event:</span>
                        <p className="text-slate-500">
                          {app.timeline[app.timeline.length - 1].note} (
                          {new Date(app.timeline[app.timeline.length - 1].date).toLocaleDateString()})
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Upcoming Interviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Scheduled Interviews</h2>
              <Link to="/candidate/interviews" className="text-xs text-blue-600 hover:underline font-semibold">
                View All
              </Link>
            </div>

            {interviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                No interviews scheduled currently.
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.map((intv) => (
                  <div key={intv._id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                        {intv.type} Round
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">{intv.status}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{intv.jobTitle}</h4>
                      <p className="text-xs text-slate-500">{intv.company}</p>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{intv.date} at {intv.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{intv.duration} ({intv.mode})</span>
                      </div>
                    </div>
                    {intv.meetingLink && (
                      <a
                        href={intv.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                      >
                        Join Meeting Link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
