import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";

const createOrder = jest.fn((req, res) =>
  res.status(201).json({ success: true, route: "createOrder" }),
);
const getUsersOrders = jest.fn((req, res) =>
  res.status(200).json({ success: true, route: "getUsersOrders" }),
);
const getSellerOrders = jest.fn((req, res) =>
  res.status(200).json({ success: true, route: "getSellerOrders" }),
);
const getOrderById = jest.fn((req, res) =>
  res.status(200).json({ success: true, route: "getOrderById" }),
);
const cancelOrder = jest.fn((req, res) =>
  res.status(200).json({ success: true, route: "cancelOrder" }),
);
const updateOrderAddress = jest.fn((req, res) =>
  res.status(200).json({ success: true, route: "updateOrderAddress" }),
);

jest.unstable_mockModule("../src/controllers/order.controller.js", () => ({
  createOrder,
  getUsersOrders,
  getSellerOrders,
  getOrderById,
  cancelOrder,
  updateOrderAddress,
}));

const { default: app } = await import("../src/app.js");

const makeToken = (role = "user", id = "507f1f77bcf86cd799439011") =>
  jwt.sign({ id, role }, process.env.JWT_SECRET);

const withAuth = (req, token) => req.set("Authorization", `Bearer ${token}`);

describe("Order routes", () => {
  const validOrderId = "507f1f77bcf86cd799439012";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication and authorization", () => {
    it("returns 401 for missing token", async () => {
      const res = await request(app).get("/api/orders/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
      expect(getUsersOrders).not.toHaveBeenCalled();
    });

    it("returns 401 for invalid jwt", async () => {
      const res = await request(app)
        .get("/api/orders/me")
        .set("Authorization", "Bearer not-a-valid-jwt");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid token/i);
      expect(getUsersOrders).not.toHaveBeenCalled();
    });

    it("returns 403 when user role accesses seller route", async () => {
      const token = makeToken("user");

      const res = await withAuth(request(app).get("/api/orders/seller"), token);

      expect(res.status).toBe(403);
      expect(getSellerOrders).not.toHaveBeenCalled();
    });

    it("allows seller role on seller route", async () => {
      const token = makeToken("seller");

      const res = await withAuth(request(app).get("/api/orders/seller"), token);

      expect(res.status).toBe(200);
      expect(getSellerOrders).toHaveBeenCalledTimes(1);
    });
  });

  describe("route protections and validations", () => {
    it("allows user to access own orders route", async () => {
      const token = makeToken("user");

      const res = await withAuth(request(app).get("/api/orders/me"), token);

      expect(res.status).toBe(200);
      expect(getUsersOrders).toHaveBeenCalledTimes(1);
    });

    it("rejects invalid order id for get by id", async () => {
      const token = makeToken("user");

      const res = await withAuth(
        request(app).get("/api/orders/not-a-mongo-id"),
        token,
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(getOrderById).not.toHaveBeenCalled();
    });

    it("allows user or seller on get by id with valid id", async () => {
      const token = makeToken("seller");

      const res = await withAuth(
        request(app).get(`/api/orders/${validOrderId}`),
        token,
      );

      expect(res.status).toBe(200);
      expect(getOrderById).toHaveBeenCalledTimes(1);
    });

    it("rejects seller creating an order", async () => {
      const token = makeToken("seller");

      const res = await withAuth(request(app).post("/api/orders"), token);

      expect(res.status).toBe(403);
      expect(createOrder).not.toHaveBeenCalled();
    });

    it("rejects invalid order id for cancel", async () => {
      const token = makeToken("user");

      const res = await withAuth(
        request(app).post("/api/orders/abc/cancel"),
        token,
      );

      expect(res.status).toBe(400);
      expect(cancelOrder).not.toHaveBeenCalled();
    });

    it("rejects invalid address payload for update address", async () => {
      const token = makeToken("user");

      const res = await withAuth(
        request(app)
          .post(`/api/orders/${validOrderId}/address`)
          .send({
            address: { city: "Mumbai" },
          }),
        token,
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(updateOrderAddress).not.toHaveBeenCalled();
    });

    it("accepts valid address payload for update address", async () => {
      const token = makeToken("user");

      const res = await withAuth(
        request(app)
          .post(`/api/orders/${validOrderId}/address`)
          .send({
            address: {
              street: "221B Baker Street",
              city: "London",
              state: "Greater London",
              country: "UK",
              zipCode: "NW1",
            },
          }),
        token,
      );

      expect(res.status).toBe(200);
      expect(updateOrderAddress).toHaveBeenCalledTimes(1);
    });
  });
});
