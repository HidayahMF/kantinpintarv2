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
import adminRouter from "./routes/adminRoute.js";
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
  "http://localhost:5173",
  "http://localhost:5174",
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
app.use(express.json());

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRoutes);
app.use("/api/category", categoryRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/message", messageRouter);

// health
app.get("/", (req, res) => res.send("✅ API is running"));

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
