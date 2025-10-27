import express from "express";
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

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/login-admin", loginAdmin);
userRouter.get("/me", authUserMiddleware, getCurrentUser);


userRouter.put(
  "/update-profile",
  authUserMiddleware,
  upload.single("avatar"), 
  updateProfile
);

userRouter.get("/all", authAdminMiddleware, getAllUsers);
userRouter.delete("/:id", authAdminMiddleware, deleteUser);

export default userRouter;
