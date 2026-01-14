import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.model.js";

// Helper to register a user and return cookie + response
const registerUserAndGetCookie = async (overrides = {}) => {
  const payload = {
    username: overrides.username || "johnme",
    email: overrides.email || "johnme@example.com",
    password: overrides.password || "StrongP@ssw0rd",
    fullName: overrides.fullName || { firstName: "John", lastName: "Me" },
  };

  const res = await request(app).post("/api/auth/register").send(payload);
  const setCookie = res.headers["set-cookie"] || [];
  const cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return { res, cookie, payload };
};

describe("GET /api/auth/me", () => {
  it("returns 200 and current user when authenticated", async () => {
    const { res: regRes, cookie, payload } = await registerUserAndGetCookie();

    const meRes = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body?.data?.user).toBeDefined();
    expect(meRes.body.data.user.email).toBe(payload.email);
    expect(meRes.body.data.user.username).toBe(payload.username);
    expect(meRes.body.data.user.password).toBeUndefined();
  });

  it("returns 401 when no auth cookie is provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body?.message).toBeDefined();
  });

  it("returns 401 when token is invalid/tampered", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", "token=notavalidjwt");
    expect(res.status).toBe(401);
    expect(res.body?.message).toBeDefined();
  });

  it("returns 404 when user does not exist anymore", async () => {
    const { res: regRes, cookie } = await registerUserAndGetCookie({
      username: "ghostuser",
      email: "ghost@example.com",
    });

    const userId = regRes.body?.data?.user?.id;
    if (userId) {
      await User.findByIdAndDelete(userId);
    }

    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(res.status).toBe(404);
  });
});
