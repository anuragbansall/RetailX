import express from "express";
import {
  addToCart,
  clearCart,
  deleteCartItem,
  getCart,
  updateCartItem,
} from "./cart.controller.js";
import { getMiddleware } from "../middlewares/auth.middleware.js";

const cartRouter = express.Router();

cartRouter.get("/", getMiddleware("user"), getCart);
cartRouter.post("/", getMiddleware("user"), addToCart);
cartRouter.patch("/:id", getMiddleware("user"), updateCartItem);
cartRouter.delete("/:id", getMiddleware("user"), deleteCartItem);
cartRouter.delete("/", getMiddleware("user"), clearCart);

export default cartRouter;
