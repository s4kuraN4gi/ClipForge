/**
 * Upstash Redis ベースのレートリミッター
 * Vercel serverless 環境でもインスタンス横断で正しく動作する
 *
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN が未設定の場合は
 * in-memory fallback（開発用）を使用し、本番では警告を出す
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Upstash Redis クライアント ---

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// --- レートリミッター ---

type RateLimitPreset = "generate" | "upload" | "checkout" | "general";

const PRESETS: Record<
  RateLimitPreset,
  { limit: number; window: `${number} s` | `${number} m` }
> = {
  generate: { limit: 5, window: "60 s" },
  upload: { limit: 15, window: "60 s" },
  checkout: { limit: 10, window: "60 s" },
  general: { limit: 60, window: "60 s" },
};

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

// Upstash Ratelimit インスタンスのキャッシュ
const limiters = new Map<string, Ratelimit>();

function getUpstashLimiter(
  preset: RateLimitPreset,
  redis: Redis
): Ratelimit {
  const cached = limiters.get(preset);
  if (cached) return cached;

  const config = PRESETS[preset];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    prefix: `rl:${preset}`,
  });
  limiters.set(preset, limiter);
  return limiter;
}

// --- in-memory fallback（開発用） ---

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

function memoryRateLimit(
  key: string,
  preset: RateLimitPreset
): RateLimitResult {
  const config = PRESETS[preset];
  const windowMs = parseInt(config.window) * 1000;
  const now = Date.now();

  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, limit: config.limit, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, limit: config.limit, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// --- 公開 API ---

export async function rateLimit(
  key: string,
  preset: RateLimitPreset
): Promise<RateLimitResult> {
  const redis = getRedis();

  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN が未設定です。本番環境では Redis の設定を推奨します。"
      );
    }
    return memoryRateLimit(key, preset);
  }

  const limiter = getUpstashLimiter(preset, redis);
  const result = await limiter.limit(key);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

/** IP アドレスを取得するヘルパー（Vercel の x-forwarded-for は信頼可能） */
export function getClientIp(request: Request): string {
  // Vercel は x-forwarded-for の末尾にクライアント IP を付加するため最後の値を使用
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim());
    // Vercel 環境: 最後の値がクライアント IP
    return parts[parts.length - 1];
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

// プリセット名をエクスポート（呼び出し側で使用）
export const RATE_LIMITS = {
  generate: "generate" as const,
  upload: "upload" as const,
  checkout: "checkout" as const,
  general: "general" as const,
};
