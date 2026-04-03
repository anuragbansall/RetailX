import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
          required: true,
        },
        price: {
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
          currency: {
            type: String,
            required: true,
            enum: ["INR", "USD"],
            default: "INR",
          },
        },
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      required: true,
    },
    totalPrice: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        required: true,
        enum: ["INR", "USD"],
        default: "INR",
      },
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
