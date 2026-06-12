import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { formatUser } from "../utils/formatUser.js";
import { socketAuth } from "./socketAuth.js";

// userId -> number of connected tabs
const onlineUsers = new Map();

function addOnline(userId) {
  const key = userId.toString();

  onlineUsers.set(key, (onlineUsers.get(key) || 0) + 1);
}

function removeOnline(userId) {
  const key = userId.toString();

  const count = (onlineUsers.get(key) || 1) - 1;

  if (count <= 0) {
    onlineUsers.delete(key);
  } else {
    onlineUsers.set(key, count);
  }
}

function isUserOnline(userId) {
  return onlineUsers.has(userId.toString());
}

/**
 * Register all socket handlers
 */
export function registerSocketHandlers(io) {
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    try {
      const userId = socket.user._id.toString();

      console.log(
        `✅ Socket connected: ${socket.user.username} (${socket.id})`,
      );

      /**
       * PERSONAL ROOM
       */
      socket.join(`user:${userId}`);

      addOnline(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      /**
       * BROADCAST STATUS
       */
      io.emit("user_status", {
        userId,
        isOnline: true,
        lastSeen: new Date(),
      });

      /**
       * SEND ONLINE USERS
       */
      socket.emit("online_users", Array.from(onlineUsers.keys()));

      /**
       * JOIN CONVERSATION
       */
      socket.on("join_conversation", async ({ conversationId }) => {
        try {
          if (!conversationId) return;

          console.log("📥 JOIN REQUEST:", socket.user.username, conversationId);

          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: socket.user._id,
          });

          console.log("FOUND CONVERSATION:", conversation ? "YES" : "NO");

          if (!conversation) {
            console.log("❌ Conversation not found");
            return;
          }

          socket.join(`conversation:${conversationId}`);

          console.log(
            `✅ ${socket.user.username} joined room conversation:${conversationId}`,
          );
        } catch (error) {
          console.log("join_conversation error:", error.message);
        }
      });

      /**
       * SEND MESSAGE
       */
      socket.on("send_message", async ({ conversationId, text }, callback) => {
        try {
          console.log("========== SEND MESSAGE ==========");

          console.log("USER:", socket.user.username);

          console.log("USER ID:", socket.user._id.toString());

          console.log("CONVERSATION ID:", conversationId);

          console.log("TEXT:", text);

          const trimmed = String(text || "").trim();

          if (!trimmed) {
            return callback?.({
              error: "Empty message",
            });
          }

          /**
           * FIND CONVERSATION
           */
          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: socket.user._id,
          });

          console.log("FOUND CONVERSATION:", conversation);

          if (!conversation) {
            console.log("❌ Conversation not found for this user");

            return callback?.({
              error: "Conversation not found",
            });
          }

          /**
           * CREATE MESSAGE
           */
          const message = await Message.create({
            conversationId,
            sender: socket.user._id,
            text: trimmed,
          });

          await message.populate(
            "sender",
            "username avatar avatarColor profilePhoto",
          );

          /**
           * UPDATE CONVERSATION
           */
          conversation.lastMessage = {
            text: trimmed,
            sender: socket.user._id,
            createdAt: message.createdAt,
          };

          conversation.updatedAt = new Date();

          await conversation.save();

          /**
           * PAYLOAD
           */
          const payload = {
            id: message._id.toString(),

            conversationId: conversationId.toString(),

            text: message.text,

            sender: formatUser(message.sender),

            createdAt: message.createdAt,
          };

          console.log(
            "📤 Sending message to room:",
            `conversation:${conversationId}`,
          );

          console.log("PAYLOAD:", payload);

          /**
           * SEND TO ROOM
           */
          io.to(`conversation:${conversationId}`).emit(
            "receive_message",
            payload,
          );

          /**
           * SIDEBAR UPDATE
           */
          for (const participantId of conversation.participants) {
            const pid = participantId.toString();

            io.to(`user:${pid}`).emit("conversation_updated", {
              conversationId: conversationId.toString(),

              lastMessage: trimmed,

              lastMessageAt: message.createdAt,
            });
          }

          callback?.({
            success: true,
            message: payload,
          });
        } catch (error) {
          console.log("❌ send_message error:", error.message);

          callback?.({
            error: error.message,
          });
        }
      });

      /**
       * TYPING
       */
      socket.on("typing", ({ conversationId, isTyping }) => {
        socket.to(`conversation:${conversationId}`).emit("typing", {
          conversationId,
          userId,
          username: socket.user.username,
          isTyping: !!isTyping,
        });
      });

      /**
       * DISCONNECT
       */
      socket.on("disconnect", async (reason) => {
        console.log(`❌ Socket disconnected: ${socket.user.username}`, reason);

        removeOnline(userId);

        if (!isUserOnline(userId)) {
          const lastSeen = new Date();

          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen,
          });

          io.emit("user_status", {
            userId,
            isOnline: false,
            lastSeen,
          });
        }
      });
    } catch (error) {
      console.log("Socket connection error:", error.message);
    }
  });
}
