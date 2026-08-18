import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { connectDB } from "./config/db.js";
import orderRoutes from "./routes/orderRoute.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import subCategoryRouter from "./routes/subcategoryRoute.js";
import messageRouter from "./routes/messageRoute.js";

const app = express();
const port = process.env.PORT || 4000;


const requiredEnv = [
  "JWT_SECRET",
  "MIDTRANS_SERVER_KEY",
  "MIDTRANS_CLIENT_KEY",
  "FRONTEND_URL",
  "MONGO_URI",
];
requiredEnv.forEach((k) => {
  if (!process.env[k]) {
    console.error(`❌ Missing required env: ${k}`);
    process.exit(1);
  }
});

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const normalizeOrigin = (u) => (u ? u.replace(/\/+$/, "") : u);
const allowedOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL),
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173", "http://localhost:5174"] : []),
].filter(Boolean);

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

// Simple in-memory rate limiter for auth endpoints
const authAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

// Rate limit for all auth-related POST endpoints
const authRateLimit = (req, res, next) => {
  if (req.method !== "POST") return next();
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const attempts = authAttempts.get(ip) || [];
  const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ success: false, message: "Too many attempts. Please try again later." });
  }
  recent.push(now);
  authAttempts.set(ip, recent);
  next();
};

app.use("/api/user/login", authRateLimit);
app.use("/api/user/register", authRateLimit);
app.use("/api/user/login-admin", authRateLimit);

// Cleanup rate limiter map every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of authAttempts) {
    const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW);
    if (recent.length === 0) authAttempts.delete(ip);
    else authAttempts.set(ip, recent);
  }
}, 10 * 60 * 1000);

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRoutes);
app.use("/api/category", categoryRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/message", messageRouter);

// health
app.get("/", (req, res) => res.send("✅ API is running"));

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

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () =>
      console.log(`🚀 Server running at http://localhost:${port}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
