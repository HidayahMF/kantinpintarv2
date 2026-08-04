// backend/routes/orderRoute.js
import express from "express";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder,
  midtransNotification,
} from "../controllers/orderController.js";
import authUserMiddleware from "../middleware/authUserMiddleware.js";
import authAdminMiddleware from "../middleware/authAdminMiddleware.js";

const router = express.Router();

router.post("/place", authUserMiddleware, placeOrder);
router.get("/verify", verifyOrder);
router.post("/notification", midtransNotification);
router.get("/userorders", authUserMiddleware, userOrders);
router.get("/list", authAdminMiddleware, listOrders);
router.post("/status", authAdminMiddleware, updateStatus);
router.delete("/delete/:orderId", authAdminMiddleware, deleteOrder);

export default router;
