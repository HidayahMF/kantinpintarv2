
import express from "express";
import authAdminMiddleware from "../middleware/authAdminMiddleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../controllers/categoryController.js";
import {
  addFood,
  listFood,
  removeFood,
  updateFood,
} from "../controllers/foodController.js";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import {
  loginUser,
  registerUser,
  deleteUser,
  getAllUsers,
  loginAdmin,
} from "../controllers/userController.js";

const adminRouter = express.Router();

adminRouter.use(authAdminMiddleware);


adminRouter.get("/category/list", getCategories);
adminRouter.get("/category/:id", getCategoryById);
adminRouter.post("/category/add", createCategory);
adminRouter.put("/category/:id", updateCategory);
adminRouter.delete("/category/:id", deleteCategory);


adminRouter.post("/food/add", addFood);
adminRouter.get("/food/list", listFood);
adminRouter.delete("/food/remove/:id", removeFood);
adminRouter.put("/food/update/:id", updateFood);


adminRouter.post("/order/place", placeOrder);
adminRouter.post("/order/verify", verifyOrder);
adminRouter.get("/order/userorders", userOrders);
adminRouter.get("/order/list", listOrders);
adminRouter.post("/order/status", updateStatus);
adminRouter.delete("/order/:orderId", deleteOrder);


adminRouter.post("/user/register", registerUser);
adminRouter.post("/user/login", loginUser);
adminRouter.post("/user/login-admin", loginAdmin);
adminRouter.get("/user/users", getAllUsers);
adminRouter.delete("/user/:id", deleteUser);

export default adminRouter;
