import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.model.js";
import { config } from "../src/config/index.js";

// Global DB hooks are provided by tests/setup.js

/**
 * NOTE: This test expects the /auth/register route to exist and
 * create a new user, returning 201 with basic user fields (no password).
 * If the route is not yet implemented, this test will fail — the
 * in-memory DB setup is ready either way.
 */
describe("POST /api/auth/register", () => {
  it("creates a new user and returns 201", async () => {
    const payload = {
      username: "johndoe",
      email: "john@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "John", lastName: "Doe" },
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    // Expect a conventional successful response
    expect([200, 201]).toContain(res.status);

    // Verify user persisted in the in-memory DB
    const userInDb = await User.findOne({ email: payload.email });
    expect(userInDb).toBeTruthy();
    expect(userInDb.username).toBe(payload.username);

    // Ensure password is hashed (not equal to plain text)
    if (userInDb.password) {
      expect(userInDb.password).not.toBe(payload.password);
    }
  });

  it("rejects duplicate emails with 400/409", async () => {
    const payload = {
      username: "janedoe",
      email: "jane@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Jane", lastName: "Doe" },
    };

    // First registration
    await request(app).post("/api/auth/register").send(payload);
    // Duplicate registration
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...payload,
        username: "janedoe2",
      });

    expect([400, 409]).toContain(res.status);
  });

  it("rejects weak passwords (missing complexity) with 400", async () => {
    const payload = {
      username: "weakpassuser",
      email: "weak@example.com",
      password: "password", // no uppercase, number, or special char
      fullName: { firstName: "Weak", lastName: "User" },
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body?.message).toBeDefined();
  });

  it("rejects invalid email format with 400", async () => {
    const payload = {
      username: "bademailuser",
      email: "not-an-email",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Bad", lastName: "Email" },
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body?.message).toBeDefined();
  });

  it("rejects role escalation to admin with 400", async () => {
    const payload = {
      username: "tryadmin",
      email: "tryadmin@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Try", lastName: "Admin" },
      role: "admin",
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    const userInDb = await User.findOne({ email: payload.email });
    expect(userInDb).toBeFalsy();
  });

  it("does not leak password in response payload", async () => {
    const payload = {
      username: "noleakuser",
      email: "noleak@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "No", lastName: "Leak" },
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect([200, 201]).toContain(res.status);
    expect(res.body?.data?.user?.password).toBeUndefined();
  });

  it("sets secure auth cookie with HttpOnly, Secure, SameSite flags", async () => {
    const payload = {
      username: "cookieuser",
      email: "cookie@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Cookie", lastName: "User" },
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect([200, 201]).toContain(res.status);
    const setCookie = res.headers["set-cookie"] || [];
    const cookieStr = Array.isArray(setCookie)
      ? setCookie.join(";")
      : String(setCookie || "");
    expect(cookieStr).toMatch(/HttpOnly/i);
    expect(cookieStr).toMatch(/SameSite=Strict/i);

    // Secure is only expected in production
    if (config.NODE_ENV === "production") {
      expect(cookieStr).toMatch(/Secure/i);
    }
  });

  it("rejects non-array addresses with 400", async () => {
    const payload = {
      username: "badaddresses",
      email: "badaddresses@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Bad", lastName: "Addresses" },
      addresses: { street: "123 Main" }, // should be array
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("rejects usernames with illegal characters with 400", async () => {
    const payload = {
      username: "john.doe", // dot not allowed per validation
      email: "john.doe@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "John", lastName: "Doe" },
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });

  it("rejects duplicate usernames with 400/409", async () => {
    const payload1 = {
      username: "dupuser",
      email: "dup1@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Dup", lastName: "One" },
    };

    const payload2 = {
      username: "dupuser", // duplicate username
      email: "dup2@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Dup", lastName: "Two" },
    };

    const res1 = await request(app).post("/api/auth/register").send(payload1);
    expect([200, 201]).toContain(res1.status);

    const res2 = await request(app).post("/api/auth/register").send(payload2);
    expect([400, 409]).toContain(res2.status);
  });

  it("ignores unknown fields to prevent mass assignment", async () => {
    const payload = {
      username: "massassign",
      email: "massassign@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Mass", lastName: "Assign" },
      isAdmin: true, // not in schema
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect([200, 201]).toContain(res.status);
    const userInDb = await User.findOne({ email: payload.email });
    expect(userInDb).toBeTruthy();
    // @ts-expect-error: field should not exist
    expect(userInDb.isAdmin).toBeUndefined();
  });

  it("sets the first address as default when none are marked", async () => {
    const payload = {
      username: "addrdefaultnone",
      email: "addrdefaultnone@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Addr", lastName: "None" },
      addresses: [
        { street: "A", city: "X", state: "S", zipCode: "1", country: "C" },
        { street: "B", city: "Y", state: "T", zipCode: "2", country: "C" },
      ],
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect([200, 201]).toContain(res.status);
    const addresses = res.body?.data?.user?.addresses || [];
    expect(addresses.length).toBe(2);
    const defaults = addresses.filter((a) => a.isDefault === true);
    expect(defaults.length).toBe(1);
    expect(addresses[0].isDefault).toBe(true);
  });

  it("accepts a single default address and preserves it", async () => {
    const payload = {
      username: "addrdefaultsingle",
      email: "addrdefaultsingle@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Addr", lastName: "Single" },
      addresses: [
        {
          street: "A",
          city: "X",
          state: "S",
          zipCode: "1",
          country: "C",
          isDefault: true,
        },
        { street: "B", city: "Y", state: "T", zipCode: "2", country: "C" },
      ],
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect([200, 201]).toContain(res.status);
    const addresses = res.body?.data?.user?.addresses || [];
    expect(addresses.length).toBe(2);
    const defaults = addresses.filter((a) => a.isDefault === true);
    expect(defaults.length).toBe(1);
    // The one marked default remains the default
    expect(addresses[0].isDefault).toBe(true);
  });

  it("rejects registration when multiple addresses are marked default", async () => {
    const payload = {
      username: "addrdefaultmulti",
      email: "addrdefaultmulti@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Addr", lastName: "Multi" },
      addresses: [
        {
          street: "A",
          city: "X",
          state: "S",
          zipCode: "1",
          country: "C",
          isDefault: true,
        },
        {
          street: "B",
          city: "Y",
          state: "T",
          zipCode: "2",
          country: "C",
          isDefault: true,
        },
      ],
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
  });
});
