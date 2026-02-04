import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import ProductModel from "../src/models/Product.model.js";
import { makeToken, setCookie } from "./helpers/auth.js";

describe("GET /api/products/seller (auth)", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/products/seller");
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-seller role", async () => {
    const token = makeToken({
      id: new mongoose.Types.ObjectId().toString(),
      role: "user",
    });
    const res = await request(app)
      .get("/api/products/seller")
      .set("Cookie", setCookie(token));
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/);
  });

  it("returns products owned by seller", async () => {
    const sellerA = new mongoose.Types.ObjectId();
    const sellerB = new mongoose.Types.ObjectId();
    await ProductModel.create([
      {
        title: "A1",
        description: "A",
        price: { amount: 10, currency: "USD" },
        seller: sellerA,
        images: [],
        category: "misc",
        stock: 1,
      },
      {
        title: "B1",
        description: "B",
        price: { amount: 20, currency: "USD" },
        seller: sellerB,
        images: [],
        category: "misc",
        stock: 1,
      },
    ]);
    const token = makeToken({ id: sellerA.toString(), role: "seller" });
    const res = await request(app)
      .get("/api/products/seller")
      .set("Cookie", setCookie(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("A1");
  });
});
