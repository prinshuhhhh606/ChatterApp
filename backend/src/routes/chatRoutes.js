import { Router } from "express";
import {
  getConversations,
  createConversation,
  createGroup,
  getMessages,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getConversations);
router.post("/", createConversation);
router.post("/group", createGroup);
router.get("/:id/messages", getMessages);

export default router;
