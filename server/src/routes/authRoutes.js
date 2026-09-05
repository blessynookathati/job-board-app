import express from "express";
import bcrypt from "bcryptjs";
import { dataStore } from "../services/dataStore.js";
import { generateTokens, verifyAuth } from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email, and password." });
    }

    const existing = await dataStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = ["candidate", "recruiter", "admin"].includes(role) ? role : "candidate";

    const newUser = await dataStore.createUser({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      headline: userRole === "candidate" ? "Job Seeker" : "Talent Recruiter",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      skills: userRole === "candidate" ? ["JavaScript", "React"] : []
    });

    if (userRole === "recruiter" && companyName) {
      const comp = await dataStore.createCompany({
        name: companyName,
        recruiterId: newUser._id,
        about: `Leading innovator in modern business solutions.`
      });
      newUser.companyId = comp._id;
      await dataStore.updateUser(newUser._id, { companyId: comp._id });
    }

    const tokens = generateTokens(newUser);
    const { password: _, ...userSafe } = newUser;

    // Log admin action
    await dataStore.createAdminLog({
      userId: newUser._id,
      userName: newUser.name,
      action: "USER_REGISTERED",
      targetResource: `${newUser.role.toUpperCase()}: ${newUser.email}`
    });

    res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      user: userSafe,
      ...tokens
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await dataStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Direct password match (for demo seed passwords) or bcrypt compare
    let isMatch = user.password === password;
    if (!isMatch && user.password) {
      isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ success: false, message: "Your account is suspended. Contact support." });
    }

    const tokens = generateTokens(user);
    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      message: "Signed in successfully.",
      user: userSafe,
      ...tokens
    });
  } catch (err) {
    next(err);
  }
});

// 1-Click Demo Login
router.post("/demo-login", async (req, res, next) => {
  try {
    const { role = "candidate" } = req.body;
    let email = "alex@example.com";
    if (role === "recruiter") email = "sarah@techcorp.com";
    if (role === "admin") email = "admin@jobconnect.io";

    const user = await dataStore.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Demo account not found." });
    }

    const tokens = generateTokens(user);
    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      message: `Switched to ${role.toUpperCase()} demo account.`,
      user: userSafe,
      ...tokens
    });
  } catch (err) {
    next(err);
  }
});

// Get Current User Profile
router.get("/me", verifyAuth, async (req, res, next) => {
  try {
    const { password: _, ...userSafe } = req.user;
    res.json({ success: true, user: userSafe });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Signed out successfully." });
});

// Forgot Password (simulation)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: `Password reset link simulated for ${email || "user"}. You can reset your password now.`
  });
});

// Reset Password
router.post("/reset-password", async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const user = await dataStore.findUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dataStore.updateUser(user._id, { password: hashedPassword });
    res.json({ success: true, message: "Password has been successfully updated. Please sign in." });
  } catch (err) {
    next(err);
  }
});

export default router;
