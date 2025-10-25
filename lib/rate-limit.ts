/**
 * Rate Limiting Module
 *
 * This module provides rate limiting functionality using Redis
 * to prevent abuse of sensitive operations like invitation creation.
 */

import { redis } from './redist';

export interface RateLimitConfig {
  /**
   * Maximum number of attempts allowed
   */
  maxAttempts: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Optional custom error message
   */
  errorMessage?: string;
}

export interface RateLimitResult {
  /**
   * Whether the action is allowed
   */
  allowed: boolean;

  /**
   * Number of attempts remaining in current window
   */
  remaining: number;

  /**
   * Seconds until the rate limit resets
   */
  resetIn: number;

  /**
   * Error message if not allowed
   */
  error?: string;
}

/**
 * Default rate limit configurations for different operations
 */
export const RATE_LIMITS = {
  /**
   * Invitation creation: 10 per hour per user
   */
  INVITATION_CREATION: {
    maxAttempts: 10,
    windowSeconds: 3600, // 1 hour
    errorMessage:
      'You have exceeded the invitation creation limit. Please try again later.',
  } as RateLimitConfig,

  /**
   * User deletion: 20 per hour per user
   */
  USER_DELETION: {
    maxAttempts: 20,
    windowSeconds: 3600, // 1 hour
    errorMessage:
      'You have exceeded the user deletion limit. Please try again later.',
  } as RateLimitConfig,
};

/**
 * Check if a user has exceeded the rate limit for a specific action
 *
 * @param identifier - Unique identifier (e.g., user email)
 * @param action - Action name (e.g., 'invitation_creation')
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${action}:${identifier}`;

  try {
    // Get current count
    const currentCount = await redis.get(key);
    const count = currentCount ? parseInt(currentCount as string, 10) : 0;

    // Get TTL (time to live) for the key
    const ttl = await redis.ttl(key);
    const resetIn = ttl > 0 ? ttl : config.windowSeconds;

    // Check if limit exceeded
    if (count >= config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetIn,
        error:
          config.errorMessage ||
          `Rate limit exceeded. Please try again in ${Math.ceil(resetIn / 60)} minutes.`,
      };
    }

    // Increment count
    if (count === 0) {
      // First attempt - set with expiry
      await redis.setex(key, config.windowSeconds, '1');
    } else {
      // Subsequent attempt - increment
      await redis.incr(key);
    }

    const newCount = count + 1;
    const remaining = config.maxAttempts - newCount;

    return {
      allowed: true,
      remaining,
      resetIn,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);

    // On error, allow the action but log the error
    // This prevents legitimate users from being blocked due to Redis issues
    return {
      allowed: true,
      remaining: config.maxAttempts,
      resetIn: config.windowSeconds,
    };
  }
}

/**
 * Reset rate limit for a user and action
 *
 * @param identifier - Unique identifier (e.g., user email)
 * @param action - Action name
 */
export async function resetRateLimit(
  identifier: string,
  action: string
): Promise<void> {
  const key = `ratelimit:${action}:${identifier}`;

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
}

/**
 * Get current rate limit status without incrementing
 *
 * @param identifier - Unique identifier
 * @param action - Action name
 * @param config - Rate limit configuration
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  action: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${action}:${identifier}`;

  try {
    const currentCount = await redis.get(key);
    const count = currentCount ? parseInt(currentCount as string, 10) : 0;
    const ttl = await redis.ttl(key);
    const resetIn = ttl > 0 ? ttl : config.windowSeconds;

    const remaining = Math.max(0, config.maxAttempts - count);
    const allowed = count < config.maxAttempts;

    return {
      allowed,
      remaining,
      resetIn,
      error: allowed
        ? undefined
        : config.errorMessage ||
          `Rate limit exceeded. Please try again in ${Math.ceil(resetIn / 60)} minutes.`,
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);

    return {
      allowed: true,
      remaining: config.maxAttempts,
      resetIn: config.windowSeconds,
    };
  }
}
