import OrderModel from "../models/order.model.js";
import { config } from "../config/index.js";
import axios from "axios";

export const createOrder = async (req, res) => {
  try {
    const user = req.user.id;

    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    const cart = await axios.get(`${config.CART_SERVICE_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!cart.data.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to retrieve cart data",
      });
    }

    const products = await Promise.all(
      cart.data.data.items.map(async (item) => {
        const productResponse = await axios.get(
          `${config.PRODUCT_SERVICE_URL}/api/products/${item.productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        return productResponse.data;
      }),
    );

    const address = await axios.get(
      `${config.AUTH_SERVICE_URL}/api/auth/me/addresses`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const defaultAddress = address.data.data.addresses.filter(
      (a) => a.isDefault,
    )[0];

    if (!defaultAddress) {
      return res.status(400).json({
        success: false,
        message: "No default address found for user",
      });
    }

    let totalPrice = 0;

    const orderItems = cart.data.data.items.map((item, index) => {
      if (products[index].data.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      const product = products[index].data;
      const itemTotal = product.price.amount * item.quantity;
      totalPrice += itemTotal;

      return {
        product: item.productId,
        quantity: item.quantity,
        price: {
          amount: itemTotal,
          currency: product.price.currency,
        },
      };
    });

    const order = await OrderModel.create({
      user,
      items: orderItems,
      totalPrice: {
        amount: totalPrice,
        currency: products[0].data.price.currency,
      },
      shippingAddress: defaultAddress,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsersOrders = async (req, res) => {
  try {
    const user = req.user.id;

    const orders = await OrderModel.find({ user }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const seller = req.user.id;

    const orders = await OrderModel.find({ "items.seller": seller }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Seller orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error retrieving seller orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    order.status = "CANCELLED";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderAddress = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { address } = req.body;
    const userId = req.user.id;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order",
      });
    }

    if (
      order.status === "CANCELLED" ||
      order.status === "DELIVERED" ||
      order.status === "SHIPPED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order address cannot be updated as the order is already cancelled, delivered, or shipped",
      });
    }

    order.shippingAddress = address;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order address updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
