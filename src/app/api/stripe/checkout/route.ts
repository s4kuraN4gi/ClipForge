import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getPriceIdFromPlan } from "@/lib/stripe/config";
import { getSubscription } from "@/lib/subscription";
import type { PlanType } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { plan } = (await request.json()) as { plan: PlanType };
    const priceId = getPriceIdFromPlan(plan);

    if (!priceId) {
      return NextResponse.json(
        { error: "無効なプランです" },
        { status: 400 }
      );
    }

    // 既存の Stripe Customer ID を取得
    const subscription = await getSubscription(user.id);
    const customerOptions: { customer?: string; customer_email?: string } = {};

    if (subscription?.stripe_customer_id) {
      customerOptions.customer = subscription.stripe_customer_id;
    } else {
      customerOptions.customer_email = user.email;
    }

    const origin = request.headers.get("origin") || "";

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...customerOptions,
      metadata: {
        user_id: user.id,
        plan,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "チェックアウトの作成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
