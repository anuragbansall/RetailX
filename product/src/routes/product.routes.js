import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsBySeller,
  updateProduct,
} from "../controllers/product.controller.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  createProductValidation,
  updateProductValidation,
} from "../validations/product.validation.js";
import { getMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.js";
import normalizeFormData from "../middlewares/normalizeFormData.js";


const productRouter = express.Router();

productRouter.get("/", getAllProducts);

productRouter.get("/seller", getMiddleware(["seller"]), getProductsBySeller);

productRouter.get("/:id", getProductById);

productRouter.post(
  "/",
  getMiddleware(["seller"]),
  upload.array("images", 5), // Accept up to 5 images
  normalizeFormData,
  createProductValidation,
  validateRequest,
  createProduct,
);

productRouter.put(
  "/:id",
  getMiddleware(["seller"]),
  upload.array("images", 5),
  normalizeFormData,
  updateProductValidation,
  validateRequest,
  updateProduct,
);

productRouter.delete("/:id", getMiddleware(["seller"]), deleteProduct);

export default productRouter;
