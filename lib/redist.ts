// lib/redis.ts
import { Redis } from '@upstash/redis';

// Validate required environment variables
if (!process.env.KV_REST_API_URL) {
  throw new Error(
    'KV_REST_API_URL is not defined in environment variables. Please check your .env file.'
  );
}

if (!process.env.KV_REST_API_TOKEN) {
  throw new Error(
    'KV_REST_API_TOKEN is not defined in environment variables. Please check your .env file.'
  );
}

export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
