import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import stripePackage from "stripe";
import { connectDB } from "./config/db.js";

import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js"; // ✅ aktifkan
import cartRouter from "./routes/cartRoute.js"; // ✅ aktifkan bila sudah ada

import authUserMiddleware from "./middleware/authUserMiddleware.js";
import * as orderController from "./controllers/orderController.js";

const app = express();
const port = process.env.PORT || 4000;

// 🔍 Cek environment variables wajib
const requiredEnv = ["JWT_SECRET", "STRIPE_SECRET_KEY", "FRONTEND_URL"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// 🔑 Setup Stripe
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

// 📁 Pastikan folder uploads tersedia
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ⚙️ Middleware umum
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use("/uploads", express.static(uploadsDir));
app.use(express.json());

// ✅ ROUTES
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter); // 🔥 tambahkan ini agar login/register berfungsi
app.use("/api/cart", cartRouter); // opsional jika sudah ada

// 🧾 Order routes
app.post("/api/order/place", authUserMiddleware, orderController.placeOrder);

// 🩺 Health Check
app.get("/", (req, res) => res.send("✅ API is running successfully!"));

// 🚀 Jalankan server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
