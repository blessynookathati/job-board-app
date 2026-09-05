import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, Video, MapPin, Phone, CheckCircle2, AlertCircle } from "lucide-react";

export default function CandidateInterviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, [user]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const res = await api.getInterviews();
      if (res.success) setInterviews(res.interviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep track of your scheduled discussions, technical screens, and video meetings.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-36 animate-pulse" />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Interviews Scheduled</h3>
            <p className="text-xs text-slate-400 mt-1">
              Once a recruiter shortlists your profile and books an interview slot, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((intv) => (
              <div
                key={intv._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-blue-600">{intv.company}</span>
                    <h3 className="text-lg font-bold text-slate-900">{intv.jobTitle}</h3>
                  </div>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-center">
                    {intv.type} Round • {intv.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Date & Time</span>
                      <strong>{intv.date} at {intv.time}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Duration & Format</span>
                      <strong>{intv.duration} ({intv.mode})</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Interviewers</span>
                      <strong className="truncate block max-w-[140px]">{intv.interviewers?.join(", ") || "Hiring Lead"}</strong>
                    </div>
                  </div>
                </div>

                {intv.notes && (
                  <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-0.5">Instructions:</span>
                    {intv.notes}
                  </div>
                )}

                {intv.meetingLink && (
                  <div className="flex justify-end pt-2">
                    <a
                      href={intv.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
