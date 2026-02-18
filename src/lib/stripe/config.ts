import type { PlanType } from "@/types";

/** 環境変数の Price ID → プラン名 マッピング */
const priceIdToPlan: Record<string, PlanType> = {};

function ensureMapping() {
  if (Object.keys(priceIdToPlan).length > 0) return;

  const basic = process.env.STRIPE_PRICE_BASIC;
  const pro = process.env.STRIPE_PRICE_PRO;

  if (basic) priceIdToPlan[basic] = "basic";
  if (pro) priceIdToPlan[pro] = "pro";
}

/** Stripe Price ID からプラン名を逆引き */
export function getPlanFromPriceId(priceId: string): PlanType {
  ensureMapping();
  return priceIdToPlan[priceId] || "free";
}

/** プラン名から Stripe Price ID を取得 */
export function getPriceIdFromPlan(plan: PlanType): string | null {
  switch (plan) {
    case "basic":
      return process.env.STRIPE_PRICE_BASIC || null;
    case "pro":
      return process.env.STRIPE_PRICE_PRO || null;
    default:
      return null;
  }
}
