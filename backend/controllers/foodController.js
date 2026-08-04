import Food from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import fs from "fs";
import path from "path";

// Pastikan image selalu diawali "/uploads/" agar URL frontend benar
const normalizeImage = (food) => {
  if (!food || !food.image) return food;
  const img = String(food.image);
  if (img.startsWith("http") || img.startsWith("/uploads/")) return food;
  food.image = "/uploads/" + img.replace(/^\/+/, "");
  return food;
};

// CREATE
export const addFood = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "Image file is required" });

    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    if (stock == null || isNaN(Number(stock)) || Number(stock) < 0)
      return res.status(400).json({ success: false, message: "Stock is required and must be >= 0" });

    const food = new Food({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: "/uploads/" + req.file.filename,
    });

    await food.save();
    res.json({ success: true, message: "Food item added", data: food });
  } catch (error) {
    console.error("Add Food Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// READ
export const listFood = async (req, res) => {
  try {
    console.log("GET /api/food/list called"); // debug log
    const categoryFilter = req.query.category;
    const filter = {};
    if (categoryFilter && categoryFilter !== "All") filter.category = categoryFilter;

    const foods = await Food.find(filter);
    foods.forEach(normalizeImage);
    res.json(foods);
  } catch (error) {
    console.error("List Food Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch food list" });
  }
};

// DELETE
export const removeFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });

    const imgPath = path.join("uploads", path.basename(food.image));
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await Food.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Food removed" });
  } catch (error) {
    console.error("Remove Food Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to remove food" });
  }
};

// UPDATE
export const updateFood = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });

    if (name) food.name = name;
    if (description) food.description = description;
    if (price) food.price = Number(price);
    if (category) food.category = category;
    if (stock != null) {
      if (isNaN(Number(stock)) || Number(stock) < 0)
        return res.status(400).json({ success: false, message: "Stock must be >= 0" });
      food.stock = Number(stock);
    }

    if (req.file) {
      if (food.image) {
        const oldPath = path.join("uploads", path.basename(food.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      food.image = "/uploads/" + req.file.filename;
    }

    await food.save();
    res.json({ success: true, message: "Food updated", data: normalizeImage(food) });
  } catch (error) {
    console.error("Update Food Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update food" });
  }
};

// ADD REVIEW
export const addReview = async (req, res) => {
  try {
    const { foodId, rating, comment } = req.body;
    const userId = req.userId;
    const user = await userModel.findById(userId);
    const userName = user?.name || "Anonymous";

    if (!foodId || !rating || !comment)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });

    const alreadyReviewed = food.reviews?.some((r) => r.userId?.toString() === userId);
    if (alreadyReviewed) return res.status(400).json({ success: false, message: "Already reviewed" });

    const newReview = { userId, user: userName, rating: Number(rating), comment, date: new Date() };
    if (!food.reviews) food.reviews = [];
    food.reviews.push(newReview);

    await food.save();
    res.json({ success: true, message: "Review added", food: normalizeImage(food) });
  } catch (error) {
    console.error("Add Review Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to add review" });
  }
};
