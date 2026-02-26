import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getPriceIdFromPlan } from "@/lib/stripe/config";
import { getSubscription } from "@/lib/subscription";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type { PlanType } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const ip = getClientIp(request);
    const rl = await rateLimit(`checkout:${ip}`, RATE_LIMITS.checkout);
    if (!rl.success) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらく待ってからお試しください。" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

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

    // 二重課金防止: 既にアクティブな有料サブスクリプションがある場合はブロック
    if (
      subscription?.stripe_subscription_id &&
      subscription.status === "active" &&
      subscription.plan !== "free"
    ) {
      return NextResponse.json(
        {
          error: "既にアクティブなサブスクリプションがあります。プラン変更はマイページから行ってください。",
        },
        { status: 409 }
      );
    }
    const customerOptions: { customer?: string; customer_email?: string } = {};

    if (subscription?.stripe_customer_id) {
      customerOptions.customer = subscription.stripe_customer_id;
    } else {
      customerOptions.customer_email = user.email;
    }

    // origin ホワイトリスト検証
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const allowedOrigins = [
      new URL(siteUrl).origin,
      "http://localhost:3000",
    ];
    const rawOrigin = request.headers.get("origin") || "";
    const origin = allowedOrigins.includes(rawOrigin)
      ? rawOrigin
      : allowedOrigins[0];

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
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "チェックアウトの作成に失敗しました" },
      { status: 500 }
    );
  }
}
