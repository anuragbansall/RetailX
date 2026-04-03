import express from "express";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  getSellerOrders,
  getUsersOrders,
  updateOrderAddress,
} from "../controllers/order.controller.js";
import { getMiddleware } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  cancelOrderValidation,
  createOrderValidation,
  getOrderByIdValidation,
  getSellerOrdersValidation,
  getUsersOrdersValidation,
  updateOrderAddressValidation,
} from "../validations/order.validation.js";

const orderRouter = express.Router();

orderRouter.get(
  "/me",
  getMiddleware(["user"]),
  getUsersOrdersValidation,
  validateRequest,
  getUsersOrders,
);

orderRouter.get(
  "/seller",
  getMiddleware(["seller"]),
  getSellerOrdersValidation,
  validateRequest,
  getSellerOrders,
);

orderRouter.get(
  "/:id",
  getMiddleware(["user", "seller"]),
  getOrderByIdValidation,
  validateRequest,
  getOrderById,
);

orderRouter.post(
  "/",
  getMiddleware(["user"]),
  createOrderValidation,
  validateRequest,
  createOrder,
);

orderRouter.post(
  "/:id/cancel",
  getMiddleware(["user"]),
  cancelOrderValidation,
  validateRequest,
  cancelOrder,
);

orderRouter.post(
  "/:id/address",
  getMiddleware(["user"]),
  updateOrderAddressValidation,
  validateRequest,
  updateOrderAddress,
);

export default orderRouter;
