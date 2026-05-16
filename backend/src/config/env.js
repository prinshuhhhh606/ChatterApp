import dotenv from "dotenv";

dotenv.config();

// Central place for all environment variables
export const env = {
  port: Number(process.env.PORT) || 5000,

  clientOrigins: (
    process.env.CLIENT_ORIGINS ||
    "http://localhost:5173,https://chatter-app-fawn.vercel.app"
  ).split(","),

  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chatapp",

  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
