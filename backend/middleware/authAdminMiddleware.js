import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authAdminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id).select("isAdmin");
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.userId = decoded.id;
    req.isAdmin = true;

    next();
  } catch (error) {
    console.error("Auth Admin Middleware Error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    } else {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
};

export default authAdminMiddleware;
