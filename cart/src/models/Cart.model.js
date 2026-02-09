import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtAddition: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

const CartModel = mongoose.model("Cart", CartSchema);

export default CartModel;
