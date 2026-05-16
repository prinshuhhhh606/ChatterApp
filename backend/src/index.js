import http from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { registerSocketHandlers } from "./socket/socketHandlers.js";

const app = express();
const server = http.createServer(app);

// Socket.IO server with CORS for React frontend
const io = new Server(server, {
  cors: {
    origin: env.clientOrigin,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: env.clientOrigin }));
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

registerSocketHandlers(io);

// Start after MongoDB is ready
connectDB().then(() => {
  server.listen(env.port, () => {
    console.log(`Server: http://localhost:${env.port}`);
    console.log(`CORS: ${env.clientOrigin}`);
  });
});
