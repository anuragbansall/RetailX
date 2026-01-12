import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.model.js";

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
  console.log("Connected to in-memory MongoDB");
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongo) await mongo.stop();
});

beforeEach(async () => {
  // Clean all collections between tests
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) {
    await c.deleteMany({});
  }
});

/**
 * NOTE: This test expects the /auth/register route to exist and
 * create a new user, returning 201 with basic user fields (no password).
 * If the route is not yet implemented, this test will fail — the
 * in-memory DB setup is ready either way.
 */
describe("POST /auth/register", () => {
  it("creates a new user and returns 201", async () => {
    const payload = {
      username: "johndoe",
      email: "john@example.com",
      password: "StrongP@ssw0rd",
      fullName: { firstName: "John", lastName: "Doe" },
    };

    const res = await request(app)
      .post("/auth/register")
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
    await request(app).post("/auth/register").send(payload);
    // Duplicate registration
    const res = await request(app)
      .post("/auth/register")
      .send({
        ...payload,
        username: "janedoe2",
      });

    expect([400, 409]).toContain(res.status);
  });
});
    