/**
 * シンプルな in-memory レートリミッター
 * サーバーレス環境ではインスタンス単位の制限（基本的な防御）
 * 本格運用時は Upstash Redis 等に置き換え可能
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 古いエントリを定期的にクリーンアップ（メモリリーク防止）
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** ウィンドウ内の最大リクエスト数 */
  limit: number;
  /** ウィンドウの長さ（ミリ秒） */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/** IP アドレスを取得するヘルパー */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

// プリセット設定
export const RATE_LIMITS = {
  /** 動画生成: 5回/分 */
  generate: { limit: 5, windowMs: 60_000 },
  /** ファイルアップロード: 15回/分 */
  upload: { limit: 15, windowMs: 60_000 },
  /** Checkout: 10回/分 */
  checkout: { limit: 10, windowMs: 60_000 },
  /** 一般 API: 60回/分 */
  general: { limit: 60, windowMs: 60_000 },
} as const;
