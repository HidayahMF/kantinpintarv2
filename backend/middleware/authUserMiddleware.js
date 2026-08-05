import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authUserMiddleware = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

    // Muat user asli dari database (bukan hanya klaim token)
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.userId = userId;
    req.isAdmin = Boolean(user.isAdmin);
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authUserMiddleware;
