import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
} from "../controllers/cartController.js";
import authUserMiddleware from "../middleware/authUserMiddleware.js"; // pastikan path dan nama file benar

const cartRouter = express.Router();

cartRouter.post("/add", authUserMiddleware, addToCart);
cartRouter.post("/remove", authUserMiddleware, removeFromCart);
cartRouter.post("/get", authUserMiddleware, getCart);

export default cartRouter;
