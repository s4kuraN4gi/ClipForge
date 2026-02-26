import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { getPlanFromPriceId } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "署名がありません" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "署名の検証に失敗しました" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // S-11: べき等性チェック（event.id で重複処理を防止）
  const { data: existing } = await supabase
    .from("processed_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, deduplicated: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (!userId || !plan) break;

        // Stripe Subscription の詳細を取得
        let periodStart: string | null = null;
        let periodEnd: string | null = null;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        if (subscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          const item = sub.items.data[0];
          if (item) {
            periodStart = new Date(
              item.current_period_start * 1000
            ).toISOString();
            periodEnd = new Date(
              item.current_period_end * 1000
            ).toISOString();
          }
        }

        const { error: upsertError } = await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              plan,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: "active",
              current_period_start: periodStart,
              current_period_end: periodEnd,
              monthly_video_count: 0,
              cancel_at_period_end: false,
            },
            { onConflict: "user_id" }
          );

        if (upsertError) {
          console.error("Webhook DB error (checkout.session.completed):", upsertError);
          return NextResponse.json(
            { error: "サブスクリプションの保存に失敗しました" },
            { status: 500 }
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : "free";

        const item = sub.items.data[0];
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            plan,
            status: sub.status === "active" ? "active" : sub.status,
            current_period_start: item
              ? new Date(item.current_period_start * 1000).toISOString()
              : null,
            current_period_end: item
              ? new Date(item.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: sub.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", sub.id);

        if (updateError) {
          console.error("Webhook DB error (subscription.updated):", updateError);
          return NextResponse.json(
            { error: "サブスクリプションの更新に失敗しました" },
            { status: 500 }
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const { error: deleteError } = await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "active",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            current_period_start: null,
            current_period_end: null,
          })
          .eq("stripe_subscription_id", sub.id);

        if (deleteError) {
          console.error("Webhook DB error (subscription.deleted):", deleteError);
          return NextResponse.json(
            { error: "サブスクリプションの削除処理に失敗しました" },
            { status: 500 }
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          invoice.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof subId === "string" ? subId : subId?.id;

        if (
          invoice.billing_reason === "subscription_cycle" &&
          subscriptionId
        ) {
          // 月次リセット
          const { error: resetError } = await supabase
            .from("subscriptions")
            .update({ monthly_video_count: 0 })
            .eq("stripe_subscription_id", subscriptionId);

          if (resetError) {
            console.error("Webhook DB error (payment_succeeded):", resetError);
            return NextResponse.json(
              { error: "月次カウントのリセットに失敗しました" },
              { status: 500 }
            );
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          invoice.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof subId === "string" ? subId : subId?.id;

        if (subscriptionId) {
          const { error: failError } = await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);

          if (failError) {
            console.error("Webhook DB error (payment_failed):", failError);
            return NextResponse.json(
              { error: "支払い失敗ステータスの更新に失敗しました" },
              { status: 500 }
            );
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook 処理中にエラーが発生しました" },
      { status: 500 }
    );
  }

  // 処理済みイベントを記録
  await supabase.from("processed_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
  });

  return NextResponse.json({ received: true });
}
