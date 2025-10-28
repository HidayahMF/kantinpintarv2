import jwt from "jsonwebtoken";

const authUserMiddleware = (req, res, next) => {
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


    req.userId = decoded.id || decoded.userId;
    req.isAdmin = decoded.isAdmin || false;

    if (!req.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    }

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
