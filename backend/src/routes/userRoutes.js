import { Router } from "express";
import {
  getUsers,
  uploadProfilePhoto,
  removeProfilePhoto,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/upload.js";

const router = Router();

router.use(protect);
router.get("/", getUsers);

router.post("/me/avatar", (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    next();
  });
}, uploadProfilePhoto);

router.delete("/me/avatar", removeProfilePhoto);

export default router;
