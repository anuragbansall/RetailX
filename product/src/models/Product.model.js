import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["USD", "INR"],
      default: "INR",
    },
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      thumbnail: {
        type: String,
        required: true,
      },
      fileId: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Create text index for search functionality on title, description, and category fields
ProductSchema.index({ title: "text", description: "text", category: "text" });

const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;
