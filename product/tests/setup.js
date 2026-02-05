import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo;

beforeAll(async () => {
  // Ensure JWT is available for auth middleware during tests
  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  } finally {
    if (mongo) await mongo.stop();
  }
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) {
    await c.deleteMany({});
  }
});
