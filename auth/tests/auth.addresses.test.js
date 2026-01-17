import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import User from "../src/models/User.model.js";

// Helper to register a user and return cookie + response
const registerUserAndGetCookie = async (overrides = {}) => {
  const payload = {
    username: overrides.username || "addruser",
    email: overrides.email || "addruser@example.com",
    password: overrides.password || "StrongP@ssw0rd",
    fullName: overrides.fullName || { firstName: "Addr", lastName: "User" },
    addresses: overrides.addresses, // optional
  };

  const res = await request(app).post("/api/auth/register").send(payload);
  const setCookie = res.headers["set-cookie"] || [];
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return { res, cookie, payload };
};

describe("Addresses API", () => {
  describe("GET /api/auth/me/addresses", () => {
    it("returns 200 and current user's addresses when authenticated", async () => {
      const initialAddresses = [
        {
          street: "123 Main St",
          city: "Springfield",
          state: "IL",
          zipCode: "62701",
          country: "USA",
        },
        {
          street: "456 Second Ave",
          city: "Shelbyville",
          state: "IL",
          zipCode: "62565",
          country: "USA",
        },
      ];

      const { cookie } = await registerUserAndGetCookie({
        username: "getaddruser",
        email: "getaddruser@example.com",
        addresses: initialAddresses,
      });

      const res = await request(app)
        .get("/api/auth/me/addresses")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body?.data?.addresses).toBeDefined();
      expect(Array.isArray(res.body.data.addresses)).toBe(true);
      expect(res.body.data.addresses.length).toBe(initialAddresses.length);
      // Basic field checks
      expect(res.body.data.addresses[0].street).toBe(
        initialAddresses[0].street,
      );
      expect(res.body.data.addresses[1].city).toBe(initialAddresses[1].city);
    });

    it("returns 401 when no auth cookie is provided", async () => {
      const res = await request(app).get("/api/auth/me/addresses");
      expect(res.status).toBe(401);
      expect(res.body?.message).toBeDefined();
    });

    it("returns 404 when user does not exist anymore", async () => {
      const { res: regRes, cookie } = await registerUserAndGetCookie({
        username: "ghostaddr",
        email: "ghostaddr@example.com",
      });

      const userId = regRes.body?.data?.user?.id;
      if (userId) {
        await User.findByIdAndDelete(userId);
      }

      const res = await request(app)
        .get("/api/auth/me/addresses")
        .set("Cookie", cookie);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/auth/me/addresses", () => {
    it("adds a new address and returns 201 with updated list", async () => {
      const agent = request.agent(app);

      await agent.post("/api/auth/register").send({
        username: "postaddruser",
        email: "postaddruser@example.com",
        password: "StrongP@ssw0rd",
        fullName: { firstName: "Post", lastName: "Addr" },
      });

      const payload = {
        street: "789 Third Blvd",
        city: "Capital City",
        state: "IL",
        zipCode: "62629",
        country: "USA",
      };

      const res = await agent.post("/api/auth/me/addresses").send(payload);

      expect([200, 201]).toContain(res.status);
      expect(res.body?.data?.addresses).toBeDefined();
      const addresses = res.body.data.addresses || [];
      const added = addresses.find((a) => a.street === payload.street);
      expect(added).toBeTruthy();
      expect(added.city).toBe(payload.city);
    });

    it("requires authentication (401 without cookie)", async () => {
      const payload = {
        street: "Unauth St",
        city: "NoCity",
        state: "NC",
        zipCode: "00000",
        country: "USA",
      };
      const res = await request(app)
        .post("/api/auth/me/addresses")
        .send(payload);
      expect(res.status).toBe(401);
    });

    it("rejects missing required fields with 400", async () => {
      const agent = request.agent(app);

      await agent.post("/api/auth/register").send({
        username: "badaddruser",
        email: "badaddruser@example.com",
        password: "StrongP@ssw0rd",
        fullName: { firstName: "Bad", lastName: "Addr" },
      });

      const badPayload = {
        // street missing
        city: "City",
        state: "ST",
        zipCode: "11111",
        country: "USA",
      };

      const res = await agent.post("/api/auth/me/addresses").send(badPayload);
      expect(res.status).toBe(400);
      expect(res.body?.message).toBeDefined();
    });
  });

  describe("DELETE /api/auth/me/addresses/:addressId", () => {
    it("requires authentication (401 without cookie)", async () => {
      const res = await request(app).delete(
        "/api/auth/me/addresses/64b6f2fefe00000000000000",
      );
      expect(res.status).toBe(401);
    });

    it("rejects invalid addressId with 400", async () => {
      const agent = request.agent(app);

      await agent.post("/api/auth/register").send({
        username: "invalididuser",
        email: "invalididuser@example.com",
        password: "StrongP@ssw0rd",
        fullName: { firstName: "Invalid", lastName: "Id" },
      });

      const res = await agent.delete("/api/auth/me/addresses/not-a-valid-id");
      expect(res.status).toBe(400);
      expect(res.body?.message).toBeDefined();
    });

    it("returns 404 when address does not exist", async () => {
      const agent = request.agent(app);

      await agent.post("/api/auth/register").send({
        username: "noaddruser",
        email: "noaddruser@example.com",
        password: "StrongP@ssw0rd",
        fullName: { firstName: "No", lastName: "Addr" },
      });

      const validButMissingId = new mongoose.Types.ObjectId().toString();
      const res = await agent.delete(
        `/api/auth/me/addresses/${validButMissingId}`,
      );
      expect(res.status).toBe(404);
    });

    it("deletes an existing address and returns 200 with updated list", async () => {
      const agent = request.agent(app);

      await agent.post("/api/auth/register").send({
        username: "deladdruser",
        email: "deladdruser@example.com",
        password: "StrongP@ssw0rd",
        fullName: { firstName: "Del", lastName: "Addr" },
      });

      // Add an address first
      const addRes = await agent.post("/api/auth/me/addresses").send({
        street: "10 Downing St",
        city: "London",
        state: "LDN",
        zipCode: "SW1A 2AA",
        country: "UK",
      });
      expect([200, 201]).toContain(addRes.status);
      const addresses = addRes.body?.data?.addresses || [];
      expect(addresses.length).toBeGreaterThan(0);
      const toDelete = addresses[0];
      expect(toDelete?._id).toBeDefined();

      // Delete the address
      const delRes = await agent.delete(
        `/api/auth/me/addresses/${toDelete._id}`,
      );

      expect(delRes.status).toBe(200);
      const updated = delRes.body?.data?.addresses || [];
      const stillThere = updated.find((a) => a._id === toDelete._id);
      expect(stillThere).toBeUndefined();
    });

    it("returns 404 when user does not exist anymore", async () => {
      const agent = request.agent(app);

      const regRes = await agent.post("/api/auth/register").send({
        username: "ghostdel",
        email: "ghostdel@example.com",
        password: "StrongP@ssw0rd",
        fullName: { firstName: "Ghost", lastName: "Del" },
      });

      const userId = regRes.body?.data?.user?.id;
      if (userId) {
        await User.findByIdAndDelete(userId);
      }

      const id = new mongoose.Types.ObjectId().toString();
      const res = await agent.delete(`/api/auth/me/addresses/${id}`);
      expect(res.status).toBe(404);
    });
  });
});
