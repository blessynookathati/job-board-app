import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { extractSkillsFromText } from "../services/aiService.js";

const router = express.Router();

// GET /api/profile - Fetch candidate profile
router.get("/", verifyAuth, async (req, res, next) => {
  try {
    const user = await dataStore.findUserById(req.user._id);
    const { password: _, ...profile } = user;
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile - Update candidate profile
router.put("/", verifyAuth, async (req, res, next) => {
  try {
    const {
      name,
      headline,
      about,
      location,
      phone,
      education,
      experience,
      skills,
      projects,
      social,
      preferences,
      avatar
    } = req.body;

    const updated = await dataStore.updateUser(req.user._id, {
      ...(name && { name }),
      ...(headline !== undefined && { headline }),
      ...(about !== undefined && { about }),
      ...(location !== undefined && { location }),
      ...(phone !== undefined && { phone }),
      ...(education && { education }),
      ...(experience && { experience }),
      ...(skills && { skills }),
      ...(projects && { projects }),
      ...(social && { social }),
      ...(preferences && { preferences }),
      ...(avatar && { avatar })
    });

    const { password: _, ...profile } = updated;
    res.json({ success: true, message: "Profile updated successfully.", profile });
  } catch (err) {
    next(err);
  }
});

// POST /api/profile/avatar - Upload profile photo
router.post("/avatar", verifyAuth, upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded." });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated = await dataStore.updateUser(req.user._id, { avatar: avatarUrl });
    res.json({ success: true, message: "Avatar uploaded.", avatarUrl, profile: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/profile/resume - Upload resume
router.post("/resume", verifyAuth, upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file provided." });
    }

    const user = await dataStore.findUserById(req.user._id);
    const resumes = user.resumes || [];

    // Extract potential skills from filename or text
    const extractedSkills = extractSkillsFromText(req.file.originalname);

    const newResume = {
      _id: `res_${Date.now()}`,
      name: req.file.originalname,
      url: `/uploads/resumes/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      isDefault: resumes.length === 0, // make first resume default
      extractedSkills
    };

    resumes.push(newResume);
    await dataStore.updateUser(req.user._id, { resumes });

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully.",
      resume: newResume,
      resumes
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/profile/resume/:id - Delete a resume
router.delete("/resume/:id", verifyAuth, async (req, res, next) => {
  try {
    const user = await dataStore.findUserById(req.user._id);
    const resumes = (user.resumes || []).filter((r) => r._id !== req.params.id);
    await dataStore.updateUser(req.user._id, { resumes });
    res.json({ success: true, message: "Resume removed.", resumes });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/profile/resume/:id/default - Set as default resume
router.patch("/resume/:id/default", verifyAuth, async (req, res, next) => {
  try {
    const user = await dataStore.findUserById(req.user._id);
    const resumes = (user.resumes || []).map((r) => ({
      ...r,
      isDefault: r._id === req.params.id
    }));
    await dataStore.updateUser(req.user._id, { resumes });
    res.json({ success: true, message: "Default resume updated.", resumes });
  } catch (err) {
    next(err);
  }
});

export default router;
