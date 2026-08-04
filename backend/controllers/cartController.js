import userModel from "../models/userModel.js";

// Tambah item ke keranjang
const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.userId; // ✅ Ambil dari middleware

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData || {};
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};


export { addToCart, removeFromCart, getCart };
