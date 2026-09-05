import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import { analyzeResumeAgainstJob } from "../services/aiService.js";

const router = express.Router();

// POST /api/applications - Submit application (6-step flow result)
router.post("/", verifyAuth, async (req, res, next) => {
  try {
    const {
      jobId,
      resumeUrl,
      coverLetter,
      answers,
      personalInfo
    } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required." });
    }

    const job = await dataStore.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found." });
    }

    if (job.status === "closed") {
      return res.status(400).json({ success: false, message: "This position is now closed to new applications." });
    }

    // Calculate AI match score automatically for the application
    const matchAnalysis = analyzeResumeAgainstJob(req.user, job);

    const newApp = await dataStore.createApplication({
      jobId: String(job._id || job.id),
      jobTitle: job.title,
      company: job.company,
      companyId: job.companyId,
      recruiterId: job.recruiterId,
      candidateId: req.user._id,
      candidateName: req.user.name,
      candidateEmail: req.user.email,
      candidateHeadline: req.user.headline,
      candidateAvatar: req.user.avatar,
      candidateSkills: req.user.skills || [],
      candidateExperience: req.user.experience || [],
      resumeUrl: resumeUrl || (req.user.resumes && req.user.resumes[0]?.url) || "/uploads/resumes/default-resume.pdf",
      coverLetter: coverLetter || "",
      answers: answers || {},
      personalInfo: personalInfo || { name: req.user.name, email: req.user.email, phone: req.user.phone },
      matchScore: matchAnalysis.overallScore
    });

    // Notify Recruiter
    if (job.recruiterId) {
      await dataStore.createNotification({
        userId: job.recruiterId,
        title: "New Application Received",
        message: `${req.user.name} submitted an application for ${job.title} (${matchAnalysis.overallScore}% AI Match).`,
        type: "new_application",
        link: `/recruiter/jobs/${job._id || job.id}/applicants`
      });
    }

    // Notify Candidate confirmation
    await dataStore.createNotification({
      userId: req.user._id,
      title: "Application Submitted Successfully",
      message: `Your application for ${job.title} at ${job.company} was received. Application ID: ${newApp._id}.`,
      type: "application_submitted",
      link: "/candidate/applications"
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application: newApp
    });
  } catch (err) {
    if (err.message && err.message.includes("already applied")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// GET /api/applications/candidate - Candidate view own applications
router.get("/candidate", verifyAuth, async (req, res, next) => {
  try {
    const apps = await dataStore.getApplications({ candidateId: req.user._id });
    // Enrich with job info
    const enriched = await Promise.all(
      apps.map(async (app) => {
        const job = await dataStore.getJobById(app.jobId);
        return {
          ...app,
          jobDetails: job || { title: app.jobTitle, company: app.company }
        };
      })
    );

    // Sort newest first
    enriched.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    res.json({ success: true, applications: enriched });
  } catch (err) {
    next(err);
  }
});

// GET /api/applications/job/:jobId - Recruiter view applicants for a job
router.get("/job/:jobId", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const apps = await dataStore.getApplications({ jobId: req.params.jobId });
    res.json({ success: true, applications: apps });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/applications/:id/status - Recruiter updates application status
router.patch("/:id/status", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["Applied", "Under Review", "Shortlisted", "Interview", "Offer", "Hired", "Rejected", "Withdrawn"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status." });
    }

    const updated = await dataStore.updateApplicationStatus(req.params.id, status, note);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    // Notify candidate of status update
    await dataStore.createNotification({
      userId: updated.candidateId,
      title: `Application Update: ${status}`,
      message: `Your application status has been updated to "${status}" for ${updated.jobTitle || "the position"}.`,
      type: "application_status",
      link: "/candidate/applications"
    });

    // Audit log
    await dataStore.createAdminLog({
      userId: req.user._id,
      userName: req.user.name,
      action: "APPLICATION_STATUS_UPDATED",
      targetResource: `Application ${updated._id} -> ${status}`
    });

    res.json({
      success: true,
      message: `Candidate application status updated to ${status}.`,
      application: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/applications/:id - Candidate withdraws application
router.delete("/:id", verifyAuth, async (req, res, next) => {
  try {
    const updated = await dataStore.updateApplicationStatus(req.params.id, "Withdrawn", "Application withdrawn by candidate");
    if (!updated) return res.status(404).json({ success: false, message: "Application not found." });
    res.json({ success: true, message: "Application withdrawn successfully.", application: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
