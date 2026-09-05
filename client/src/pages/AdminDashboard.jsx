import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNotifications } from "../context/NotificationContext";
import {
  Shield,
  Users,
  Briefcase,
  Building,
  AlertTriangle,
  FileCheck,
  Ban,
  CheckCircle,
  Activity,
  Trash2
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { showToast } = useNotifications();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminReports(),
        api.getAdminLogs()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (reportsRes.success) setReports(reportsRes.reports);
      if (logsRes.success) setLogs(logsRes.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "blocked" ? "active" : "blocked";
    try {
      const res = await api.updateUserStatus(userId, { status: nextStatus });
      if (res.success) {
        showToast(`User status updated to ${nextStatus}.`, "User Moderation");
        setUsers(users.map((u) => (u._id === userId ? { ...u, status: nextStatus } : u)));
      }
    } catch (e) {
      showToast("Failed to update user", "Error");
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      const res = await api.reviewReport(reportId, { action, status: "resolved" });
      if (res.success) {
        showToast(`Report action executed: ${action}.`, "Report Moderation");
        setReports(reports.filter((r) => r._id !== reportId));
      }
    } catch (e) {
      showToast("Failed to process report", "Error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>JobConnect System Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Administration & Moderation
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
              Real-time platform telemetry, user permission management, job scam detection, and audit trails.
            </p>
          </div>
        </div>

        {/* Global Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Total Users</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{stats.totalUsers}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-blue-500 block">Candidates</span>
              <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{stats.candidatesCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-500 block">Recruiters</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{stats.recruitersCount}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-indigo-500 block">Active Jobs</span>
              <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{stats.activeJobs}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-purple-500 block">Applications</span>
              <span className="text-2xl font-extrabold text-purple-600 mt-1 block">{stats.totalApplications}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-red-500 block">Reports Queue</span>
              <span className="text-2xl font-extrabold text-red-600 mt-1 block">{stats.pendingReports}</span>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-4 border-b-2 transition ${
              activeTab === "overview" ? "border-purple-600 text-purple-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "reports" ? "border-purple-600 text-purple-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Job Reports Moderation</span>
            {reports.length > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {reports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-3 px-4 border-b-2 transition ${
              activeTab === "logs" ? "border-purple-600 text-purple-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            System Audit Logs
          </button>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-slate-400 text-[11px]">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-semibold text-slate-700">{u.role}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.status === "blocked"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {u.status || "active"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {u.isVerified ? "Verified ✓" : "Pending"}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleUserStatusToggle(u._id, u.status)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                              u.status === "blocked"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {u.status === "blocked" ? "Unblock Account" : "Suspend Account"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REPORTS MODERATION */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No outstanding safety reports in the queue.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <div key={rep._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {rep.reason}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {rep.jobTitle} ({rep.company})
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{rep.details}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Report ID: {rep._id} • Date: {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => handleReportAction(rep._id, "dismiss")}
                        className="px-3 py-1.5 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleReportAction(rep._id, "remove_job")}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Remove Reported Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SYSTEM AUDIT LOGS */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target Resource</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/60 transition text-[11px]">
                      <td className="p-4 text-slate-400">{log.timestamp || new Date().toISOString()}</td>
                      <td className="p-4 font-bold text-slate-800">{log.userName || log.userId}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{log.targetResource}</td>
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
