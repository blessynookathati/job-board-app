const BASE_URL = "/api";

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("jobconnect_token");
  const demoRole = localStorage.getItem("jobconnect_demo_role");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(demoRole && { "x-demo-role": demoRole }),
    ...options.headers
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  demoLogin: (role) => request("/auth/demo-login", { method: "POST", body: JSON.stringify({ role }) }),
  getMe: () => request("/auth/me"),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) }),

  // Jobs
  getJobs: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        if (Array.isArray(val)) searchParams.append(key, val.join(","));
        else searchParams.append(key, val);
      }
    });
    return request(`/jobs?${searchParams.toString()}`);
  },
  getJobById: (id) => request(`/jobs/${id}`),
  createJob: (data) => request("/jobs", { method: "POST", body: JSON.stringify(data) }),
  updateJob: (id, data) => request(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateJobStatus: (id, status) => request(`/jobs/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: "DELETE" }),
  toggleSaveJob: (id) => request(`/jobs/${id}/save`, { method: "POST" }),
  getSavedJobs: () => request("/jobs/saved/list"),
  reportJob: (id, reportData) => request(`/jobs/${id}/report`, { method: "POST", body: JSON.stringify(reportData) }),

  // Applications
  submitApplication: (data) => request("/applications", { method: "POST", body: JSON.stringify(data) }),
  getCandidateApplications: () => request("/applications/candidate"),
  getJobApplicants: (jobId) => request(`/applications/job/${jobId}`),
  updateApplicationStatus: (id, status, note) => request(`/applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }),
  withdrawApplication: (id) => request(`/applications/${id}`, { method: "DELETE" }),

  // Profile & Resumes
  getProfile: () => request("/profile"),
  updateProfile: (data) => request("/profile", { method: "PUT", body: JSON.stringify(data) }),
  uploadResume: (formData) => request("/profile/resume", { method: "POST", body: formData }),
  deleteResume: (id) => request(`/profile/resume/${id}`, { method: "DELETE" }),
  setDefaultResume: (id) => request(`/profile/resume/${id}/default`, { method: "PATCH" }),

  // Interviews
  getInterviews: () => request("/interviews"),
  scheduleInterview: (data) => request("/interviews", { method: "POST", body: JSON.stringify(data) }),
  updateInterview: (id, data) => request(`/interviews/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Companies & Reviews
  getCompanies: () => request("/companies"),
  getCompanyById: (id) => request(`/companies/${id}`),
  updateCompany: (id, data) => request(`/companies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  submitCompanyReview: (id, data) => request(`/companies/${id}/reviews`, { method: "POST", body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => request("/notifications"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "PATCH" }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: "DELETE" }),

  // Messages
  getMessages: (otherUserId) => request(`/messages/${otherUserId}`),
  sendMessage: (data) => request("/messages", { method: "POST", body: JSON.stringify(data) }),

  // Admin
  getAdminStats: () => request("/admin/stats"),
  getAdminUsers: () => request("/admin/users"),
  updateUserStatus: (id, data) => request(`/admin/users/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  getAdminReports: () => request("/admin/reports"),
  reviewReport: (id, data) => request(`/admin/reports/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  getAdminLogs: () => request("/admin/logs"),

  // AI & NLP
  analyzeResume: (jobId, candidateProfile) => request("/ai/resume-analyzer", { method: "POST", body: JSON.stringify({ jobId, candidateProfile }) }),
  getJobRecommendations: () => request("/ai/job-recommendations"),
  getCandidateRanking: (jobId) => request(`/ai/candidate-ranking/${jobId}`),
  analyzeSkillGap: (targetRole, jobId) => request("/ai/skill-gap", { method: "POST", body: JSON.stringify({ targetRole, jobId }) })
};
