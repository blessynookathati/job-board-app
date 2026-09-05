import { useState } from "react";
import { api } from "../services/api";
import { X, Calendar, Clock, Video, FileText } from "lucide-react";

export default function InterviewModal({ applicant, jobId, onClose, onSuccess }) {
  const [type, setType] = useState("Technical");
  const [date, setDate] = useState("2026-09-18");
  const [time, setTime] = useState("10:30 AM");
  const [duration, setDuration] = useState("45 minutes");
  const [mode, setMode] = useState("Online");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/job-conn-" + Math.random().toString(36).substring(2, 7));
  const [notes, setNotes] = useState("Please prepare to discuss your hands-on experience and system design architecture.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.scheduleInterview({
        applicationId: applicant._id,
        jobId: jobId || applicant.jobId,
        candidateId: applicant.candidateId || applicant._id,
        type,
        date,
        time,
        duration,
        mode,
        meetingLink,
        notes
      });

      if (res.success) {
        if (onSuccess) onSuccess(res.interview);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to schedule interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Schedule Candidate Interview</h3>
            <p className="text-xs text-slate-500">
              Candidate: <strong className="text-slate-800">{applicant.candidateName || applicant.name}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mt-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Round</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              >
                <option value="Technical">Technical Round</option>
                <option value="HR">HR / Culture Screen</option>
                <option value="Managerial">Hiring Manager</option>
                <option value="Final">Final Executive</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              >
                <option value="Online">Online Video (Google Meet/Zoom)</option>
                <option value="Phone">Phone Screen</option>
                <option value="In-person">In-person Onsite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                value={time}
                placeholder="e.g. 10:30 AM"
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meeting Link</label>
            <input
              type="text"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-blue-600 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Instructions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition"
            >
              {loading ? "Scheduling..." : "Confirm & Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
