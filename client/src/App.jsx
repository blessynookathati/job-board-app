import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import DemoRoleSwitcher from "./components/DemoRoleSwitcher";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import Bookmarks from "./pages/Bookmarks";
import Companies from "./pages/Companies";
import CompanyDetails from "./pages/CompanyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Candidate Pages
import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateProfile from "./pages/CandidateProfile";
import ResumeManager from "./pages/ResumeManager";
import CandidateInterviews from "./pages/CandidateInterviews";
import AIRecommendations from "./pages/AIRecommendations";
import MessagesPage from "./pages/MessagesPage";

// Recruiter Pages
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/RecruiterJobs";
import PostJob from "./pages/PostJob";
import ApplicantManager from "./pages/ApplicantManager";
import RecruiterCompany from "./pages/RecruiterCompany";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          {/* 1-Click Role Switcher Toolbar */}
          <DemoRoleSwitcher />

          {/* Dynamic Navigation Bar */}
          <Navbar />

          <main className="min-h-[calc(100vh-100px)]">
            <Routes>
              {/* Public & Discovery */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Home />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/tracker" element={<Bookmarks />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Candidate Hub */}
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/candidate/applications" element={<CandidateDashboard />} />
              <Route path="/candidate/profile" element={<CandidateProfile />} />
              <Route path="/candidate/resume" element={<ResumeManager />} />
              <Route path="/candidate/saved-jobs" element={<Bookmarks />} />
              <Route path="/candidate/interviews" element={<CandidateInterviews />} />
              <Route path="/candidate/recommendations" element={<AIRecommendations />} />
              <Route path="/candidate/messages" element={<MessagesPage />} />

              {/* Recruiter Hub */}
              <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
              <Route path="/recruiter/jobs/create" element={<PostJob />} />
              <Route path="/recruiter/jobs/:id/applicants" element={<ApplicantManager />} />
              <Route path="/recruiter/company" element={<RecruiterCompany />} />
              <Route path="/recruiter/interviews" element={<CandidateInterviews />} />
              <Route path="/recruiter/messages" element={<MessagesPage />} />

              {/* Admin Hub */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/reports" element={<AdminDashboard />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
