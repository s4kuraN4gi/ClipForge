import type { PlanType } from "@/types";

/** 環境変数の Price ID → プラン名 マッピング */
const priceIdToPlan: Record<string, PlanType> = {};

function ensureMapping() {
  if (Object.keys(priceIdToPlan).length > 0) return;

  const starter = process.env.STRIPE_PRICE_STARTER;
  const business = process.env.STRIPE_PRICE_BUSINESS;

  if (starter) priceIdToPlan[starter] = "starter";
  if (business) priceIdToPlan[business] = "business";
}

/** Stripe Price ID からプラン名を逆引き */
export function getPlanFromPriceId(priceId: string): PlanType {
  ensureMapping();
  return priceIdToPlan[priceId] || "free";
}

/** プラン名から Stripe Price ID を取得 */
export function getPriceIdFromPlan(plan: PlanType): string | null {
  switch (plan) {
    case "starter":
      return process.env.STRIPE_PRICE_STARTER || null;
    case "business":
      return process.env.STRIPE_PRICE_BUSINESS || null;
    default:
      return null;
  }
}
