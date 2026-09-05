import jwt from "jsonwebtoken";
import { dataStore } from "../services/dataStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "jobconnect_super_secret_jwt_key_2026";

export const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email, name: user.name };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

export const verifyAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      // Check for custom header or demo role fallback
      const demoRole = req.headers["x-demo-role"];
      if (demoRole) {
        let demoUser;
        if (demoRole === "candidate") demoUser = await dataStore.findUserById("user_cand_1");
        else if (demoRole === "recruiter") demoUser = await dataStore.findUserById("user_rec_1");
        else if (demoRole === "admin") demoUser = await dataStore.findUserById("user_admin_1");

        if (demoUser) {
          req.user = demoUser;
          return next();
        }
      }
      return res.status(401).json({ success: false, message: "Authentication required. Please sign in." });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await dataStore.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: "User account no longer exists." });
      }

      if (user.status === "blocked") {
        return res.status(403).json({ success: false, message: "Your account has been suspended. Contact support." });
      }

      req.user = user;
      next();
    } catch (jwtErr) {
      return res.status(401).json({ success: false, message: "Invalid or expired session token." });
    }
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    const demoRole = req.headers["x-demo-role"];

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await dataStore.findUserById(decoded.id);
      } catch (e) {
        // ignore
      }
    } else if (demoRole) {
      if (demoRole === "candidate") req.user = await dataStore.findUserById("user_cand_1");
      else if (demoRole === "recruiter") req.user = await dataStore.findUserById("user_rec_1");
      else if (demoRole === "admin") req.user = await dataStore.findUserById("user_admin_1");
    }
    next();
  } catch (e) {
    next();
  }
};
