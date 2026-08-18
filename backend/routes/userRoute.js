import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  loginAdmin,
  getAllUsers,
  deleteUser,
  getCurrentUser,
  updateProfile,
  upload 
} from "../controllers/userController.js";

import authAdminMiddleware from "../middleware/authAdminMiddleware.js";
import authUserMiddleware from "../middleware/authUserMiddleware.js";

const userRouter = express.Router();

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 2MB." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err && err.message && (err.message.includes("Only image") || err.message.includes("image files"))) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/login-admin", loginAdmin);
userRouter.get("/me", authUserMiddleware, getCurrentUser);

userRouter.put(
  "/update-profile",
  authUserMiddleware,
  upload.single("avatar"),
  handleMulterError,
  updateProfile
);

userRouter.get("/users", authAdminMiddleware, getAllUsers);
userRouter.delete("/:id", authAdminMiddleware, deleteUser);

export default userRouter;
