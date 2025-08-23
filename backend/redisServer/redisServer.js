// redisClient.js
import Redis from "ioredis";

let redis;

export const connectRedis = () => {
  if (!redis) {
    redis = new Redis({
      host: "127.0.0.1",
      port: 6379
    });

    redis.on("connect", () => {
      console.log("✅ Redis server connected");
    });

    redis.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });
  }

  return redis;
};
