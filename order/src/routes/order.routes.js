import express from "express";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  getSellerOrders,
  getUsersOrders,
  updateOrderAddress,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.get("/me", getUsersOrders);

orderRouter.get("/seller", getSellerOrders);

orderRouter.get("/:id", getOrderById);

orderRouter.post("/", createOrder);

orderRouter.post("/:id/cancel", cancelOrder);

orderRouter.post("/:id/address", updateOrderAddress);

export default orderRouter;
