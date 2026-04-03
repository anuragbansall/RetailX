import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3003,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CART_SERVICE_URL: process.env.CART_SERVICE_URL || "http://localhost:3002",
  PRODUCT_SERVICE_URL:
    process.env.PRODUCT_SERVICE_URL || "http://localhost:3001",
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://localhost:3000",
};
