import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { formatUser } from "../utils/formatUser.js";
import { socketAuth } from "./socketAuth.js";

// Track online user IDs in memory (userId -> socketId count for multi-tab)
const onlineUsers = new Map();

function addOnline(userId) {
  const key = userId.toString();
  onlineUsers.set(key, (onlineUsers.get(key) || 0) + 1);
}

function removeOnline(userId) {
  const key = userId.toString();
  const count = (onlineUsers.get(key) || 1) - 1;
  if (count <= 0) onlineUsers.delete(key);
  else onlineUsers.set(key, count);
}

function isUserOnline(userId) {
  return onlineUsers.has(userId.toString());
}

/**
 * Register all real-time Socket.IO events.
 */
export function registerSocketHandlers(io) {
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`Socket connected: ${socket.user.username} (${socket.id})`);

    // Personal room — for direct notifications to this user
    socket.join(`user:${userId}`);
    addOnline(userId);

    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Broadcast online status to everyone
    io.emit("user_status", {
      userId,
      isOnline: true,
      lastSeen: new Date(),
    });

    // Send list of currently online users to the new client
    socket.emit("online_users", Array.from(onlineUsers.keys()));

    /** Join a conversation room to receive messages */
    socket.on("join_conversation", async ({ conversationId }) => {
      const conv = await Conversation.findOne({
        _id: conversationId,
        participants: socket.user._id,
      });

      if (conv) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    /** Real-time message */
    socket.on("send_message", async ({ conversationId, text }, callback) => {
      try {
        const trimmed = String(text ?? "").trim();
        if (!trimmed) {
          return callback?.({ error: "Empty message" });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user._id,
        });

        if (!conversation) {
          return callback?.({ error: "Conversation not found" });
        }

        const message = await Message.create({
          conversationId,
          sender: socket.user._id,
          text: trimmed,
        });

        await message.populate(
          "sender",
          "username avatar avatarColor profilePhoto"
        );

        conversation.lastMessage = {
          text: trimmed,
          sender: socket.user._id,
          createdAt: message.createdAt,
        };
        conversation.updatedAt = new Date();
        await conversation.save();

        const payload = {
          id: message._id.toString(),
          conversationId: conversationId.toString(),
          text: message.text,
          sender: formatUser(message.sender),
          createdAt: message.createdAt,
        };

        // Everyone in this chat room receives the message
        io.to(`conversation:${conversationId}`).emit("receive_message", payload);

        // Notify participants for sidebar update (even if not in room)
        for (const participantId of conversation.participants) {
          const pid = participantId.toString();
          io.to(`user:${pid}`).emit("conversation_updated", {
            conversationId: conversationId.toString(),
            lastMessage: trimmed,
            lastMessageAt: message.createdAt,
          });
        }

        callback?.({ success: true, message: payload });
      } catch (error) {
        callback?.({ error: error.message });
      }
    });

    /** Typing indicator */
    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit("typing", {
        conversationId,
        userId,
        username: socket.user.username,
        isTyping: !!isTyping,
      });
    });

    socket.on("disconnect", async () => {
      removeOnline(userId);

      // Only mark offline when no more tabs connected
      if (!isUserOnline(userId)) {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: false,
          lastSeen,
        });

        io.emit("user_status", {
          userId,
          isOnline: false,
          lastSeen,
        });
      }

      console.log(`Socket disconnected: ${socket.user.username}`);
    });
  });
}
