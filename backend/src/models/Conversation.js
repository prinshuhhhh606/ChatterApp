import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // false = private 1-on-1, true = group chat
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, trim: true, default: "" },
    groupPhoto: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: {
      text: { type: String, default: "" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ isGroup: 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
