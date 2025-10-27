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
  adminReadChat 
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/all", getAllMessages);
router.post("/", sendUserMessage);

router.get("/users", getAllChatUsers);
router.get("/room/:email", getRoomMessages);
router.get("/room/:email/status", getChatStatus);
router.post("/room/:email/admin", sendAdminMessage);
router.post("/room/:email/user", sendUserMessage);
router.patch("/room/:email/status", updateChatStatus);
router.patch("/room/:email/admin-read", adminReadChat); 
router.delete("/room/:email", deleteChatRoom);

export default router;
