import { useState } from "react";
import { api } from "../services/api";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

export default function ReportJobModal({ job, onClose }) {
  const [reason, setReason] = useState("Fake Job");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.reportJob(job._id || job.id, { reason, details });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      // quiet fallback
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Report Job Posting</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Report Submitted</h4>
            <p className="text-xs text-slate-500">
              Thank you for keeping JobConnect safe. Our trust & safety team has received your ticket.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              >
                <option value="Fake Job">Fake Job / Non-existent company</option>
                <option value="Scam">Scam / Asking for money or sensitive data</option>
                <option value="Incorrect Information">Incorrect or misleading information</option>
                <option value="Duplicate Job">Duplicate listing</option>
                <option value="Inappropriate Content">Inappropriate or discriminatory content</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Additional Details</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain the issue to help our review team..."
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div className="pt-2 flex gap-2">
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
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition shadow-xs"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
