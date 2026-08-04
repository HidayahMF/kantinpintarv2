import express from "express";
import {
  getSubCategories,
  getSubCategoriesByCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subcategoryController.js";

const router = express.Router();

router.get("/list", getSubCategories);
router.get("/by-category/:categoryId", getSubCategoriesByCategory);
router.post("/add", createSubCategory);
router.put("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;
