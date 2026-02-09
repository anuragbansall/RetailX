import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app.js";

// Helper to create JWT and Cookie header
const createToken = (role = "user", payload = {}) => {
  const secret = process.env.JWT_SECRET || "testsecret";
  const token = jwt.sign({ id: "user123", role, ...payload }, secret);
  const cookie = [`token=${token}`];
  return { token, cookie };
};

describe("Cart routes", () => {
  describe("Auth middleware behavior", () => {
    it("rejects when no token is provided", async () => {
      const res = await request(app).get("/api/cart");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Unauthorized: No token provided" });
    });

    it("rejects when token is invalid", async () => {
      const res = await request(app)
        .get("/api/cart")
        .set("Cookie", ["token=invalid.token.value"]);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: "Unauthorized: Invalid token" });
    });

    it("rejects when role is not authorized", async () => {
      const { cookie } = createToken("admin");
      const res = await request(app).get("/api/cart").set("Cookie", cookie);
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: "Forbidden: Access is denied" });
    });
  });

  describe("GET /api/cart", () => {
    it("returns cart for authenticated user", async () => {
      const { cookie } = createToken("user");
      const res = await request(app).get("/api/cart").set("Cookie", cookie);
      expect(res.status).toBe(200);
      expect(res.text).toBe("Get cart");
    });
  });

  describe("POST /api/cart", () => {
    it("adds item to cart for authenticated user", async () => {
      const { cookie } = createToken("user");
      const res = await request(app)
        .post("/api/cart")
        .set("Cookie", cookie)
        .send({ productId: "p1", quantity: 2 });
      expect(res.status).toBe(200);
      expect(res.text).toBe("Add to cart");
    });
  });

  describe("PATCH /api/cart/:id", () => {
    it("updates cart item for authenticated user", async () => {
      const { cookie } = createToken("user");
      const res = await request(app)
        .patch("/api/cart/123")
        .set("Cookie", cookie)
        .send({ quantity: 3 });
      expect(res.status).toBe(200);
      expect(res.text).toBe("Update cart item");
    });
  });

  describe("DELETE /api/cart/:id", () => {
    it("deletes cart item for authenticated user", async () => {
      const { cookie } = createToken("user");
      const res = await request(app)
        .delete("/api/cart/123")
        .set("Cookie", cookie);
      expect(res.status).toBe(200);
      expect(res.text).toBe("Delete cart item");
    });
  });

  describe("DELETE /api/cart", () => {
    it("clears cart for authenticated user", async () => {
      const { cookie } = createToken("user");
      const res = await request(app).delete("/api/cart").set("Cookie", cookie);
      expect(res.status).toBe(200);
      expect(res.text).toBe("Clear cart");
    });
  });
});
