import jwt from "jsonwebtoken";

const authAdminMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;

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
