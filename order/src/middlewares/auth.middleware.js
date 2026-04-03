import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const getMiddleware = (roles = ["user"]) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Access is denied" });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
};
