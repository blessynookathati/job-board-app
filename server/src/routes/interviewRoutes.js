import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();

// GET /api/interviews - Get interviews for current user
router.get("/", verifyAuth, async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === "candidate") {
      filter.candidateId = req.user._id;
    } else if (req.user.role === "recruiter") {
      filter.recruiterId = req.user._id;
    }

    const interviews = await dataStore.getInterviews(filter);

    // Enrich with job info
    const enriched = await Promise.all(
      interviews.map(async (intv) => {
        const job = await dataStore.getJobById(intv.jobId);
        const candidate = await dataStore.findUserById(intv.candidateId);
        return {
          ...intv,
          jobTitle: job?.title || "Position",
          company: job?.company || "Company",
          candidateName: candidate?.name || "Candidate"
        };
      })
    );

    enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, interviews: enriched });
  } catch (err) {
    next(err);
  }
});

// POST /api/interviews - Recruiter schedules interview
router.post("/", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const {
      applicationId,
      jobId,
      candidateId,
      type = "Technical",
      date,
      time,
      duration = "45 minutes",
      mode = "Online",
      meetingLink,
      interviewers,
      notes
    } = req.body;

    if (!candidateId || !date || !time) {
      return res.status(400).json({ success: false, message: "Candidate, date, and time are required." });
    }

    const newInterview = await dataStore.createInterview({
      applicationId,
      jobId,
      candidateId,
      recruiterId: req.user._id,
      type,
      date,
      time,
      duration,
      mode,
      meetingLink: meetingLink || "https://meet.google.com/job-conn-" + Math.random().toString(36).substring(2, 7),
      interviewers: Array.isArray(interviewers) ? interviewers : (interviewers ? [interviewers] : [req.user.name]),
      notes: notes || ""
    });

    // Update application status to "Interview"
    if (applicationId) {
      await dataStore.updateApplicationStatus(applicationId, "Interview", `Interview scheduled for ${date} at ${time}`);
    }

    // Send notification to candidate
    await dataStore.createNotification({
      userId: candidateId,
      title: "Interview Scheduled!",
      message: `You have an interview scheduled for ${date} at ${time} (${type} round).`,
      type: "interview_scheduled",
      link: "/candidate/interviews"
    });

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      interview: newInterview
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/interviews/:id - Reschedule or Cancel
router.patch("/:id", verifyAuth, async (req, res, next) => {
  try {
    const { date, time, status, notes } = req.body;
    const updated = await dataStore.updateInterview(req.params.id, {
      ...(date && { date }),
      ...(time && { time }),
      ...(status && { status }),
      ...(notes && { notes })
    });

    if (!updated) return res.status(404).json({ success: false, message: "Interview not found." });

    // Send notification if cancelled or rescheduled
    const targetUserId = req.user.role === "candidate" ? updated.recruiterId : updated.candidateId;
    if (targetUserId) {
      await dataStore.createNotification({
        userId: targetUserId,
        title: `Interview ${status ? status.toUpperCase() : "UPDATED"}`,
        message: `The interview for ${updated.date} has been ${status || "updated"}.`,
        type: "interview_update",
        link: req.user.role === "candidate" ? "/recruiter/interviews" : "/candidate/interviews"
      });
    }

    res.json({ success: true, message: "Interview updated.", interview: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
