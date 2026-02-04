import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import ProductModel from "../src/models/Product.model.js";

describe("GET /api/products", () => {
  beforeAll(async () => {
    await ProductModel.createCollection();
    await ProductModel.syncIndexes();
  });

  it("returns empty list initially", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Products retrieved successfully");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it("supports pagination and price filters", async () => {
    const sellerId = new mongoose.Types.ObjectId();
    await ProductModel.create([
      {
        title: "Phone X",
        description: "Great phone",
        price: { amount: 999, currency: "USD" },
        seller: sellerId,
        images: [],
        category: "electronics",
        stock: 10,
      },
      {
        title: "Phone Y",
        description: "Budget phone",
        price: { amount: 199, currency: "USD" },
        seller: sellerId,
        images: [],
        category: "electronics",
        stock: 20,
      },
      {
        title: "Laptop Z",
        description: "Powerful laptop",
        price: { amount: 1299, currency: "USD" },
        seller: sellerId,
        images: [],
        category: "computers",
        stock: 5,
      },
    ]);

    const res1 = await request(app)
      .get("/api/products")
      .query({ minPrice: 200, maxPrice: 1000 });
    expect(res1.status).toBe(200);
    expect(res1.body.data.map((p) => p.title).sort()).toEqual(
      ["Phone X"].sort(),
    );

    const res2 = await request(app)
      .get("/api/products")
      .query({ skip: 1, limit: 1 });
    expect(res2.status).toBe(200);
    expect(res2.body.data).toHaveLength(1);
  });
});
