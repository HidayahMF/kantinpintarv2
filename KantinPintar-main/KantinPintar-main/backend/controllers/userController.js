import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import multer from "multer";
import path from "path";

// Multer setup for avatar upload
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, '_'));
  },
});
export const upload = multer({ storage });

// Helper: Create JWT token
const createToken = (id, isAdmin) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// REGISTER USER
export const registerUser = async (req, res) => {
  const { name, password, email, isAdmin } = req.body;
  try {
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required." });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: "Please enter a valid email." });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

    const exist = await userModel.findOne({ email });
    if (exist)
      return res.status(409).json({ success: false, message: "Email already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      isAdmin: Boolean(isAdmin),
    });

    await newUser.save();
    const token = createToken(newUser._id, newUser.isAdmin);

    return res.status(201).json({
      success: true,
      token,
      isAdmin: newUser.isAdmin,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        createdAt: newUser.createdAt,
        avatar: newUser.avatar || null
      },
      message: "Registration successful.",
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User doesn't exist." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    const token = createToken(user._id, user.isAdmin);

    return res.json({
      success: true,
      token,
      isAdmin: user.isAdmin,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        avatar: user.avatar || null
      },
      message: "Login successful.",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ADMIN LOGIN
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await userModel.findOne({ email });
    if (!user || !user.isAdmin)
      return res.status(403).json({ success: false, message: "Access denied, not admin." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ success: false, message: "Invalid credentials." });

    const token = createToken(user._id, user.isAdmin);

    return res.json({
      success: true,
      token,
      isAdmin: user.isAdmin,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        avatar: user.avatar || null
      },
      message: "Admin login successful.",
    });
  } catch (error) {
    console.error("loginAdmin error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET PROFILE USER (GET /api/user/me)
export const getCurrentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    console.error("Get Current User Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// UPDATE PROFILE (PUT /api/user/update-profile)
export const updateProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update email jika ada perubahan
    if (email && validator.isEmail(email)) {
      // Cek jika email sudah ada di user lain
      const exist = await userModel.findOne({ email, _id: { $ne: user._id } });
      if (exist) {
        return res.status(409).json({ success: false, message: "Email already used by another user." });
      }
      user.email = email;
    }
    // Update avatar jika ada file baru
    if (req.file) user.avatar = req.file.filename;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
      },
      message: "Profile updated.",
    });
  } catch (e) {
    console.error("Update Profile Error:", e.message);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// GET ALL USERS (ADMIN ONLY)
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, "-password").sort({ createdAt: -1 });
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    console.error("Get Users Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// DELETE USER (ADMIN ONLY)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (id === req.userId) {
      return res.status(400).json({ success: false, message: "You can't delete yourself!" });
    }
    const user = await userModel.findByIdAndDelete(id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    return res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
