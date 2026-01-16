import { verifyToken } from "../utils/jwt.js";
import redis from "../db/redis.js";

// Middleware to protect routes and ensure the user is authenticated
export const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if the token is blacklisted
    const isBlacklisted = await redis.get(`bl_${token}`);
    if (isBlacklisted) {
      console.warn("Token is blacklisted");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyToken(token); // if token is invalid, this will throw an error
    req.user = decoded; // Attach decoded token data to request object

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
