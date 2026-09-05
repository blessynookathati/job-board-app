import { useAuth } from "../context/AuthContext";
import { User, Briefcase, ShieldCheck, Eye } from "lucide-react";

export default function DemoRoleSwitcher() {
  const { user, demoRole, switchDemoRole } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-sm flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-slate-100 uppercase tracking-wider">Demo Switcher:</span>
        <span className="text-slate-400 hidden sm:inline">Click to instantly test any role:</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => switchDemoRole("candidate")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
            user?.role === "candidate" || demoRole === "candidate"
              ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Candidate <span className="text-blue-200 hidden md:inline">(Alex)</span></span>
        </button>

        <button
          onClick={() => switchDemoRole("recruiter")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
            user?.role === "recruiter" || demoRole === "recruiter"
              ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Recruiter <span className="text-emerald-200 hidden md:inline">(Sarah)</span></span>
        </button>

        <button
          onClick={() => switchDemoRole("admin")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
            user?.role === "admin" || demoRole === "admin"
              ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-400"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>

        <button
          onClick={() => switchDemoRole("guest")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
            demoRole === "guest" || !user
              ? "bg-slate-700 text-white ring-1 ring-slate-500"
              : "bg-slate-800 hover:bg-slate-700 text-slate-400"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Guest</span>
        </button>
      </div>
    </div>
  );
}
