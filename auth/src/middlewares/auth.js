import { verifyToken } from "../utils/jwt.js";

// Middleware to protect routes and ensure the user is authenticated
export const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token); // if token is invalid, this will throw an error
    req.user = decoded; // Attach decoded token data to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
