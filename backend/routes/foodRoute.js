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

// Multer setup
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Routes
foodRouter.post("/add", authAdminMiddleware, upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.delete("/remove/:id", authAdminMiddleware, removeFood);
foodRouter.put("/update/:id", authAdminMiddleware, upload.single("image"), updateFood);
foodRouter.post("/review", authUserMiddleware, addReview);

export default foodRouter;
