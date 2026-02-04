import request from "supertest";
import { setCookie } from "./helpers/auth.js";
import app from "../src/app.js";

describe("Auth security", () => {
  it("rejects invalid JWT token", async () => {
    const badToken = "invalid.token.value";
    const res = await request(app)
      .get("/api/products/seller")
      .set("Cookie", setCookie(badToken));
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid token/);
  });
});
