import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getSubscription } from "@/lib/subscription";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const subscription = await getSubscription(user.id);

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 404 }
      );
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

    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return NextResponse.json(
      { error: "ポータルの作成に失敗しました" },
      { status: 500 }
    );
  }
}
