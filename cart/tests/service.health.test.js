import request from "supertest";
import app from "../src/app.js";

describe("Health endpoint", () => {
  it("returns 200 with service status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "OK",
      message: "service is running",
    });
  });
});
