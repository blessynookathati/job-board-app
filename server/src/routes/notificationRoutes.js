import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/notifications - List user's notifications
router.get("/", verifyAuth, async (req, res, next) => {
  try {
    const list = await dataStore.getNotifications(req.user._id);
    const unreadCount = list.filter((n) => !n.read).length;
    res.json({ success: true, notifications: list, unreadCount });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read - Mark one as read
router.patch("/:id/read", verifyAuth, async (req, res, next) => {
  try {
    const notif = await dataStore.markNotificationAsRead(req.params.id, req.user._id);
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found." });
    res.json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch("/read-all", verifyAuth, async (req, res, next) => {
  try {
    await dataStore.markAllNotificationsAsRead(req.user._id);
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", verifyAuth, async (req, res, next) => {
  try {
    const success = await dataStore.deleteNotification(req.params.id);
    if (!success) return res.status(404).json({ success: false, message: "Notification not found." });
    res.json({ success: true, message: "Notification deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
