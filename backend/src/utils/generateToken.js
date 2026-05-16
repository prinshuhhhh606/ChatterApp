import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Create a signed JWT for the authenticated user.
 */
export function generateToken(userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}
