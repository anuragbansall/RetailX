import request from "supertest";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import ProductModel from "../src/models/Product.model.js";
import { makeToken, setCookie } from "./helpers/auth.js";

jest.unstable_mockModule("../src/utils/deleteImages.js", () => ({
  deleteImages: jest.fn(),
}));

let app;
let deleteImagesModule;

beforeAll(async () => {
  ({ default: app } = await import("../src/app.js"));
  deleteImagesModule = await import("../src/utils/deleteImages.js");
});

describe("DELETE /api/products/:id", () => {
  it("returns 401 without token", async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`/api/products/${id}`);
    expect(res.status).toBe(401);
  });

  it("returns 404 when product not found", async () => {
    const token = makeToken();
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set("Cookie", setCookie(token));
    expect(res.status).toBe(404);
  });

  it("returns 403 when deleting product not owned", async () => {
    const sellerA = new mongoose.Types.ObjectId();
    const sellerB = new mongoose.Types.ObjectId();
    const product = await ProductModel.create({
      title: "Mouse",
      description: "Wireless",
      price: { amount: 25, currency: "USD" },
      seller: sellerA,
      images: [],
      category: "computers",
      stock: 3,
    });
    const token = makeToken({ id: sellerB.toString(), role: "seller" });
    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Cookie", setCookie(token));
    expect(res.status).toBe(403);
  });

  it("deletes product and calls deleteImages", async () => {
    const seller = new mongoose.Types.ObjectId();
    const product = await ProductModel.create({
      title: "Keyboard",
      description: "Mechanical",
      price: { amount: 80, currency: "USD" },
      seller,
      images: [{ url: "u", thumbnail: "t", fileId: "fid" }],
      category: "computers",
      stock: 7,
    });
    const token = makeToken({ id: seller.toString(), role: "seller" });
    const delMock = deleteImagesModule.deleteImages.mockResolvedValue();
    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Cookie", setCookie(token));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product deleted successfully");
    expect(delMock).toHaveBeenCalled();
  });
});
