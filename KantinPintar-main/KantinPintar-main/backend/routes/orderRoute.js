// backend/routes/orderRoute.js
import express from "express";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import authUserMiddleware from "../middleware/authUserMiddleware.js";

const router = express.Router();

router.post("/place", authUserMiddleware, placeOrder);
router.get("/verify", verifyOrder);
router.get("/userorders", authUserMiddleware, userOrders);
router.get("/list", authUserMiddleware, listOrders);
router.post("/status", authUserMiddleware, updateStatus);
router.delete("/delete/:orderId", authUserMiddleware, deleteOrder);

export default router;
