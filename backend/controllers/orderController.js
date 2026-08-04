// backend/controllers/orderController.js
import midtransClient from "midtrans-client";
import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/orderModell.js";
import userModel from "../models/userModel.js";
import Food from "../models/foodModel.js"; // pastikan ada model Food

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

const core = new midtransClient.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

const frontend_url = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/+$/, "");

// Ongkir tetap (IDR)
const SHIPPING_FEE = 2000;

const makeOrderId = () =>
  `KP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// Format tanggal Midtrans: "yyyy-MM-dd HH:mm:ss ±HHMM"
const formatMidtransDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ` +
    `${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`
  );
};

// ============================
//  PLACE ORDER
// ============================
export const placeOrder = async (req, res) => {
  try {
    console.log("📦 placeOrder called - body:", req.body);
    console.log("👤 userId from middleware:", req.userId);

    const { items, address } = req.body;
    const userId = req.userId;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: user not found" });

    if (!items || !Array.isArray(items) || items.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No items in order" });

    // Hitung ulang total dari harga DB (jangan percaya body) — IDR
    let grossAmount = 0;
    const itemDetails = [];
    for (const item of items) {
      const food = await Food.findById(item._id).catch(() => null);
      const price = food ? food.price : Number(item.price) || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      grossAmount += price * qty;
      itemDetails.push({
        id: String(item._id),
        price,
        quantity: qty,
        name: item.name || "Item",
        category: item.category || undefined,
      });
    }
    grossAmount += SHIPPING_FEE;
    grossAmount = Math.round(grossAmount);

    itemDetails.push({
      id: "shipping",
      price: SHIPPING_FEE,
      quantity: 1,
      name: "Ongkos Kirim",
    });

    const order_id = makeOrderId();

    const transaction_details = {
      order_id,
      gross_amount: grossAmount,
    };

    const customer_details = {
      first_name: address?.firstName || "",
      last_name: address?.lastName || "",
      email: address?.email || "",
      phone: address?.phone || "",
      billing_address: {
        first_name: address?.firstName,
        last_name: address?.lastName,
        email: address?.email,
        phone: address?.phone,
        address: address?.street,
        city: address?.city,
        postal_code: address?.zipcode,
        country_code: "IDN",
      },
      shipping_address: {
        first_name: address?.firstName,
        last_name: address?.lastName,
        email: address?.email,
        phone: address?.phone,
        address: address?.street,
        city: address?.city,
        postal_code: address?.zipcode,
        country_code: "IDN",
      },
    };

    const parameter = {
      transaction_details,
      item_details: itemDetails,
      customer_details,
      expiry: {
        start_time: formatMidtransDate(new Date()),
        unit: "minutes",
        duration: 60,
      },
      callbacks: {
        finish: `${frontend_url}/verify?order_id=${order_id}`,
        error: `${frontend_url}/verify?order_id=${order_id}&status=failed`,
        pending: `${frontend_url}/verify?order_id=${order_id}&status=pending`,
      },
    };

    // Buat transaksi Snap Midtrans
    const transaction = await snap.createTransaction(parameter);
    const { token, redirect_url } = transaction;

    // Simpan order ke database
    const newOrder = new Order({
      userId,
      amount: grossAmount,
      address,
      items: items.map((item) => ({
        _id: item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
        category: item.category,
      })),
      paymentStatus: "pending",
      midtransOrderId: order_id,
    });

    await newOrder.save();

    // Kosongkan cart user
    try {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    } catch (e) {
      console.warn("⚠️ Could not clear user cart:", e.message);
    }

    console.log("✅ Order created:", newOrder._id, "| order_id:", order_id);
    console.log("💳 Midtrans token:", token);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      snap_token: token,
      redirect_url,
      order_id,
    });
  } catch (error) {
    console.error("❌ Midtrans transaction error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
      detail: error?.ApiResponse || error?.error_messages || null,
    });
  }
};

// ============================
//  VERIFY ORDER (status check)
// ============================
export const verifyOrder = async (req, res) => {
  try {
    const order_id = (req.query.order_id || "").trim();
    if (!order_id)
      return res
        .status(400)
        .json({ success: false, message: "order_id required" });

    console.log("[DEBUG] Verify order:", order_id);

    const order = await Order.findOne({ midtransOrderId: order_id });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });

    const status = await core.transaction.status(order_id);
    const transactionStatus = status.transaction_status;
    const paymentType = status.payment_type;

    console.log(
      "[DEBUG] Midtrans status:",
      transactionStatus,
      "| fraud:",
      status.fraud_status
    );

    // settlement/capture = lunas
    if (
      transactionStatus === "settlement" ||
      transactionStatus === "capture"
    ) {
      if (order.paymentStatus !== "completed") {
        await deductStock(order);
        order.paymentStatus = "completed";
      }
      order.paymentMethod = paymentType || null;
      await order.save();

      return res.json({
        success: true,
        status: "completed",
        message: "Payment verified and order updated.",
      });
    }

    // masih menunggu pembayaran
    if (
      transactionStatus === "pending" ||
      transactionStatus === "authorize" ||
      transactionStatus === "challenge"
    ) {
      return res.json({
        success: false,
        status: "pending",
        message: "Payment is still pending.",
      });
    }

    // gagal / kadaluarsa / dibatalkan
    order.paymentStatus = "failed";
    await order.save();
    return res.json({
      success: false,
      status: transactionStatus,
      message: "Payment not completed.",
    });
  } catch (error) {
    const statusCode = error?.ApiResponse?.status_code || error?.data?.status_code;
    // Transaksi Snap yang belum dibuka/dibayar kadang belum terindeks di
    // endpoint status -> perlakukan sebagai pending, bukan error.
    if (statusCode === "404") {
      return res.json({
        success: false,
        status: "pending",
        message: "Payment is still pending.",
      });
    }
    console.error("❌ Verify error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error verifying payment." });
  }
};

// Helper: kurangi stok (idempotent)
const deductStock = async (order) => {
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
};

// ============================
//  MIDTRANS NOTIFICATION (WEBHOOK)
// ============================
export const midtransNotification = async (req, res) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
    } = req.body || {};

    if (!order_id) return res.status(400).json({ message: "order_id required" });

    // Validasi signature: sha512(order_id + status_code + gross_amount + serverKey)
    const raw = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expected = crypto.createHash("sha512").update(raw).digest("hex");
    if (expected !== signature_key) {
      console.warn("⚠️ Invalid Midtrans signature for", order_id);
      return res.status(403).json({ message: "Invalid signature" });
    }

    const order = await Order.findOne({ midtransOrderId: order_id });
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (transaction_status === "settlement" || transaction_status === "capture") {
      if (order.paymentStatus !== "completed") {
        await deductStock(order);
        order.paymentStatus = "completed";
      }
      order.paymentMethod = payment_type || order.paymentMethod;
      await order.save();
      console.log("✅ Webhook: order", order_id, "completed");
    } else if (
      transaction_status === "deny" ||
      transaction_status === "expire" ||
      transaction_status === "cancel" ||
      transaction_status === "failure"
    ) {
      order.paymentStatus = "failed";
      await order.save();
      console.log("❌ Webhook: order", order_id, "->", transaction_status);
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("❌ Notification error:", error);
    return res.status(500).json({ message: "Internal error" });
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
    if (!mongoose.isValidObjectId(orderId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });

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
