import request from "supertest";
import app from "../src/app.js";
import { config } from "../src/config/index.js";

describe("POST /api/auth/logout", () => {
  it("requires authentication (401 without cookie)", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(401);
  });

  it("clears the auth cookie and prevents further access", async () => {
    const agent = request.agent(app);

    // Register to obtain an auth cookie in the agent
    await agent.post("/api/auth/register").send({
      username: "logoutuser",
      email: "logoutuser@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "Logout", lastName: "User" },
    });

    // Verify /me works before logout
    const meBefore = await agent.get("/api/auth/me");
    expect(meBefore.status).toBe(200);

    // Perform logout
    const logoutRes = await agent.post("/api/auth/logout");
    expect(logoutRes.status).toBe(200);

    // Cookie should be cleared with security flags
    const setCookie = logoutRes.headers["set-cookie"] || [];
    const cookieStr = Array.isArray(setCookie)
      ? setCookie.join(";")
      : String(setCookie || "");

    // Token cookie cleared (either empty value or expired)
    expect(cookieStr).toMatch(/token=/i);
    expect(cookieStr).toMatch(/HttpOnly/i);
    expect(cookieStr).toMatch(/SameSite=Strict/i);
    if (config.NODE_ENV === "production") {
      expect(cookieStr).toMatch(/Secure/i);
    }

    // After logout, agent should not be able to access /me
    const meAfter = await agent.get("/api/auth/me");
    expect(meAfter.status).toBe(401);
  });
});
