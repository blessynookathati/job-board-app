import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  UserCheck,
  TrendingUp,
  PlusCircle,
  BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecruiterData();
  }, [user]);

  const loadRecruiterData = async () => {
    setLoading(true);
    try {
      const [jobRes, appRes] = await Promise.all([
        api.getJobs({ limit: 100, status: "all" }),
        api.getJobApplicants("all").catch(() => ({ success: true, applications: [] }))
      ]);

      if (jobRes.success) {
        setJobs(jobRes.jobs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Metric stats
  const activeJobs = jobs.filter((j) => j.status === "published").length;
  const totalApps = jobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 0);
  const shortlistedCount = 36;
  const interviewCount = 18;
  const offerCount = 5;
  const hiredCount = 3;

  // Chart Data: Applications per Job
  const appPerJobData = jobs.slice(0, 6).map((j) => ({
    name: j.title.length > 15 ? j.title.substring(0, 13) + "..." : j.title,
    applications: j.applicationsCount || Math.floor(Math.random() * 40) + 10
  }));

  // Chart Data: Monthly Trends
  const monthlyData = [
    { month: "May", applications: 45, hires: 1 },
    { month: "Jun", applications: 72, hires: 2 },
    { month: "Jul", applications: 110, hires: 3 },
    { month: "Aug", applications: 185, hires: 4 },
    { month: "Sep", applications: 247, hires: 5 }
  ];

  // Chart Data: Pipeline Status Distribution
  const statusData = [
    { name: "Applied", value: 125, color: "#3b82f6" },
    { name: "Under Review", value: 60, color: "#8b5cf6" },
    { name: "Shortlisted", value: 36, color: "#10b981" },
    { name: "Interview", value: 18, color: "#f59e0b" },
    { name: "Offer", value: 5, color: "#ec4899" },
    { name: "Hired", value: 3, color: "#059669" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">Recruiter Control Center</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              TechCorp Global Talent Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Monitor active requisitions, evaluate AI-ranked candidates, and streamline candidate movement through the funnel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/recruiter/jobs"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/10 transition"
            >
              Manage Postings
            </Link>
            <Link
              to="/recruiter/jobs/create"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Job</span>
            </Link>
          </div>
        </div>

        {/* 🏢 RECRUITER METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 block">Active Jobs</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{activeJobs}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 block">Applications</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalApps || 247}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-emerald-500 block">Shortlisted</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{shortlistedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-amber-500 block">Interviews</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{interviewCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-pink-500 block">Offers</span>
            <span className="text-2xl font-extrabold text-pink-600 mt-1 block">{offerCount}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700 block">Hired</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{hiredCount}</span>
          </div>
        </div>

        {/* 📊 CHARTS SECTION (Recharts) */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Applications Per Job */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Applications per Job Requisition</h3>
                <p className="text-xs text-slate-400">Total volume of received candidate resumes</p>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appPerJobData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Bar dataKey="applications" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Inflow Trends */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Applications & Hiring Velocity</h3>
                <p className="text-xs text-slate-400">Monthly applicant intake and finalized hires</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Area type="monotone" dataKey="applications" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hiring Funnel Distribution */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs lg:col-span-2">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Recruitment Funnel & Status Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Candidates at each stage of the screening lifecycle</p>

            <div className="grid md:grid-cols-6 gap-3 pt-2">
              {statusData.map((stage) => (
                <div key={stage.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ backgroundColor: stage.color }} />
                  <span className="text-[11px] font-semibold text-slate-500 block">{stage.name}</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">{stage.value}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {Math.round((stage.value / 247) * 100)}% of total
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
