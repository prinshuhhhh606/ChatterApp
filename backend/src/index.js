import http from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { registerSocketHandlers } from "./socket/socketHandlers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

// Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: env.clientOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Express CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://chatter-app-fawn.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Serve uploaded profile photos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// REST API routes
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "chatapp-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", chatRoutes);

// Socket handlers
registerSocketHandlers(io);

// Start after MongoDB is ready
connectDB().then(() => {
  server.listen(env.port, () => {
    console.log(`Server: http://localhost:${env.port}`);
    console.log("CORS:", env.clientOrigins);
  });
});
