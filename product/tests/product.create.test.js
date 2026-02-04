import request from "supertest";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { makeToken, setCookie } from "./helpers/auth.js";

// Mock uploadImages ESM module before importing app
jest.unstable_mockModule("../src/utils/uploadImages.js", () => ({
  uploadImages: jest.fn(),
}));

let app;
let uploadImagesModule;

beforeAll(async () => {
  ({ default: app } = await import("../src/app.js"));
  uploadImagesModule = await import("../src/utils/uploadImages.js");
});

describe("POST /api/products (create)", () => {
  it("requires authentication and seller role", async () => {
    const resNoAuth = await request(app).post("/api/products").send({});
    expect(resNoAuth.status).toBe(401);

    const tokenUser = makeToken({
      id: new mongoose.Types.ObjectId().toString(),
      role: "user",
    });
    const resForbidden = await request(app)
      .post("/api/products")
      .set("Cookie", setCookie(tokenUser))
      .send({});
    expect(resForbidden.status).toBe(403);
  });

  it("fails validation for missing required fields", async () => {
    const token = makeToken();
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", setCookie(token))
      .send({ title: "Bad Product" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it("creates product with JSON body", async () => {
    const token = makeToken();
    const payload = {
      title: "Chair",
      description: "Comfortable",
      price: { amount: 49.99, currency: "USD" },
      category: "furniture",
      stock: 5,
    };
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", setCookie(token))
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Chair");
    expect(res.body.data.seller).toBeDefined();
  });

  it("creates product with multipart and images (mocks upload)", async () => {
    const token = makeToken();
    const uploadMock = uploadImagesModule.uploadImages.mockResolvedValue([
      { url: "http://img/1", thumbnail: "http://img/t1", fileId: "f1" },
    ]);
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", setCookie(token))
      .field("title", "Table")
      .field("description", "Wooden")
      .field("price.amount", "99.5")
      .field("price.currency", "USD")
      .field("category", "furniture")
      .field("stock", "3")
      .attach("images", Buffer.from("fake"), "image1.png");

    expect(res.status).toBe(201);
    expect(uploadMock).toHaveBeenCalled();
    expect(res.body.data.images).toHaveLength(1);
    expect(res.body.data.images[0].fileId).toBe("f1");
  });
});
