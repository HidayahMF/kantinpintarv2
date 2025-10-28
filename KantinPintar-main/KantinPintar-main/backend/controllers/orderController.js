// backend/controllers/orderController.js
import Stripe from "stripe";
import Order from "../models/orderModell.js";
import userModel from "../models/userModel.js";
import Food from "../models/foodModel.js"; // pastikan ada model Food

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontend_url = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/+$/, "");

// ============================
//  PLACE ORDER
// ============================
export const placeOrder = async (req, res) => {
  try {
    console.log("📦 placeOrder called - body:", req.body);
    console.log("👤 userId from middleware:", req.userId);

    const { items, amount, address } = req.body;
    const userId = req.userId;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: user not found" });

    if (!items || !Array.isArray(items) || items.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No items in order" });

    // Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    // Shipping cost
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Delivery Charges" },
        unit_amount: 200, // $2
      },
      quantity: 1,
    });

    // Buat sesi Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/verify?success=false`,
      metadata: { userId, amount: (amount || 0).toString() },
    });

    // Simpan order ke database
    const newOrder = new Order({
      userId,
      amount,
      address,
      items,
      paymentStatus: "pending",
      stripeSessionId: session.id,
    });

    await newOrder.save();

    // Kosongkan cart user
    try {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    } catch (e) {
      console.warn("⚠️ Could not clear user cart:", e.message);
    }

    console.log("✅ Order created:", newOrder._id);
    console.log("💳 Stripe session URL:", session.url);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      session_url: session.url,
    });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
      detail: error?.raw || null,
    });
  }
};

// ============================
//  VERIFY ORDER
// ============================
export const verifyOrder = async (req, res) => {
  try {
    const session_id = (req.query.session_id || "").trim();
    if (!session_id)
      return res
        .status(400)
        .json({ success: false, message: "session_id required" });

    console.log("[DEBUG] Verify session:", session_id);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid")
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed." });

    const order = await Order.findOne({ stripeSessionId: session.id });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });

    if (order.paymentStatus !== "completed") {
      for (const orderedItem of order.items) {
        try {
          const food = await Food.findById(orderedItem._id);
          if (food) {
            const oldStock = food.stock || 0;
            food.stock = Math.max(0, oldStock - orderedItem.quantity);
            await food.save();
          } else {
            console.warn("Food not found:", orderedItem._id);
          }
        } catch (err) {
          console.error("Error updating food stock:", err.message);
        }
      }
      order.paymentStatus = "completed";
      await order.save();
    }

    return res.json({
      success: true,
      message: "Payment verified and order updated.",
    });
  } catch (error) {
    console.error("❌ Verify error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error verifying payment." });
  }
};

// ============================
//  USER ORDERS (GET USER'S ORDERS)
// ============================
export const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: user not found" });

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ UserOrders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching user orders" });
  }
};

// ============================
//  LIST ALL ORDERS (ADMIN)
// ============================
export const listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ ListOrders error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching all orders" });
  }
};

// ============================
//  UPDATE STATUS (ADMIN)
// ============================
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const validStatuses = ["Food Processing", "Out For Delivery", "Delivered"];
    if (!validStatuses.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ UpdateStatus error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating order status" });
  }
};

// ============================
//  DELETE ORDER (ADMIN)
// ============================
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ DeleteOrder error:", error);
    res.status(500).json({ success: false, message: "Error deleting order" });
  }
};
