import express from "express";
import {
  getSubCategories,
  getSubCategoriesByCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subcategoryController.js";
import authAdminMiddleware from "../middleware/authAdminMiddleware.js";

const router = express.Router();

// Public
router.get("/list", getSubCategories);
router.get("/by-category/:categoryId", getSubCategoriesByCategory);

// Admin only
router.post("/add", authAdminMiddleware, createSubCategory);
router.put("/:id", authAdminMiddleware, updateSubCategory);
router.delete("/:id", authAdminMiddleware, deleteSubCategory);

export default router;
