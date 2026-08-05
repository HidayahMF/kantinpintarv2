import express from "express";
import {
  getAllChatUsers,
  getRoomMessages,
  sendAdminMessage,
  sendUserMessage,
  updateChatStatus,
  deleteChatRoom,
  getChatStatus,
  getAllMessages,
  adminReadChat,
} from "../controllers/messageController.js";
import authUserMiddleware from "../middleware/authUserMiddleware.js";
import authAdminMiddleware from "../middleware/authAdminMiddleware.js";
import { assertSameEmail, canAccessRoom } from "../middleware/ownership.js";

const router = express.Router();

// ================= USER ROUTES =================
// Kirim pesan lewat form Customer Service (wajib login,
// email harus milik user yang login).
router.post(
  "/",
  authUserMiddleware,
  assertSameEmail((req) => req.body.email),
  sendUserMessage
);

// Akses room chat milik user yang login (admin juga boleh via canAccessRoom).
router.get("/room/:email", authUserMiddleware, canAccessRoom, getRoomMessages);
router.get(
  "/room/:email/status",
  authUserMiddleware,
  canAccessRoom,
  getChatStatus
);
router.post(
  "/room/:email/user",
  authUserMiddleware,
  assertSameEmail((req) => req.params.email),
  sendUserMessage
);

// ================= ADMIN ROUTES =================
router.use(authAdminMiddleware);

router.get("/all", getAllMessages);
router.get("/users", getAllChatUsers);
router.post("/room/:email/admin", sendAdminMessage);
router.patch("/room/:email/status", updateChatStatus);
router.patch("/room/:email/admin-read", adminReadChat);
router.delete("/room/:email", deleteChatRoom);

export default router;
