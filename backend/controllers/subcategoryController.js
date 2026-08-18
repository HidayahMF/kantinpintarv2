import SubCategory from "../models/subcategory.model.js";

export const getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate("category");
    res.json(subCategories);
  } catch (error) {
    console.error("GetSubCategories error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ category: req.params.categoryId });
    res.json(subCategories);
  } catch (error) {
    console.error("GetSubCategoriesByCategory error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const newSubCategory = new SubCategory({ name, category });
    await newSubCategory.save();
    res.status(201).json(newSubCategory);
  } catch (error) {
    console.error("CreateSubCategory error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    const updated = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { name, category },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("UpdateSubCategory error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const deleted = await SubCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "SubCategory not found" });
    }
    res.json({ message: "SubCategory deleted successfully" });
  } catch (error) {
    console.error("DeleteSubCategory error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
