import request from "supertest";
import app from "../src/app.js";

// Global DB hooks are provided by tests/setup.js

const registerUser = async ({
  username = "johndoe",
  email = "john@example.com",
  password = "StrongP@ssw0rd",
  fullName = { firstName: "John", lastName: "Doe" },
  role,
}) => {
  const payload = { username, email, password, fullName };
  if (role) payload.role = role;
  const res = await request(app).post("/api/auth/register").send(payload);
  return { res, payload };
};

describe("POST /api/auth/login", () => {
  it("logs in with email + password, returns 200 and sets auth cookie", async () => {
    const { payload } = await registerUser({});

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);

    // Cookie expectations: HttpOnly and SameSite=Strict; Secure may be off in non-production
    const setCookie = res.headers["set-cookie"] || [];
    const cookieStr = Array.isArray(setCookie)
      ? setCookie.join(";")
      : String(setCookie || "");
    expect(cookieStr).toMatch(/token=/i);
    expect(cookieStr).toMatch(/HttpOnly/i);
    expect(cookieStr).toMatch(/SameSite=Strict/i);

    // Response shape and no password leakage
    expect(res.body?.data?.user).toBeDefined();
    expect(res.body.data.user.email).toBe(payload.email);
    expect(res.body.data.user.username).toBe(payload.username);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("rejects wrong password with 401", async () => {
    const { payload } = await registerUser({
      username: "wrongpass",
      email: "wrongpass@example.com",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "NotTheRightP@ss1" })
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    expect(res.body?.message).toBeDefined();
  });

  it("rejects missing password with 400", async () => {
    await registerUser({ username: "nopass", email: "nopass@example.com" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nopass@example.com" })
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body?.message).toBeDefined();
  });

  it("allows login via username instead of email", async () => {
    const { payload } = await registerUser({
      username: "useusername",
      email: "useusername@example.com",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: payload.username, password: payload.password })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body?.data?.user?.username).toBe(payload.username);
    expect(res.body?.data?.user?.password).toBeUndefined();
  });

  it("rejects non-existent account with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nouser@example.com", password: "StrongP@ssw0rd" })
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    expect(res.body?.message).toBeDefined();
  });
});
