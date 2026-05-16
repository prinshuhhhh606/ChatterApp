import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { formatUser } from "../utils/formatUser.js";

const AVATAR_COLORS = ["#6366f1", "#8b5cf6", "#0ea5e9", "#10b981", "#f472b6", "#f59e0b"];

function pickColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function baseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

/** POST /api/auth/register */
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (exists) {
      return res.status(400).json({ error: "Username or email already in use" });
    }

    const user = await User.create({
      username,
      email,
      password,
      avatar: username.charAt(0).toUpperCase(),
      avatarColor: pickColor(),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: formatUser(user, baseUrl(req)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/** POST /api/auth/login */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: formatUser(user, baseUrl(req)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/** GET /api/auth/me */
export async function getMe(req, res) {
  res.json({ user: formatUser(req.user, baseUrl(req)) });
}
