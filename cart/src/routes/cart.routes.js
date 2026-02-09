import express from "express";
import {
  addToCart,
  clearCart,
  deleteCartItem,
  getCart,
  updateCartItem,
} from "./cart.controller.js";
import { getMiddleware } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  addToCartValidation,
  updateCartItemValidation,
  deleteCartItemValidation,
} from "../validations/cart.validation.js";

const cartRouter = express.Router();

cartRouter.get("/", getMiddleware("user"), getCart);
cartRouter.post(
  "/",
  getMiddleware("user"),
  addToCartValidation,
  validateRequest,
  addToCart,
);
cartRouter.patch(
  "/:id",
  getMiddleware("user"),
  updateCartItemValidation,
  validateRequest,
  updateCartItem,
);
cartRouter.delete(
  "/:id",
  getMiddleware("user"),
  deleteCartItemValidation,
  validateRequest,
  deleteCartItem,
);
cartRouter.delete("/", getMiddleware("user"), clearCart);

export default cartRouter;
