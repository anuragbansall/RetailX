import Redis from "ioredis";
import { config } from "../config/index.js";

const redis = new Redis({
  host: config.REDIS.HOST,
  port: config.REDIS.PORT,
  password: config.REDIS.PASSWORD,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
    