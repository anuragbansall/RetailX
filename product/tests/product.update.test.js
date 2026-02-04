import request from "supertest";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import ProductModel from "../src/models/Product.model.js";
import { makeToken, setCookie } from "./helpers/auth.js";

// Mock ESM modules before importing app
jest.unstable_mockModule("../src/utils/uploadImages.js", () => ({
  uploadImages: jest.fn(),
}));
jest.unstable_mockModule("../src/utils/deleteImages.js", () => ({
  deleteImages: jest.fn(),
}));

let app;
let uploadImagesModule;
let deleteImagesModule;

beforeAll(async () => {
  ({ default: app } = await import("../src/app.js"));
  uploadImagesModule = await import("../src/utils/uploadImages.js");
  deleteImagesModule = await import("../src/utils/deleteImages.js");
});

describe("PUT /api/products/:id (update)", () => {
  it("returns 401 without token", async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app).put(`/api/products/${id}`).send({});
    expect(res.status).toBe(401);
  });

  it("returns 404 when product not found", async () => {
    const token = makeToken();
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/products/${id}`)
      .set("Cookie", setCookie(token))
      .send({ title: "New Title" });
    expect(res.status).toBe(404);
  });

  it("returns 403 when updating product not owned", async () => {
    const sellerA = new mongoose.Types.ObjectId();
    const sellerB = new mongoose.Types.ObjectId();
    const product = await ProductModel.create({
      title: "Item",
      description: "Desc",
      price: { amount: 10, currency: "USD" },
      seller: sellerA,
      images: [],
      category: "misc",
      stock: 1,
    });
    const token = makeToken({ id: sellerB.toString(), role: "seller" });
    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Cookie", setCookie(token))
      .send({ title: "Updated" });
    expect(res.status).toBe(403);
  });

  it("updates product fields", async () => {
    const seller = new mongoose.Types.ObjectId();
    const product = await ProductModel.create({
      title: "Desk",
      description: "Office",
      price: { amount: 120, currency: "USD" },
      seller,
      images: [],
      category: "furniture",
      stock: 2,
    });
    const token = makeToken({ id: seller.toString(), role: "seller" });
    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Cookie", setCookie(token))
      .send({ title: "Ergonomic Desk", stock: 4 });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Ergonomic Desk");
    expect(res.body.data.stock).toBe(4);
  });

  it("replaces images when files provided (mocks delete/upload)", async () => {
    const seller = new mongoose.Types.ObjectId();
    const product = await ProductModel.create({
      title: "Lamp",
      description: "LED",
      price: { amount: 30, currency: "USD" },
      seller,
      images: [{ url: "u", thumbnail: "t", fileId: "old" }],
      category: "home",
      stock: 1,
    });
    const token = makeToken({ id: seller.toString(), role: "seller" });
    const delMock = deleteImagesModule.deleteImages.mockResolvedValue();
    const upMock = uploadImagesModule.uploadImages.mockResolvedValue([
      { url: "nu", thumbnail: "nt", fileId: "new" },
    ]);

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set("Cookie", setCookie(token))
      .field("title", "Lamp 2")
      .attach("images", Buffer.from("fake"), "img.png");

    expect(res.status).toBe(200);
    expect(delMock).toHaveBeenCalled();
    expect(upMock).toHaveBeenCalled();
    expect(res.body.data.images[0].fileId).toBe("new");
  });
});
