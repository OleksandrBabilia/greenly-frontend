import { Redis } from "@upstash/redis"

// Create Redis client using environment variables
// These are automatically added by the Vercel Upstash integration
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export default redis
