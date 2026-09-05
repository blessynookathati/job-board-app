import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BrainCircuit,
  Award
} from "lucide-react";

export default function AIResumeAnalyzerModal({ job, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    runAnalysis();
  }, [job]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.analyzeResume(job._id || job.id, user);
      if (res.success) {
        setAnalysis(res);
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Resume & JD Analyzer</h3>
              <p className="text-xs text-slate-500">Matching {user?.name || "Candidate"} against {job.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Running NLP Semantic Parsing...</p>
            <p className="text-[11px] text-slate-400">Comparing technical skill tokens & required experience years</p>
          </div>
        ) : analysis ? (
          <div className="mt-4 space-y-4">
            {/* Top Score Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-md shadow-blue-500/10">
              <div>
                <span className="text-xs text-blue-100 uppercase tracking-wider font-semibold">
                  Job Match Score
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold">{analysis.overallScore}%</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    {analysis.recommendation}
                  </span>
                </div>
              </div>
              <Award className="w-12 h-12 text-white/40" />
            </div>

            {/* Match Breakdown Metric Bars */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Skills Overlap:</span>
                <span className="font-bold text-slate-800 text-base">{analysis.skillMatchPercentage}%</span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${analysis.skillMatchPercentage}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Experience Match:</span>
                <span className="font-bold text-slate-800 text-base">{analysis.experienceMatchPercentage}%</span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analysis.experienceMatchPercentage}%` }} />
                </div>
              </div>
            </div>

            {/* Matched Skills */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Matched Skills ({analysis.matchedSkills?.length || 0}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedSkills?.map((s) => (
                  <span key={s} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-md font-medium">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            {analysis.missingSkills?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>Missing or Target Skills ({analysis.missingSkills.length}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingSkills.map((s) => (
                    <span key={s} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-md font-medium">
                      ✗ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Support Note */}
            <p className="text-[11px] text-slate-400 italic">
              AI Decision Support: Match score is calculated from candidate profile skills, keywords, and job description criteria.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
            >
              Close Analyzer
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
