import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initChatSocket } from "./sockets/chatSocket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initChatSocket(io);

// Connect Database & Start Server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 JobConnect Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket Socket.IO active`);
    console.log(`📑 Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
};

startServer();
