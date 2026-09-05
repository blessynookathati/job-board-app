import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth, optionalAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();

// GET /api/jobs - List jobs with search, filtering, and pagination
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const {
      search,
      type,
      workMode,
      employmentType,
      salary,
      minSalary,
      maxSalary,
      skills,
      experience,
      sort,
      page = 1,
      limit = 20,
      status = "published"
    } = req.query;

    let skillList = [];
    if (skills) {
      skillList = Array.isArray(skills) ? skills : String(skills).split(",").map((s) => s.trim()).filter(Boolean);
    }

    const effectiveMaxSalary = maxSalary || salary; // support legacy slider 'salary'

    const result = await dataStore.getJobs({
      search,
      type,
      workMode,
      employmentType,
      minSalary,
      maxSalary: effectiveMaxSalary,
      skills: skillList,
      experience,
      sort,
      page,
      limit,
      status
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/saved/list - Get current candidate's saved jobs
router.get("/saved/list", verifyAuth, async (req, res, next) => {
  try {
    const user = await dataStore.findUserById(req.user._id);
    const savedIds = user.savedJobs || [];

    const { jobs: allJobs } = await dataStore.getJobs({ limit: 200, status: "all" });
    const savedJobs = allJobs.filter((j) => savedIds.includes(String(j._id)) || savedIds.includes(String(j.id)));

    res.json({ success: true, jobs: savedJobs, savedIds });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id - Single job details
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const job = await dataStore.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found." });
    }

    // Increment view count
    job.views = (job.views || 0) + 1;

    let company = null;
    if (job.companyId) {
      company = await dataStore.getCompanyById(job.companyId);
    }

    let isSaved = false;
    if (req.user && req.user.savedJobs) {
      isSaved = req.user.savedJobs.includes(String(job._id)) || req.user.savedJobs.includes(String(job.id));
    }

    res.json({
      success: true,
      job: {
        ...job,
        companyInfo: company,
        isSaved
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs - Recruiter creates job
router.post("/", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const {
      title,
      description,
      responsibilities,
      requirements,
      skills,
      salary,
      experience,
      location,
      workMode,
      employmentType,
      openings,
      deadline,
      status = "published"
    } = req.body;

    if (!title || !description || !salary) {
      return res.status(400).json({ success: false, message: "Title, description, and salary are required." });
    }

    const recruiterCompany = req.user.companyId
      ? await dataStore.getCompanyById(req.user.companyId)
      : null;

    const newJob = await dataStore.createJob({
      title,
      company: recruiterCompany?.name || req.user.name || "Hiring Company",
      companyId: req.user.companyId || "comp_1",
      recruiterId: req.user._id,
      location: location || "Remote",
      type: workMode || "Remote",
      workMode: workMode || "Remote",
      employmentType: employmentType || "Full-time",
      experience: experience || "1-3 years",
      salary: Number(salary) || 75000,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map((s) => s.trim()) : ["React", "JavaScript"]),
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? responsibilities.split("\n").filter(Boolean) : []),
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split("\n").filter(Boolean) : []),
      openings: Number(openings) || 1,
      deadline: deadline || "2026-12-31",
      status
    });

    await dataStore.createAdminLog({
      userId: req.user._id,
      userName: req.user.name,
      action: "JOB_POSTED",
      targetResource: `Job: ${newJob.title} (${newJob._id})`
    });

    res.status(201).json({ success: true, message: "Job created successfully.", job: newJob });
  } catch (err) {
    next(err);
  }
});

// PUT /api/jobs/:id - Recruiter updates job
router.put("/:id", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const job = await dataStore.getJobById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    if (req.user.role !== "admin" && job.recruiterId && job.recruiterId !== req.user._id) {
      return res.status(403).json({ success: false, message: "You can only edit your own job postings." });
    }

    const updated = await dataStore.updateJob(req.params.id, req.body);
    res.json({ success: true, message: "Job updated successfully.", job: updated });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/jobs/:id/status - Update job status (published, draft, paused, closed)
router.patch("/:id/status", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["published", "draft", "paused", "closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const updated = await dataStore.updateJob(req.params.id, { status });
    if (!updated) return res.status(404).json({ success: false, message: "Job not found." });

    res.json({ success: true, message: `Job status changed to ${status}.`, job: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:id - Delete job
router.delete("/:id", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const success = await dataStore.deleteJob(req.params.id);
    if (!success) return res.status(404).json({ success: false, message: "Job not found." });
    res.json({ success: true, message: "Job posting deleted successfully." });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/save - Toggle bookmark
router.post("/:id/save", verifyAuth, async (req, res, next) => {
  try {
    const result = await dataStore.toggleSaveJob(req.user._id, req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "User not found." });

    res.json({
      success: true,
      isSaved: result.isSaved,
      message: result.isSaved ? "Job saved to bookmarks." : "Job removed from bookmarks.",
      savedJobs: result.savedJobs
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/report - Report job
router.post("/:id/report", verifyAuth, async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    const report = await dataStore.createReport({
      jobId: req.params.id,
      reporterId: req.user._id,
      reporterName: req.user.name,
      reason: reason || "Other",
      details: details || "Reported by candidate"
    });

    res.status(201).json({
      success: true,
      message: "Thank you for reporting. Our moderation team will review this listing shortly.",
      report
    });
  } catch (err) {
    next(err);
  }
});

export default router;
