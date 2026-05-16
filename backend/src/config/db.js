import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connect to MongoDB using Mongoose.
 * Call once at server startup before handling requests.
 */
export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected:", env.mongoUri);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
