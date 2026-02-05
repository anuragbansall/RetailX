import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import ProductModel from "../src/models/Product.model.js";

describe("GET /api/products/:id", () => {
  it("returns 404 when product not found", async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });

  it("returns product when found", async () => {
    const sellerId = new mongoose.Types.ObjectId();
    const product = await ProductModel.create({
      title: "Headphones",
      description: "Noise cancelling",
      price: { amount: 299, currency: "USD" },
      seller: sellerId,
      images: [],
      category: "audio",
      stock: 15,
    });
    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Headphones");
  });
});
