import mongoose from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { formatUser, photoUrl } from "../utils/formatUser.js";

const USER_FIELDS =
  "username email avatar avatarColor profilePhoto isOnline lastSeen";

function getBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

/** Format conversation for sidebar (private or group) */
function formatConversation(conv, currentUserId, baseUrl) {
  if (conv.isGroup) {
    const participants = conv.participants.map((p) => formatUser(p, baseUrl));
    return {
      id: conv._id.toString(),
      isGroup: true,
      groupName: conv.groupName,
      groupPhoto: conv.groupPhoto,
      groupPhotoUrl: photoUrl(conv.groupPhoto, baseUrl),
      participants,
      memberCount: participants.length,
      lastMessage: conv.lastMessage?.text || "",
      lastMessageAt: conv.lastMessage?.createdAt || conv.updatedAt,
      updatedAt: conv.updatedAt,
    };
  }

  const other = conv.participants.find(
    (p) => p._id.toString() !== currentUserId.toString()
  );

  return {
    id: conv._id.toString(),
    isGroup: false,
    otherUser: formatUser(other, baseUrl),
    lastMessage: conv.lastMessage?.text || "",
    lastMessageAt: conv.lastMessage?.createdAt || conv.updatedAt,
    updatedAt: conv.updatedAt,
  };
}

/** GET /api/conversations */
export async function getConversations(req, res) {
  try {
    const baseUrl = getBaseUrl(req);
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", USER_FIELDS)
      .populate("lastMessage.sender", "username")
      .sort({ updatedAt: -1 });

    res.json(
      conversations.map((c) => formatConversation(c, req.user._id, baseUrl))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/** POST /api/conversations — private 1-on-1 */
export async function createConversation(req, res) {
  try {
    const { userId } = req.body;
    const baseUrl = getBaseUrl(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot chat with yourself" });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, otherUser._id], $size: 2 },
    }).populate("participants", USER_FIELDS);

    if (!conversation) {
      conversation = await Conversation.create({
        isGroup: false,
        participants: [req.user._id, otherUser._id],
        lastMessage: { text: "", createdAt: new Date() },
      });
      await conversation.populate("participants", USER_FIELDS);
    }

    res
      .status(201)
      .json(formatConversation(conversation, req.user._id, baseUrl));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/** POST /api/conversations/group — create group chat */
export async function createGroup(req, res) {
  try {
    const { name, userIds } = req.body;
    const baseUrl = getBaseUrl(req);

    if (!name?.trim()) {
      return res.status(400).json({ error: "Group name is required" });
    }

    if (!Array.isArray(userIds) || userIds.length < 1) {
      return res.status(400).json({
        error: "Select at least one member for the group",
      });
    }

    const memberIds = [
      req.user._id.toString(),
      ...userIds.filter((id) => id !== req.user._id.toString()),
    ];

    const uniqueIds = [...new Set(memberIds)];

    if (uniqueIds.length < 2) {
      return res.status(400).json({
        error: "Group needs at least 2 members including you",
      });
    }

    for (const id of uniqueIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: `Invalid user id: ${id}` });
      }
    }

    const users = await User.find({ _id: { $in: uniqueIds } });
    if (users.length !== uniqueIds.length) {
      return res.status(404).json({ error: "One or more users not found" });
    }

    const conversation = await Conversation.create({
      isGroup: true,
      groupName: name.trim(),
      createdBy: req.user._id,
      participants: uniqueIds,
      lastMessage: {
        text: `${req.user.username} created the group`,
        sender: req.user._id,
        createdAt: new Date(),
      },
    });

    await conversation.populate("participants", USER_FIELDS);

    res
      .status(201)
      .json(formatConversation(conversation, req.user._id, baseUrl));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/** GET /api/conversations/:id/messages */
export async function getMessages(req, res) {
  try {
    const { id } = req.params;
    const baseUrl = getBaseUrl(req);

    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId: id })
      .populate("sender", USER_FIELDS)
      .sort({ createdAt: 1 });

    res.json(
      messages.map((m) => ({
        id: m._id.toString(),
        conversationId: m.conversationId.toString(),
        text: m.text,
        sender: formatUser(m.sender, baseUrl),
        createdAt: m.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
