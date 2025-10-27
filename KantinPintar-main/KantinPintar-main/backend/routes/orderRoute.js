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
import authAdminMiddleware from "../middleware/authAdminMiddleware.js";

const orderRouter = express.Router();

orderRouter.post("/place", authUserMiddleware, placeOrder);
orderRouter.get("/verify", verifyOrder); 
orderRouter.get("/userorders", authUserMiddleware, userOrders);
orderRouter.get("/list", authAdminMiddleware, listOrders);
orderRouter.post("/status", authAdminMiddleware, updateStatus);
orderRouter.delete("/:orderId", authAdminMiddleware, deleteOrder);
orderRouter.get("/all", authAdminMiddleware, listOrders);
export default orderRouter;
