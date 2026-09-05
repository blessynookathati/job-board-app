import {
  initialUsers,
  initialCompanies,
  initialJobs,
  initialApplications,
  initialInterviews,
  initialNotifications,
  initialMessages,
  initialReviews,
  initialReports,
  initialAdminLogs
} from "../utils/seedData.js";

// In-Memory Fallback State (deep cloned)
let users = JSON.parse(JSON.stringify(initialUsers));
let companies = JSON.parse(JSON.stringify(initialCompanies));
let jobs = JSON.parse(JSON.stringify(initialJobs));
let applications = JSON.parse(JSON.stringify(initialApplications));
let interviews = JSON.parse(JSON.stringify(initialInterviews));
let notifications = JSON.parse(JSON.stringify(initialNotifications));
let messages = JSON.parse(JSON.stringify(initialMessages));
let reviews = JSON.parse(JSON.stringify(initialReviews));
let reports = JSON.parse(JSON.stringify(initialReports));
let adminLogs = JSON.parse(JSON.stringify(initialAdminLogs));

let isMongoConnected = false;

export const setMongoConnected = (status) => {
  isMongoConnected = status;
};

export const getStoreStatus = () => ({
  isMongoConnected,
  entityCounts: {
    users: users.length,
    companies: companies.length,
    jobs: jobs.length,
    applications: applications.length,
    interviews: interviews.length,
    notifications: notifications.length,
    messages: messages.length,
    reviews: reviews.length,
    reports: reports.length,
    adminLogs: adminLogs.length
  }
});

// Users & Auth
export const dataStore = {
  // --- USERS ---
  findUserByEmail: async (email) => {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  findUserById: async (id) => {
    return users.find((u) => u._id === id || u.id === id) || null;
  },
  createUser: async (userData) => {
    const newUser = {
      _id: `user_${Date.now()}`,
      ...userData,
      status: userData.status || "active",
      isVerified: userData.isVerified ?? false,
      savedJobs: userData.savedJobs || [],
      resumes: userData.resumes || [],
      education: userData.education || [],
      experience: userData.experience || [],
      skills: userData.skills || [],
      projects: userData.projects || [],
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },
  updateUser: async (id, updateData) => {
    const idx = users.findIndex((u) => u._id === id || u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updateData };
    return users[idx];
  },
  getAllUsers: async () => users,

  // --- SAVED JOBS ---
  toggleSaveJob: async (userId, jobId) => {
    const user = users.find((u) => u._id === userId || u.id === userId);
    if (!user) return null;
    if (!user.savedJobs) user.savedJobs = [];
    const jobKey = String(jobId);
    let isSaved = false;
    if (user.savedJobs.includes(jobKey)) {
      user.savedJobs = user.savedJobs.filter((id) => id !== jobKey);
      isSaved = false;
    } else {
      user.savedJobs.push(jobKey);
      isSaved = true;
    }
    return { savedJobs: user.savedJobs, isSaved };
  },

  // --- JOBS ---
  getJobs: async ({ search, type, workMode, employmentType, minSalary, maxSalary, skills, experience, sort, page = 1, limit = 20, status = "published" }) => {
    let result = [...jobs];

    // Filter by status if requested
    if (status && status !== "all") {
      result = result.filter((j) => (j.status || "published") === status);
    }

    // Search (title, company, skills, description)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          (j.skills && j.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    // Type / WorkMode
    if (type) {
      result = result.filter((j) => (j.type || j.workMode || "").toLowerCase() === type.toLowerCase());
    }
    if (workMode) {
      result = result.filter((j) => (j.workMode || j.type || "").toLowerCase() === workMode.toLowerCase());
    }

    // Employment Type
    if (employmentType) {
      result = result.filter((j) => (j.employmentType || "").toLowerCase() === employmentType.toLowerCase());
    }

    // Salary Slider
    if (maxSalary) {
      result = result.filter((j) => Number(j.salary) <= Number(maxSalary));
    }
    if (minSalary) {
      result = result.filter((j) => Number(j.salary) >= Number(minSalary));
    }

    // Multi-skill filter
    if (skills && skills.length > 0) {
      const skillArr = Array.isArray(skills) ? skills : [skills];
      result = result.filter((j) =>
        skillArr.every((reqSkill) =>
          (j.skills || []).some((s) => s.toLowerCase() === reqSkill.toLowerCase())
        )
      );
    }

    // Experience filter
    if (experience) {
      result = result.filter((j) => (j.experience || "").toLowerCase().includes(experience.toLowerCase()));
    }

    // Sorting
    if (sort === "salary_desc" || sort === "salary-desc" || sort === "high-to-low" || sort === true) {
      result.sort((a, b) => b.salary - a.salary);
    } else if (sort === "salary_asc" || sort === "salary-asc" || sort === "low-to-high") {
      result.sort((a, b) => a.salary - b.salary);
    } else if (sort === "oldest") {
      result.sort((a, b) => new Date(a.postedDate || 0) - new Date(b.postedDate || 0));
    } else if (sort === "most_applied") {
      result.sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0));
    } else {
      // Default: newest
      result.sort((a, b) => new Date(b.postedDate || 0) - new Date(a.postedDate || 0));
    }

    const total = result.length;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = result.slice(startIndex, startIndex + limitNum);

    return {
      jobs: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  },

  getJobById: async (id) => {
    return jobs.find((j) => j._id === id || String(j.id) === String(id)) || null;
  },

  createJob: async (jobData) => {
    const newIdNum = jobs.length + 1;
    const newJob = {
      _id: `job_${Date.now()}`,
      id: newIdNum,
      ...jobData,
      status: jobData.status || "published",
      postedDate: new Date().toISOString().split("T")[0],
      applicationsCount: 0,
      views: 0
    };
    jobs.unshift(newJob);
    return newJob;
  },

  updateJob: async (id, updateData) => {
    const idx = jobs.findIndex((j) => j._id === id || String(j.id) === String(id));
    if (idx === -1) return null;
    jobs[idx] = { ...jobs[idx], ...updateData };
    return jobs[idx];
  },

  deleteJob: async (id) => {
    const idx = jobs.findIndex((j) => j._id === id || String(j.id) === String(id));
    if (idx === -1) return false;
    jobs.splice(idx, 1);
    return true;
  },

  // --- APPLICATIONS ---
  getApplications: async (filter = {}) => {
    let result = [...applications];
    if (filter.candidateId) {
      result = result.filter((a) => a.candidateId === filter.candidateId);
    }
    if (filter.recruiterId) {
      result = result.filter((a) => a.recruiterId === filter.recruiterId);
    }
    if (filter.jobId) {
      result = result.filter((a) => a.jobId === filter.jobId || String(a.jobId) === String(filter.jobId));
    }
    if (filter.status) {
      result = result.filter((a) => a.status.toLowerCase() === filter.status.toLowerCase());
    }
    return result;
  },

  getApplicationById: async (id) => {
    return applications.find((a) => a._id === id) || null;
  },

  createApplication: async (appData) => {
    // Check duplicate
    const existing = applications.find(
      (a) =>
        (a.candidateId === appData.candidateId) &&
        (a.jobId === appData.jobId || String(a.jobId) === String(appData.jobId))
    );
    if (existing) {
      throw new Error("You have already applied for this position.");
    }

    const newApp = {
      _id: `app_${Date.now()}`,
      ...appData,
      status: "Applied",
      appliedDate: new Date().toISOString(),
      timeline: [
        {
          status: "Applied",
          date: new Date().toISOString(),
          note: "Application submitted successfully"
        }
      ]
    };
    applications.push(newApp);

    // Increment job applications count
    const job = jobs.find((j) => j._id === appData.jobId || String(j.id) === String(appData.jobId));
    if (job) {
      job.applicationsCount = (job.applicationsCount || 0) + 1;
    }

    return newApp;
  },

  updateApplicationStatus: async (id, status, note = "") => {
    const app = applications.find((a) => a._id === id);
    if (!app) return null;
    app.status = status;
    if (!app.timeline) app.timeline = [];
    app.timeline.push({
      status,
      date: new Date().toISOString(),
      note: note || `Status updated to ${status}`
    });
    return app;
  },

  // --- INTERVIEWS ---
  getInterviews: async (filter = {}) => {
    let result = [...interviews];
    if (filter.candidateId) {
      result = result.filter((i) => i.candidateId === filter.candidateId);
    }
    if (filter.recruiterId) {
      result = result.filter((i) => i.recruiterId === filter.recruiterId);
    }
    if (filter.jobId) {
      result = result.filter((i) => i.jobId === filter.jobId);
    }
    return result;
  },

  createInterview: async (intData) => {
    const newInt = {
      _id: `int_${Date.now()}`,
      ...intData,
      status: "scheduled",
      createdAt: new Date().toISOString()
    };
    interviews.push(newInt);
    return newInt;
  },

  updateInterview: async (id, updateData) => {
    const idx = interviews.findIndex((i) => i._id === id);
    if (idx === -1) return null;
    interviews[idx] = { ...interviews[idx], ...updateData };
    return interviews[idx];
  },

  // --- NOTIFICATIONS ---
  getNotifications: async (userId) => {
    return notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createNotification: async (notifData) => {
    const newNotif = {
      _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...notifData,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    return newNotif;
  },

  markNotificationAsRead: async (id, userId) => {
    const notif = notifications.find((n) => n._id === id && (!userId || n.userId === userId));
    if (notif) notif.read = true;
    return notif;
  },

  markAllNotificationsAsRead: async (userId) => {
    notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    return true;
  },

  deleteNotification: async (id) => {
    const idx = notifications.findIndex((n) => n._id === id);
    if (idx !== -1) {
      notifications.splice(idx, 1);
      return true;
    }
    return false;
  },

  // --- MESSAGES ---
  getMessages: async (user1Id, user2Id) => {
    return messages.filter(
      (m) =>
        (m.senderId === user1Id && m.receiverId === user2Id) ||
        (m.senderId === user2Id && m.receiverId === user1Id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  createMessage: async (msgData) => {
    const newMsg = {
      _id: `msg_${Date.now()}`,
      ...msgData,
      timestamp: new Date().toISOString(),
      read: false
    };
    messages.push(newMsg);
    return newMsg;
  },

  // --- COMPANIES & REVIEWS ---
  getCompanies: async () => companies,
  getCompanyById: async (id) => companies.find((c) => c._id === id) || null,
  createCompany: async (compData) => {
    const newComp = {
      _id: `comp_${Date.now()}`,
      ...compData,
      verified: false,
      ratings: { overall: 5.0, count: 0 }
    };
    companies.push(newComp);
    return newComp;
  },
  updateCompany: async (id, data) => {
    const idx = companies.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    companies[idx] = { ...companies[idx], ...data };
    return companies[idx];
  },
  getReviews: async (companyId) => {
    return reviews.filter((r) => r.companyId === companyId && r.status === "approved");
  },
  createReview: async (reviewData) => {
    const newRev = {
      _id: `rev_${Date.now()}`,
      ...reviewData,
      status: "approved",
      createdAt: new Date().toISOString()
    };
    reviews.push(newRev);
    return newRev;
  },

  // --- REPORTS ---
  getReports: async () => reports,
  createReport: async (repData) => {
    const newRep = {
      _id: `rep_${Date.now()}`,
      ...repData,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    reports.push(newRep);
    return newRep;
  },
  updateReport: async (id, status) => {
    const rep = reports.find((r) => r._id === id);
    if (rep) rep.status = status;
    return rep;
  },

  // --- ADMIN LOGS ---
  getAdminLogs: async () => adminLogs,
  createAdminLog: async (logData) => {
    const newLog = {
      _id: `log_${Date.now()}`,
      ...logData,
      timestamp: new Date().toISOString()
    };
    adminLogs.unshift(newLog);
    return newLog;
  }
};
