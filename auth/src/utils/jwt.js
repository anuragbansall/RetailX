import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const generateToken = (payload) => {
  const secret = config.JWT_SECRET;

  if (typeof secret !== "string" || secret.trim() === "") {
    throw new Error("JWT_SECRET is not configured properly.");
  }

  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token) => {
  const secret = config.JWT_SECRET;

  if (typeof secret !== "string" || secret.trim() === "") {
    throw new Error("JWT_SECRET is not configured properly.");
  }

  return jwt.verify(token, secret);
};
