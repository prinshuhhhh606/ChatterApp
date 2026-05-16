import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/User.js";
import { formatUser } from "../utils/formatUser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads/avatars");

function getBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

/** GET /api/users — list users for new chat / group */
export async function getUsers(req, res) {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("username email avatar avatarColor profilePhoto isOnline lastSeen")
      .sort({ username: 1 });

    const baseUrl = getBaseUrl(req);
    res.json(users.map((u) => formatUser(u, baseUrl)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/** POST /api/users/me/avatar — upload profile photo */
export async function uploadProfilePhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please select an image file" });
    }

    const photoPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findById(req.user._id);

    // Remove old photo file if exists
    if (user.profilePhoto) {
      const oldFile = path.join(
        uploadDir,
        path.basename(user.profilePhoto)
      );
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }

    user.profilePhoto = photoPath;
    await user.save();

    res.json({
      user: formatUser(user, getBaseUrl(req)),
      message: "Profile photo updated",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/** DELETE /api/users/me/avatar — remove profile photo */
export async function removeProfilePhoto(req, res) {
  try {
    const user = await User.findById(req.user._id);

    if (user.profilePhoto) {
      const oldFile = path.join(uploadDir, path.basename(user.profilePhoto));
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      user.profilePhoto = "";
      await user.save();
    }

    res.json({ user: formatUser(user, getBaseUrl(req)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
