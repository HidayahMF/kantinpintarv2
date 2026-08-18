import express from "express";
import multer from "multer";
import path from "path";
import {
  addFood,
  listFood,
  removeFood,
  updateFood,
  addReview,
} from "../controllers/foodController.js";
import authUserMiddleware from "../middleware/authUserMiddleware.js";
import authAdminMiddleware from "../middleware/authAdminMiddleware.js";

const foodRouter = express.Router();

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Multer setup
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP, GIF) are allowed"));
    }
  },
});

// Multer error handler (returns JSON 400 instead of HTML 500)
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err && err.message && err.message.includes("Only image files")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

// Routes
foodRouter.post("/add", authAdminMiddleware, upload.single("image"), handleMulterError, addFood);
foodRouter.get("/list", listFood);
foodRouter.delete("/remove/:id", authAdminMiddleware, removeFood);
foodRouter.put("/update/:id", authAdminMiddleware, upload.single("image"), handleMulterError, updateFood);
foodRouter.post("/review", authUserMiddleware, addReview);

export default foodRouter;
