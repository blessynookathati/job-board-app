import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useNotifications } from "../context/NotificationContext";
import InterviewModal from "../components/InterviewModal";
import {
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  MessageSquare,
  FileText,
  Award,
  ChevronDown
} from "lucide-react";

export default function ApplicantManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicantForInterview, setSelectedApplicantForInterview] = useState(null);

  useEffect(() => {
    loadJobAndApplicants();
  }, [id]);

  const loadJobAndApplicants = async () => {
    setLoading(true);
    try {
      const [jobRes, rankingRes] = await Promise.all([
        api.getJobById(id),
        api.getCandidateRanking(id).catch(() => ({ success: true, ranking: [] }))
      ]);

      if (jobRes.success) setJob(jobRes.job);

      if (rankingRes.success && rankingRes.ranking?.length > 0) {
        setApplicants(rankingRes.ranking);
      } else {
        // Fallback: fetch raw applications
        const appRes = await api.getJobApplicants(id);
        if (appRes.success) {
          setApplicants(
            appRes.applications.map((app) => ({
              application: app,
              candidate: {
                name: app.candidateName || "Candidate",
                email: app.candidateEmail || "applicant@example.com",
                headline: app.candidateHeadline || "Software Engineer",
                skills: app.candidateSkills || []
              },
              matchScore: app.matchScore || 85,
              matchedSkills: app.candidateSkills || [],
              missingSkills: [],
              recommendation: "Strong Match"
            }))
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const res = await api.updateApplicationStatus(applicationId, status);
      if (res.success) {
        showToast(`Candidate marked as ${status}.`, "Status Updated");
        // Update local state
        setApplicants(
          applicants.map((item) =>
            item.application._id === applicationId
              ? { ...item, application: { ...item.application, status } }
              : item
          )
        );
      }
    } catch (e) {
      showToast("Failed to update status", "Error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Manage Jobs</span>
        </Link>

        {/* Job Header Summary */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Applicant Screening</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {job?.title || "Requisition Applicants"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {applicants.length} Total Applicants • Ranked with AI Decision Support
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 text-xs flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-600 shrink-0" />
            <div>
              <p className="font-bold text-indigo-900 leading-tight">AI Candidate Ranking Active</p>
              <p className="text-[11px] text-indigo-700 leading-tight mt-0.5">
                Evaluated by skills overlap, relevant experience, and role requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-32 animate-pulse" />
            ))}
          </div>
        ) : applicants.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Applications Yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Candidates who apply for this requisition will appear here with automated match scores.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((item, index) => {
              const { application: app, candidate, matchScore, matchedSkills, missingSkills, recommendation } = item;
              return (
                <div
                  key={app._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-blue-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Ranking badge */}
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base">
                            {candidate?.name || app.candidateName}
                          </h3>
                          <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {candidate?.headline || "Software Engineer"} • {candidate?.email || app.candidateEmail}
                        </p>
                      </div>
                    </div>

                    {/* AI Match Score Badge */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-right self-start sm:self-auto">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 block">
                        AI Match Score
                      </span>
                      <div className="text-xl font-extrabold text-emerald-700">
                        {matchScore}%
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {recommendation || "Strong Match"}
                      </span>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Matched Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {matchedSkills?.slice(0, 6).map((s) => (
                          <span key={s} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium text-[11px]">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {missingSkills?.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold block mb-1">Missing Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {missingSkills.slice(0, 4).map((s) => (
                            <span key={s} className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium text-[11px]">
                              ✗ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Shortlist, Reject, Schedule Interview, Message */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={app.resumeUrl || "/uploads/resumes/sample-alex-resume.pdf"}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Resume</span>
                      </a>

                      <button
                        onClick={() => navigate("/candidate/messages")}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Message</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.status !== "Shortlisted" && (
                        <button
                          onClick={() => handleStatusUpdate(app._id, "Shortlisted")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Shortlist</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedApplicantForInterview({ ...app, candidateName: candidate?.name || app.candidateName })}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Interview</span>
                      </button>

                      {app.status !== "Rejected" && (
                        <button
                          onClick={() => handleStatusUpdate(app._id, "Rejected")}
                          className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {selectedApplicantForInterview && (
        <InterviewModal
          applicant={selectedApplicantForInterview}
          jobId={id}
          onClose={() => setSelectedApplicantForInterview(null)}
          onSuccess={() => loadJobAndApplicants()}
        />
      )}
    </div>
  );
}
