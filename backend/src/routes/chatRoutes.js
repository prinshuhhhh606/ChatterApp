import { Router } from "express";
import {
  getConversations,
  createConversation,
  createGroup,
  getMessages,
  deleteMessage,
} from "../controllers/chatController.js";

import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

// Conversations
router.get("/", getConversations);
router.post("/", createConversation);
router.post("/group", createGroup);

// Messages
router.get("/:id/messages", getMessages);

// Delete message
router.delete("/:conversationId/messages/:id", deleteMessage);

export default router;
