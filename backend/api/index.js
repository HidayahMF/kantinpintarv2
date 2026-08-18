import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { connectDB } from "../config/db.js";

import foodRouter from "../routes/foodRoute.js";
import userRouter from "../routes/userRoute.js";
import cartRouter from "../routes/cartRoute.js";
import orderRouter from "../routes/orderRoute.js";
import categoryRoute from "../routes/categoryRoute.js";
import subCategoryRoute from "../routes/subcategoryRoute.js";

import messageRoute from "../routes/messageRoute.js";

// ENV check
const requiredEnv = ["JWT_SECRET", "MIDTRANS_SERVER_KEY", "MIDTRANS_CLIENT_KEY", "FRONTEND_URL", "MONGO_URI"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ ${key} environment variable is missing!`);
    throw new Error(`${key} environment variable is missing!`);
  }
}

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const normalizeOrigin = (u) => (u ? u.replace(/\/+$/, "") : u);
const allowedOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL),
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173", "http://localhost:5174"] : []),
].filter(Boolean);

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(normalizeOrigin(origin)))
        return cb(null, true);
      return cb(new Error("CORS not allowed"), false);
    },
    credentials: true,
  })
);
app.use("/uploads", express.static(uploadsDir));
app.use(express.json({ limit: "1mb" }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Rate limiting (in-memory, same as server.js)
const authRateLimit = (() => {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, expires] of hits) {
      if (now > expires) hits.delete(key);
    }
  }, 10 * 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxAttempts = 10;

    const entry = hits.get(key);
    if (entry && entry.count >= maxAttempts && now < entry.expires) {
      return res.status(429).json({ success: false, message: "Too many requests, try again later." });
    }

    if (!entry || now > entry.expires) {
      hits.set(key, { count: 1, expires: now + windowMs });
    } else {
      entry.count++;
    }
    next();
  };
})();

// Ensure DB connection before any route handler (critical for Vercel serverless)
let dbConnected = false;
app.use(async (req, res, next) => {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
    next();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    return res.status(503).json({ success: false, message: "Service unavailable" });
  }
});

app.use("/api/user/login", authRateLimit);
app.use("/api/user/register", authRateLimit);
app.use("/api/user/login-admin", authRateLimit);

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/category", categoryRoute);
app.use("/api/subcategory", subCategoryRoute);
app.use("/api/message", messageRoute);

app.get("/", (req, res) => {
  res.send("✅ API is working");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler — always returns JSON, never HTML
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error",
  });
});

export default app;
