import ProductModel from "../models/Product.model.js";

export const getAllProducts = (req, res) => {
  res.send("All products");
};

export const getProductById = (req, res) => {
  const { id } = req.params;
  res.send(`Product with ID: ${id}`);
};

export const createProduct = async (req, res) => {
  try {
    const seller = req.user.id;
    const productData = req.body;

    // TODO: Handle image uploads

    const newProduct = await ProductModel.create({
      ...productData,
      seller,
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

export const updateProduct = (req, res) => {
  const { id } = req.params;
  res.send(`Product with ID: ${id} updated`);
};

export const deleteProduct = (req, res) => {
  const { id } = req.params;
  res.send(`Product with ID: ${id} deleted`);
};

export const getProductsBySeller = (req, res) => {
  // Only Seller can access this route
  res.send("Products by seller");
};
