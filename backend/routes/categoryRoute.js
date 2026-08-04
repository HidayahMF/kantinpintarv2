
import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import authAdminMiddleware from "../middleware/authAdminMiddleware.js";

const categoryRouter = express.Router();


categoryRouter.get("/list", getCategories);

categoryRouter.get("/:id", getCategoryById);

categoryRouter.post("/add", authAdminMiddleware, createCategory);
categoryRouter.put("/:id", authAdminMiddleware, updateCategory);
categoryRouter.delete("/:id", authAdminMiddleware, deleteCategory);

export default categoryRouter;
