import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

/**
 * Socket.IO middleware — same JWT as REST API.
 * Client sends: io({ auth: { token: '...' } })
 */
export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}
