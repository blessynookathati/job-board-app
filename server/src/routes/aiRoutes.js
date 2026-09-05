import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth, optionalAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import {
  analyzeResumeAgainstJob,
  getRecommendedJobsForCandidate,
  rankApplicantsForJob,
  analyzeSkillGap
} from "../services/aiService.js";

const router = express.Router();

// POST /api/ai/resume-analyzer - Compare candidate resume / profile against a specific job
router.post("/resume-analyzer", optionalAuth, async (req, res, next) => {
  try {
    const { jobId, candidateProfile } = req.body;
    let candidate = req.user;

    if (candidateProfile) {
      candidate = { ...candidate, ...candidateProfile };
    }

    if (!candidate) {
      candidate = await dataStore.findUserById("user_cand_1"); // fallback to demo candidate
    }

    const job = await dataStore.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found." });
    }

    const analysis = analyzeResumeAgainstJob(candidate, job);
    res.json({
      success: true,
      job: { id: job._id || job.id, title: job.title, company: job.company },
      candidateName: candidate.name,
      ...analysis
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/job-recommendations - Recommend jobs based on candidate profile
router.get("/job-recommendations", verifyAuth, async (req, res, next) => {
  try {
    const recommendations = await getRecommendedJobsForCandidate(req.user._id);
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/candidate-ranking/:jobId - Recruiter AI Candidate Ranking
router.get("/candidate-ranking/:jobId", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const ranking = await rankApplicantsForJob(req.params.jobId);
    res.json({
      success: true,
      jobId: req.params.jobId,
      totalApplicants: ranking.length,
      ranking
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/skill-gap - Analyze candidate skill gap against target role or job
router.post("/skill-gap", optionalAuth, async (req, res, next) => {
  try {
    const { targetRole, jobId } = req.body;
    let candidate = req.user || (await dataStore.findUserById("user_cand_1"));

    let target = targetRole || "Full Stack Developer";
    if (jobId) {
      const job = await dataStore.getJobById(jobId);
      if (job) target = job;
    }

    const gapResult = analyzeSkillGap(candidate, target);
    res.json({
      success: true,
      ...gapResult
    });
  } catch (err) {
    next(err);
  }
});

export default router;
