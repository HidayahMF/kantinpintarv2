import Category from "../models/categoryModel.js";

// GET all categories (public - for sidebar dropdown)
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ _id: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error("Get Categories Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// GET single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, data: category });
  } catch (err) {
    console.error("Get CategoryById Error:", err.message);
    res.status(500).json({ success: false, message: "Error fetching category" });
  }
};

// POST create new category (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const exist = await Category.findOne({ name: name.trim() });
    if (exist) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const newCategory = new Category({ name: name.trim() });
    await newCategory.save();

    res.status(201).json({
      success: true,
      data: newCategory,
      message: "Category created",
    });
  } catch (err) {
    console.error("Create Category Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

// PUT update category name by ID (admin only)
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category, message: "Category updated" });
  } catch (err) {
    console.error("Update Category Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

// DELETE category by ID (admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Delete Category Error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};
