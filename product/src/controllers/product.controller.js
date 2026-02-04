import ProductModel from "../models/Product.model.js";
import imagekit from "../config/imagekit.js";
import { uploadImages } from "../utils/uploadImages.js";
import { deleteImages } from "../utils/deleteImages.js";

export const getAllProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, skip = 0, limit = 30 } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice) {
      filter["price.amount"] = {
        ...filter["price.amount"],
        $gte: Number(minPrice),
      };
    }

    if (maxPrice) {
      filter["price.amount"] = {
        ...filter["price.amount"],
        $lte: Number(maxPrice),
      };
    }

    const products = await ProductModel.find(filter)
      .skip(Number(skip))
      .limit(Number(limit));

    res.json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({
      message: "Failed to retrieve products",
      error: error && error.message ? error.message : "Internal server error",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error retrieving product by ID:", error);
    res.status(500).json({
      message: "Failed to retrieve product",
      error: error && error.message ? error.message : "Internal server error",
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const seller = req.user.id;
    const productData = req.body;

    const files = req.files || [];

    const uploadedImages = await uploadImages(files);

    const newProduct = await ProductModel.create({
      ...productData,
      seller,
      images: uploadedImages,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Failed to create product",
      error: error && error.message ? error.message : "Internal server error",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const existingProduct = await ProductModel.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (existingProduct.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update this product",
      });
    }

    const files = req.files || [];

    let uploadedImages = [];

    if (files.length > 0) {
      await deleteImages(existingProduct.images);
      uploadedImages = await uploadImages(files);
      productData.images = uploadedImages;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      productData,
      { new: true },
    );

    res.json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Failed to update product",
      error: error && error.message ? error.message : "Internal server error",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await ProductModel.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (existingProduct.seller.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this product",
      });
    }

    await deleteImages(existingProduct.images);

    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    res.json({
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: error && error.message ? error.message : "Internal server error",
    });
  }
};

export const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const products = await ProductModel.find({ seller: sellerId });

    res.json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error retrieving products by seller:", error);
    res.status(500).json({
      message: "Failed to retrieve products",
      error: error && error.message ? error.message : "Internal server error",
    });
  }
};
