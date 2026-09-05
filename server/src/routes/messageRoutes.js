import express from "express";
import { dataStore } from "../services/dataStore.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/messages/:otherUserId - Get message history
router.get("/:otherUserId", verifyAuth, async (req, res, next) => {
  try {
    const messages = await dataStore.getMessages(req.user._id, req.params.otherUserId);
    const otherUser = await dataStore.findUserById(req.params.otherUserId);

    res.json({
      success: true,
      otherUser: otherUser ? { _id: otherUser._id, name: otherUser.name, avatar: otherUser.avatar, headline: otherUser.headline } : null,
      messages
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/messages - Send a message
router.post("/", verifyAuth, async (req, res, next) => {
  try {
    const { receiverId, content, attachment } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: "Receiver and message content are required." });
    }

    const newMsg = await dataStore.createMessage({
      senderId: req.user._id,
      receiverId,
      conversationId: [req.user._id, receiverId].sort().join("_"),
      content,
      attachment: attachment || null
    });

    // Notify receiver
    await dataStore.createNotification({
      userId: receiverId,
      title: `New message from ${req.user.name}`,
      message: content.length > 50 ? content.substring(0, 47) + "..." : content,
      type: "chat_message",
      link: `/candidate/messages`
    });

    res.status(201).json({ success: true, message: newMsg });
  } catch (err) {
    next(err);
  }
});

export default router;
