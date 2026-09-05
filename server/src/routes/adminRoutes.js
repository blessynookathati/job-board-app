import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();

// Protect all admin routes
router.use(verifyAuth, requireRole("admin"));

// GET /api/admin/stats - Global platform statistics
router.get("/stats", async (req, res, next) => {
  try {
    const allUsers = await dataStore.getAllUsers();
    const { jobs: allJobs } = await dataStore.getJobs({ limit: 1000, status: "all" });
    const allApps = await dataStore.getApplications();
    const allCompanies = await dataStore.getCompanies();
    const allReports = await dataStore.getReports();

    const candidatesCount = allUsers.filter((u) => u.role === "candidate").length;
    const recruitersCount = allUsers.filter((u) => u.role === "recruiter").length;
    const pendingReportsCount = allReports.filter((r) => r.status === "pending").length;

    res.json({
      success: true,
      stats: {
        totalUsers: allUsers.length,
        candidatesCount,
        recruitersCount,
        totalJobs: allJobs.length,
        activeJobs: allJobs.filter((j) => j.status === "published").length,
        totalApplications: allApps.length,
        totalCompanies: allCompanies.length,
        pendingReports: pendingReportsCount,
        hiredCandidates: allApps.filter((a) => a.status === "Hired").length
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users - List all users
router.get("/users", async (req, res, next) => {
  try {
    const users = await dataStore.getAllUsers();
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json({ success: true, users: safeUsers });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/status - Block/Unblock or verify user
router.patch("/users/:id/status", async (req, res, next) => {
  try {
    const { status, isVerified } = req.body;
    const updated = await dataStore.updateUser(req.params.id, {
      ...(status && { status }),
      ...(isVerified !== undefined && { isVerified })
    });

    if (!updated) return res.status(404).json({ success: false, message: "User not found." });

    await dataStore.createAdminLog({
      userId: req.user._id,
      userName: req.user.name,
      action: "USER_MODERATION",
      targetResource: `${updated.name} (${updated.email}) -> status: ${updated.status}`
    });

    const { password, ...safe } = updated;
    res.json({ success: true, message: "User status updated.", user: safe });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/reports - List job reports
router.get("/reports", async (req, res, next) => {
  try {
    const reports = await dataStore.getReports();
    // Enrich with job info
    const enriched = await Promise.all(
      reports.map(async (rep) => {
        const job = await dataStore.getJobById(rep.jobId);
        return {
          ...rep,
          jobTitle: job?.title || "Deleted or Missing Job",
          company: job?.company || "Unknown Company"
        };
      })
    );

    res.json({ success: true, reports: enriched });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/reports/:id - Review / Take action on report
router.patch("/reports/:id", async (req, res, next) => {
  try {
    const { status, action } = req.body; // action: 'dismiss', 'remove_job'
    const report = await dataStore.updateReport(req.params.id, status || "reviewed");

    if (action === "remove_job" && report?.jobId) {
      await dataStore.deleteJob(report.jobId);
    }

    await dataStore.createAdminLog({
      userId: req.user._id,
      userName: req.user.name,
      action: "REPORT_ACTION_TAKEN",
      targetResource: `Report ${req.params.id} -> ${action || status}`
    });

    res.json({ success: true, message: "Report processed successfully.", report });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/logs - System audit logs
router.get("/logs", async (req, res, next) => {
  try {
    const logs = await dataStore.getAdminLogs();
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

export default router;
