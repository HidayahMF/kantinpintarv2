import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import stripePackage from "stripe";
import { connectDB } from "../config/db.js";

import foodRouter from "../routes/foodRoute.js";
import userRouter from "../routes/userRoute.js";
import cartRouter from "../routes/cartRoute.js";
import orderRouter from "../routes/orderRoute.js";
import categoryRoute from "../routes/categoryRoute.js";
import subCategoryRoute from "../routes/subcategoryRoute.js";
import adminRouter from "../routes/adminRoute.js";

import authUserMiddleware from "../middleware/authUserMiddleware.js";
import * as orderController from "../controllers/orderController.js";
import messageRoute from "../routes/messageRoute.js";

// ENV check
const requiredEnv = ["JWT_SECRET", "STRIPE_SECRET_KEY", "FRONTEND_URL"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ ${key} environment variable is missing!`);
    throw new Error(`${key} environment variable is missing!`);
  }
}

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use("/uploads", express.static(uploadsDir));
app.use(express.json());

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/category", categoryRoute);
app.use("/api/subcategory", subCategoryRoute);
app.use("/api/admin", adminRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/message", messageRoute);

app.post("/api/order/place", authUserMiddleware, orderController.placeOrder);

app.get("/", (req, res) => {
  res.send("✅ API is working");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express.js + Vercel!" });
});

// Database connect - hanya connect sekali (untuk Vercel serverless & dev)
let dbConnected = false;
export const ensureDBConnected = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
    console.log("✅ MongoDB connected");
  }
};

export default app;
