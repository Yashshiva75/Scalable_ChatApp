// redisClient.js
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
let redis;

export const connectRedis = () => {
  if (!redis) {
    redis = new Redis(
      process.env.REDIS_URI
    );

    redis.on("connect", () => {
      console.log("✅ Redis server connected");
    });

    redis.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });
  }

  return redis;
};
