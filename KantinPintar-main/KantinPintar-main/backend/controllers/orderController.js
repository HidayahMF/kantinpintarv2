import Order from "../models/orderModell.js"; // Typo sudah diperbaiki!
import userModel from "../models/userModel.js";
import Food from "../models/foodModel.js"; // Konsisten pakai 'Food'
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

// Membuat pesanan & Stripe session
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId;

    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Delivery Charges" },
        unit_amount: 200,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/verify?success=false`,
      metadata: {
        userId,
        amount: amount.toString(),
      },
    });

    const newOrder = new Order({
      userId,
      amount,
      address,
      items,
      paymentStatus: "pending",
      stripeSessionId: session.id,
    });

    await newOrder.save();

    // Kosongkan cart user di backend setelah checkout
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.status(201).json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// Verifikasi status pembayaran & kurangi stock jika sukses
const verifyOrder = async (req, res) => {
  const session_id =
    req.query.session_id ||
    req.body.session_id ||
    req.body.sessionId ||
    req.query.sessionId;

  // Sanitasi: Hanya karakter aman (alfanumerik, -, _)
  const cleanSessionId = (session_id || "").trim();
  if (
    !cleanSessionId ||
    !/^cs_[\w-]+$/.test(cleanSessionId)
  ) {
    return res.status(400).json({ success: false, message: "Invalid session_id format" });
  }

  // Debug log
  console.log("[DEBUG] Verifying session_id:", cleanSessionId);

  try {
    const session = await stripe.checkout.sessions.retrieve(cleanSessionId);

    if (session.payment_status === "paid") {
      const order = await Order.findOne({ stripeSessionId: session.id });
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found." });
      }
      // Proses stock hanya jika paymentStatus belum completed (anti dobel)
      if (order.paymentStatus !== "completed") {
        for (const orderedItem of order.items) {
          try {
            console.log('[DEBUG] Proses pengurangan stock:', orderedItem);
            const food = await Food.findById(orderedItem._id);
            if (food) {
              const oldStock = food.stock || 0;
              food.stock = Math.max(0, oldStock - orderedItem.quantity);
              await food.save();
              console.log(
                `[Order Verify] Stock updated: ${food.name}: ${oldStock} -> ${food.stock}`
              );
            } else {
              console.log(
                `[Order Verify] Food not found: ${orderedItem._id}`
              );
            }
          } catch (err) {
            console.error(
              `[Order Verify] Error updating stock for food: ${orderedItem._id}`,
              err
            );
          }
        }
        order.paymentStatus = "completed";
        await order.save();
      }
      res.json({
        success: true,
        message: "Payment verified and order status updated.",
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment not completed." });
    }
  } catch (error) {
    // Log detail error Stripe (penting untuk debug)
    console.error("Verify error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error verifying payment.", detail: error?.message || "" });
  }
};

// Ambil pesanan user (GET /api/order/userorders)
const userOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    res.json({ success: true, orders: orders || [] });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Ambil semua pesanan (admin)
const listOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("userId", "name email");
    res.json({ success: true, orders });
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Update status pesanan
const updateStatus = async (req, res) => {
  const { orderId, status } = req.body;
  try {
    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID and status are required" });
    }
    const updateFields = { status };
    if (status === "Delivered") updateFields.paymentStatus = "completed";

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, {
      new: true,
    });
    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

// Hapus pesanan
const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ success: false, message: "Error deleting order" });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder,
};
