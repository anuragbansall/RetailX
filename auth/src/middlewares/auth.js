import { verifyToken } from "../utils/jwt.js";
import redis from "../db/redis.js";

// Middleware to protect routes and ensure the user is authenticated
export const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if the token is blacklisted
  let isBlacklisted = false;

  try {
    isBlacklisted = (await redis.get(`bl_${token}`)) !== null;
  } catch (error) {
    console.error("Error checking token blacklist in Redis:", error);
  }

  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
