import { dataStore } from "../services/dataStore.js";

export const initChatSocket = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on("connection", (socket) => {
    // User registers online status
    socket.on("register_user", (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        io.emit("user_status_change", { userId, isOnline: true });
      }
    });

    // Join 1-to-1 conversation room
    socket.on("join_conversation", ({ user1Id, user2Id }) => {
      const room = [user1Id, user2Id].sort().join("_");
      socket.join(room);
    });

    // Send chat message
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, content, attachment } = data;
      const room = [senderId, receiverId].sort().join("_");

      const newMsg = await dataStore.createMessage({
        senderId,
        receiverId,
        conversationId: room,
        content,
        attachment
      });

      // Emit to room
      io.to(room).emit("receive_message", newMsg);

      // If receiver is online but not in room, emit notification
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_notification", {
          title: "New Chat Message",
          message: content.length > 40 ? content.substring(0, 37) + "..." : content,
          type: "chat_message",
          link: `/candidate/messages`
        });
      }
    });

    // Typing indicators
    socket.on("typing_start", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");
      socket.to(room).emit("user_typing", { senderId, isTyping: true });
    });

    socket.on("typing_stop", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");
      socket.to(room).emit("user_typing", { senderId, isTyping: false });
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("user_status_change", { userId: socket.userId, isOnline: false });
      }
    });
  });
};
