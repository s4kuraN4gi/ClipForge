import { createServiceClient } from "@/lib/supabase/server";
import { PRO_INCLUDED_VIDEOS, PRO_SAFETY_CAP } from "@/lib/constants";
import { getStripe } from "@/lib/stripe/client";
import type { Subscription, PlanType } from "@/types";

/** ユーザーのサブスクリプションを取得 */
export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as Subscription;
}

export interface VideoLimitResult {
  allowed: boolean;
  plan: PlanType;
  current: number;
  includedLimit: number;
  extraCount: number;
  isMetered: boolean;
  stripeCustomerId: string | null;
}

/** 動画生成の上限チェック（ハイブリッド型対応） */
export async function checkVideoLimit(userId: string): Promise<VideoLimitResult> {
  const subscription = await getSubscription(userId);

  const plan: PlanType = subscription?.plan ?? "free";
  const current = subscription?.monthly_video_count ?? 0;
  const extraCount = subscription?.extra_video_count ?? 0;
  const stripeCustomerId = subscription?.stripe_customer_id ?? null;

  if (plan === "free") {
    // 無料プラン: 累計（lifetime）制限
    const supabase = createServiceClient();
    let lifetimeCount = 0;

    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId);

    if (projects && projects.length > 0) {
      const projectIds = projects.map((p) => p.id);
      const { count: videoCount } = await supabase
        .from("generated_videos")
        .select("id", { count: "exact", head: true })
        .in("project_id", projectIds)
        .in("status", ["pending", "processing", "completed"]);

      lifetimeCount = videoCount ?? 0;
    }

    return {
      allowed: lifetimeCount < 1,
      plan,
      current: lifetimeCount,
      includedLimit: 1,
      extraCount: 0,
      isMetered: false,
      stripeCustomerId: null,
    };
  }

  // Pro プラン
  // Safety cap チェック
  if (current >= PRO_SAFETY_CAP) {
    return {
      allowed: false,
      plan,
      current,
      includedLimit: PRO_INCLUDED_VIDEOS,
      extraCount,
      isMetered: false,
      stripeCustomerId,
    };
  }

  // 含む分 (5本) 以内
  if (current < PRO_INCLUDED_VIDEOS) {
    return {
      allowed: true,
      plan,
      current,
      includedLimit: PRO_INCLUDED_VIDEOS,
      extraCount,
      isMetered: false,
      stripeCustomerId,
    };
  }

  // 超過分 → メーター課金
  return {
    allowed: true,
    plan,
    current,
    includedLimit: PRO_INCLUDED_VIDEOS,
    extraCount,
    isMetered: true,
    stripeCustomerId,
  };
}

/** Stripe Billing Meter にメーター使用量を報告 */
export async function reportMeteredUsage(
  stripeCustomerId: string,
  quantity: number = 1
): Promise<void> {
  const eventName = process.env.STRIPE_METER_EVENT_NAME;
  if (!eventName) {
    console.error("STRIPE_METER_EVENT_NAME is not set");
    return;
  }

  // Billing Meter Events API で使用量を報告
  // quantity が負数の場合はスキップ（新APIでは負の値は非対応）
  if (quantity <= 0) return;

  for (let i = 0; i < quantity; i++) {
    await getStripe().billing.meterEvents.create({
      event_name: eventName,
      payload: {
        stripe_customer_id: stripeCustomerId,
        value: "1",
      },
    });
  }
}

/** 動画生成カウントをインクリメント（PostgreSQL RPC） */
export async function incrementVideoCount(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.rpc("increment_video_count", { target_user_id: userId });
}

/** チェック+インクリメントをアトミックに実行（レースコンディション防止） */
export async function tryIncrementVideoCount(
  userId: string,
  maxCount: number
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("try_increment_video_count", {
    target_user_id: userId,
    max_count: maxCount,
  });
  if (error) {
    console.error("try_increment_video_count error:", error);
    return false;
  }
  return data === true;
}

/** 動画生成カウントをデクリメント（PostgreSQL RPC） */
export async function decrementVideoCount(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.rpc("decrement_video_count", { target_user_id: userId });
}

/** 追加動画カウントをインクリメント */
export async function incrementExtraVideoCount(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.rpc("increment_extra_video_count", { target_user_id: userId });
}

/** 追加動画カウントをデクリメント */
export async function decrementExtraVideoCount(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.rpc("decrement_extra_video_count", { target_user_id: userId });
}

/** 無料プラン サブスクリプションを作成（冪等・アトミック） */
export async function ensureFreeSubscription(userId: string): Promise<void> {
  const supabase = createServiceClient();

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: "free",
      status: "active",
      monthly_video_count: 0,
      extra_video_count: 0,
    },
    { onConflict: "user_id", ignoreDuplicates: true }
  );
}
