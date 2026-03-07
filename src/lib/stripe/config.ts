import type { PlanType } from "@/types";

/** Pro プランの Price ID（base + metered） */
export function getCheckoutPriceIds(): {
  basePriceId: string | null;
  meteredPriceId: string | null;
} {
  return {
    basePriceId: process.env.STRIPE_PRICE_PRO_BASE || null,
    meteredPriceId: process.env.STRIPE_PRICE_PRO_METERED || null,
  };
}

/** Stripe Price ID からプラン名を逆引き */
export function getPlanFromPriceId(priceId: string): PlanType {
  const basePriceId = process.env.STRIPE_PRICE_PRO_BASE;
  const meteredPriceId = process.env.STRIPE_PRICE_PRO_METERED;

  if (priceId === basePriceId || priceId === meteredPriceId) {
    return "pro";
  }
  return "free";
}
