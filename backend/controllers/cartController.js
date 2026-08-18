import userModel from "../models/userModel.js";
import Food from "../models/foodModel.js";

// Tambah item ke keranjang
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.userId;

    if (!itemId)
      return res.status(400).json({ success: false, message: "itemId is required" });

    const food = await Food.findById(itemId);
    if (!food)
      return res.status(404).json({ success: false, message: "Food item not found" });

    if (food.stock <= 0)
      return res.status(400).json({ success: false, message: "Item is out of stock" });

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData || {};
    const currentQty = cartData[itemId] || 0;
    if (currentQty >= food.stock)
      return res.status(400).json({ success: false, message: "Cannot add more than available stock" });

    cartData[itemId] = currentQty + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.error("AddToCart error:", error.message);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.userId;

    const userData = await userModel.findById(userId);
    const cartData = userData.cartData || {};

    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Removed From Cart" });
  } catch (error) {
    console.error("RemoveFromCart error:", error.message);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId);
    const cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.error("GetCart error:", error.message);
    res.status(500).json({ success: false, message: "Error" });
  }
};


export { addToCart, removeFromCart, getCart };
