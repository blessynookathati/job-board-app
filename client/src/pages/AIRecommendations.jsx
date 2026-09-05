import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import ApplicationModal from "../components/ApplicationModal";
import {
  Sparkles,
  BrainCircuit,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function AIRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Skill Gap State
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loadingGap, setLoadingGap] = useState(false);

  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    loadRecommendations();
    runGapAnalysis(targetRole);
  }, [user]);

  const loadRecommendations = async () => {
    setLoadingJobs(true);
    try {
      const res = await api.getJobRecommendations();
      if (res.success) setRecommendations(res.recommendations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJobs(false);
    }
  };

  const runGapAnalysis = async (role) => {
    setLoadingGap(true);
    try {
      const res = await api.analyzeSkillGap(role);
      if (res.success) setGapAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGap(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
            <BrainCircuit className="w-4 h-4" />
            <span>AI NLP & Semantic Matching Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalized Career Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jobs scored dynamically against your skill profile, plus automated skill gap roadmaps to reach your next career milestone.
          </p>
        </div>

        {/* SECTION 1: AI JOB RECOMMENDATIONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Top Recommended Openings</span>
              </h2>
              <p className="text-xs text-slate-500">Ranked by algorithmic competency compatibility</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">
              {recommendations.length} Matches Found
            </span>
          </div>

          {loadingJobs ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-56 animate-pulse" />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              Update your skills in profile to receive personalized recommendations.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((job) => (
                <JobCard
                  key={job.id || job._id}
                  job={job}
                  onApplyClick={(j) => setSelectedJobForApply(j)}
                />
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: SKILL GAP ANALYSIS */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
                <Target className="w-5 h-5" />
                <span>Skill Gap & Upskilling Roadmap</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark your technical stack against target industry roles to uncover growth areas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Target Role:</span>
              <select
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  runGapAnalysis(e.target.value);
                }}
                className="p-2 border rounded-xl text-xs font-semibold bg-slate-50"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="AI Engineer">AI / ML Engineer</option>
                <option value="DevOps Engineer">DevOps & Cloud Engineer</option>
              </select>
            </div>
          </div>

          {loadingGap || !gapAnalysis ? (
            <div className="h-36 bg-slate-50 rounded-2xl animate-pulse" />
          ) : (
            <div className="space-y-6">
              {/* Readiness Score */}
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Role Readiness Index
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-slate-900">{gapAnalysis.readinessScore}%</span>
                    <span className="text-xs text-slate-500 font-medium">
                      matched against standard {gapAnalysis.target} requirements
                    </span>
                  </div>
                </div>

                <div className="flex-1 max-w-xs bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${gapAnalysis.readinessScore}%` }}
                  />
                </div>
              </div>

              {/* Acquired vs Missing grid */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Skills You Have ({gapAnalysis.acquiredSkills.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {gapAnalysis.acquiredSkills.map((s) => (
                      <span key={s} className="bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
                  <span className="font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Skills to Acquire ({gapAnalysis.missingSkills.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {gapAnalysis.missingSkills.map((s) => (
                      <span key={s} className="bg-white border border-amber-200 text-amber-800 px-2 py-0.5 rounded font-medium">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Roadmap */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Structured Learning Path</span>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gapAnalysis.learningRoadmap.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800">{item.skill}</h4>
                        <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                          {item.level}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        ~{item.estimatedWeeks} weeks estimated
                      </span>
                      <ul className="space-y-1 text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                        {item.recommendedTopics.map((topic, tIdx) => (
                          <li key={tIdx} className="line-clamp-1">• {topic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedJobForApply && (
        <ApplicationModal
          job={selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={() => loadRecommendations()}
        />
      )}
    </div>
  );
}
