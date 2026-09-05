import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth, optionalAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();

// GET /api/companies - List all companies
router.get("/", async (req, res, next) => {
  try {
    const companies = await dataStore.getCompanies();
    res.json({ success: true, companies });
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id - Company details with open jobs and reviews
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const company = await dataStore.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    const { jobs } = await dataStore.getJobs({ limit: 50 });
    const openJobs = jobs.filter((j) => j.companyId === company._id || j.company.toLowerCase() === company.name.toLowerCase());
    const reviews = await dataStore.getReviews(company._id);

    res.json({
      success: true,
      company,
      openJobs,
      reviews
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/companies/:id - Recruiter update company profile
router.put("/:id", verifyAuth, requireRole("recruiter", "admin"), async (req, res, next) => {
  try {
    const updated = await dataStore.updateCompany(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Company not found." });
    res.json({ success: true, message: "Company profile updated.", company: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/companies/:id/reviews - Submit review
router.post("/:id/reviews", verifyAuth, async (req, res, next) => {
  try {
    const { rating, culture, management, salary, balance, reviewText } = req.body;

    const newReview = await dataStore.createReview({
      companyId: req.params.id,
      authorId: req.user._id,
      authorName: req.user.name,
      rating: Number(rating) || 5,
      culture: Number(culture) || 5,
      management: Number(management) || 5,
      salary: Number(salary) || 5,
      balance: Number(balance) || 5,
      reviewText: reviewText || "Great company to work with!"
    });

    res.status(201).json({ success: true, message: "Review posted successfully.", review: newReview });
  } catch (err) {
    next(err);
  }
});

export default router;
