import Redis from "ioredis";
import { config } from "../config/index.js";

const REDIS_CONFIG = config.REDIS || {};
const REDIS_HOST = REDIS_CONFIG.HOST;
const REDIS_PORT = REDIS_CONFIG.PORT;
const REDIS_PASSWORD = REDIS_CONFIG.PASSWORD;

if (!REDIS_HOST) {
  throw new Error("REDIS.HOST is not defined in configuration");
}

if (REDIS_PORT == null) {
  throw new Error("REDIS.PORT is not defined in configuration");
}

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
