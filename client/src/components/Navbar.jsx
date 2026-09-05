import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import {
  Briefcase,
  Bell,
  Bookmark,
  FileText,
  Sparkles,
  Calendar,
  MessageSquare,
  Building,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  PlusCircle
} from "lucide-react";

export default function Navbar() {
  const { user, logout, isCandidate, isRecruiter, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-[31px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                JobConnect
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-600 -mt-1">
                Recruitment Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition"
            >
              Jobs
            </Link>
            <Link
              to="/companies"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition"
            >
              Companies
            </Link>

            {/* Candidate specific links */}
            {isCandidate && (
              <>
                <Link
                  to="/candidate/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Applications</span>
                </Link>
                <Link
                  to="/tracker"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition flex items-center gap-1.5"
                >
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Saved</span>
                </Link>
                <Link
                  to="/candidate/recommendations"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Match</span>
                </Link>
                <Link
                  to="/candidate/interviews"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Interviews</span>
                </Link>
              </>
            )}

            {/* Recruiter specific links */}
            {isRecruiter && (
              <>
                <Link
                  to="/recruiter/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/recruiter/jobs"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition"
                >
                  Manage Jobs
                </Link>
                <Link
                  to="/recruiter/interviews"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 transition"
                >
                  Interviews
                </Link>
                <Link
                  to="/recruiter/jobs/create"
                  className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a Job</span>
                </Link>
              </>
            )}

            {/* Admin specific link */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 transition flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Chat link */}
                <Link
                  to="/candidate/messages"
                  title="Messages"
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Drawer */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) {
                                  navigate(n.link);
                                  setShowNotifications(false);
                                }
                              }}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                                !n.read ? "bg-blue-50/40" : ""
                              }`}
                            >
                              <div
                                className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                                  !n.read ? "bg-blue-600" : "bg-transparent"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">
                                  {n.title}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize leading-tight">
                        {user.role}
                      </p>
                    </div>
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                      </div>

                      {isCandidate && (
                        <div className="py-1 border-b border-slate-100">
                          <Link
                            to="/candidate/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          >
                            <User className="w-4 h-4" />
                            <span>Edit Profile</span>
                          </Link>
                          <Link
                            to="/candidate/resume"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Resume Manager</span>
                          </Link>
                          <Link
                            to="/candidate/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          >
                            <Briefcase className="w-4 h-4" />
                            <span>Application Tracker</span>
                          </Link>
                        </div>
                      )}

                      {isRecruiter && (
                        <div className="py-1 border-b border-slate-100">
                          <Link
                            to="/recruiter/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          >
                            <Briefcase className="w-4 h-4" />
                            <span>Recruiter Dashboard</span>
                          </Link>
                          <Link
                            to="/recruiter/company"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          >
                            <Building className="w-4 h-4" />
                            <span>Company Profile</span>
                          </Link>
                        </div>
                      )}

                      {isAdmin && (
                        <div className="py-1 border-b border-slate-100">
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-purple-700 hover:bg-purple-50"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin Center</span>
                          </Link>
                        </div>
                      )}

                      <div className="pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-blue-600 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Jobs
          </Link>
          <Link
            to="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Companies
          </Link>
          {isCandidate && (
            <>
              <Link
                to="/candidate/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Applications
              </Link>
              <Link
                to="/tracker"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Saved Jobs
              </Link>
              <Link
                to="/candidate/recommendations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-700 hover:bg-indigo-50"
              >
                AI Recommendations
              </Link>
              <Link
                to="/candidate/interviews"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Interviews
              </Link>
            </>
          )}
          {isRecruiter && (
            <>
              <Link
                to="/recruiter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Recruiter Dashboard
              </Link>
              <Link
                to="/recruiter/jobs/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-blue-700 hover:bg-blue-50"
              >
                + Post a Job
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700 hover:bg-purple-50"
            >
              Admin Center
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
