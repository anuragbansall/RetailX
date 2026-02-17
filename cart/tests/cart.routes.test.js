import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../src/app.js";

const makeAuthCookie = (userId, role = "user") => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET);
  return [`token=${token}`];
};

const newObjectId = () => new mongoose.Types.ObjectId().toString();

describe("Cart Routes Security & Functionality", () => {
  describe("Auth protection", () => {
    it("rejects when no token (401)", async () => {
      const res = await request(app).get("/api/cart");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Unauthorized: No token provided" });
    });

    it("rejects with invalid token (401)", async () => {
      const res = await request(app)
        .get("/api/cart")
        .set("Cookie", ["token=invalid.jwt.token"]);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Unauthorized: Invalid token" });
    });

    it("rejects wrong role (403)", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId, "admin");
      const res = await request(app).get("/api/cart").set("Cookie", cookie);
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: "Forbidden: Access is denied" });
    });
  });

  describe("GET /api/cart", () => {
    it("returns 404 when cart does not exist", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId);
      const res = await request(app).get("/api/cart").set("Cookie", cookie);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Cart not found" });
    });

    it("returns existing cart after adding item", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId);
      const productId = newObjectId();

      const addRes = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId, quantity: 2 });
      expect(addRes.status).toBe(200);
      expect(addRes.body.success).toBe(true);

      const res = await request(app).get("/api/cart").set("Cookie", cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].productId).toBe(productId);
      expect(res.body.data.items[0].quantity).toBe(2);
    });
  });

  describe("POST /api/cart (addToCart)", () => {
    it("validates missing productId (400)", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ quantity: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.errors.some((e) => e.param === "productId")).toBe(true);
    });

    it("validates invalid productId format (400)", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId: "not-a-mongo-id", quantity: 1 });
      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.param === "productId")).toBe(true);
    });

    it("validates missing quantity (400)", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId: newObjectId() });
      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.param === "quantity")).toBe(true);
    });

    it("validates invalid quantity (non-integer or <1) (400)", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const productId = newObjectId();

      const res1 = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId, quantity: 0 });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId, quantity: "abc" });
      expect(res2.status).toBe(400);
    });

    it("adds new item and increments existing item quantity", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId);
      const productA = newObjectId();
      const productB = newObjectId();

      const addA1 = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId: productA, quantity: 1 });
      expect(addA1.status).toBe(200);

      const addA2 = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId: productA, quantity: 3 });
      expect(addA2.status).toBe(200);

      const addB = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId: productB, quantity: 2 });
      expect(addB.status).toBe(200);

      const getRes = await request(app).get("/api/cart").set("Cookie", cookie);
      expect(getRes.status).toBe(200);
      const items = getRes.body.data.items;
      const itemA = items.find((i) => i.productId === productA);
      const itemB = items.find((i) => i.productId === productB);
      expect(itemA.quantity).toBe(4);
      expect(itemB.quantity).toBe(2);
    });
  });

  describe("PATCH /api/cart/:id (updateCartItem)", () => {
    it("validates invalid id param (400)", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app)
        .patch("/api/cart/not-a-mongo-id")
        .set("Cookie", cookie)
        .send({ quantity: 2 });
      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.param === "id")).toBe(true);
    });

    it("validates quantity (400)", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app)
        .patch(`/api/cart/${newObjectId()}`)
        .set("Cookie", cookie)
        .send({ quantity: 0 });
      expect(res.status).toBe(400);
    });

    it("returns 404 when cart does not exist", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app)
        .patch(`/api/cart/${newObjectId()}`)
        .set("Cookie", cookie)
        .send({ quantity: 2 });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Cart not found" });
    });

    it("returns 404 when item does not exist", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId);
      const productId = newObjectId();
      await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId, quantity: 1 });

      const res = await request(app)
        .patch(`/api/cart/${newObjectId()}`)
        .set("Cookie", cookie)
        .send({ quantity: 2 });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Cart item not found" });
    });

    it("updates item quantity (200)", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId);
      const productId = newObjectId();

      await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId, quantity: 1 });

      const cartRes = await request(app).get("/api/cart").set("Cookie", cookie);
      const itemId = cartRes.body.data.items[0]._id;

      const updateRes = await request(app)
        .patch(`/api/cart/${itemId}`)
        .set("Cookie", cookie)
        .send({ quantity: 5 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      const updatedItem = updateRes.body.data.items.find(
        (i) => i._id === itemId,
      );
      expect(updatedItem.quantity).toBe(5);
    });
  });

  describe("DELETE /api/cart/:id (deleteCartItem)", () => {
    it("validates invalid id param (400)", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app)
        .delete("/api/cart/not-a-mongo-id")
        .set("Cookie", cookie);
      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.param === "id")).toBe(true);
    });

    it("returns 404 when cart does not exist", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app)
        .delete(`/api/cart/${newObjectId()}`)
        .set("Cookie", cookie);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Cart not found" });
    });

    it("returns 404 when item not found", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId);
      const productId = newObjectId();
      await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId, quantity: 1 });

      const res = await request(app)
        .delete(`/api/cart/${newObjectId()}`)
        .set("Cookie", cookie);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Cart item not found" });
    });

    it("deletes item (200)", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId);
      const productId = newObjectId();
      await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId, quantity: 1 });

      const cartRes = await request(app).get("/api/cart").set("Cookie", cookie);
      const itemId = cartRes.body.data.items[0]._id;

      const delRes = await request(app)
        .delete(`/api/cart/${itemId}`)
        .set("Cookie", cookie);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      expect(delRes.body.data.items.length).toBe(0);
    });
  });

  describe("DELETE /api/cart (clearCart)", () => {
    it("returns 404 when cart does not exist", async () => {
      const cookie = makeAuthCookie(newObjectId());
      const res = await request(app).delete("/api/cart").set("Cookie", cookie);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Cart not found" });
    });

    it("clears cart (200) and resets items/totalPrice", async () => {
      const userId = newObjectId();
      const cookie = makeAuthCookie(userId);
      const productId = newObjectId();

      await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId, quantity: 3 });

      const res = await request(app).delete("/api/cart").set("Cookie", cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(0);
      expect(res.body.data.totalPrice).toBe(0);
    });
  });
});
