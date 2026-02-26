import { createServiceClient } from "@/lib/supabase/server";
import { PRICING_PLANS } from "@/lib/constants";
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

/** 動画生成の上限チェック。超過時は { allowed: false, ... } を返す */
export async function checkVideoLimit(userId: string): Promise<{
  allowed: boolean;
  plan: PlanType;
  current: number;
  limit: number | null;
}> {
  const subscription = await getSubscription(userId);

  // サブスクリプション未作成の場合は free 扱い
  const plan: PlanType = subscription?.plan ?? "free";
  const planDef = PRICING_PLANS.find((p) => p.id === plan)!;
  const limit = planDef.videoLimit;

  // 無制限プラン
  if (limit === null) {
    return { allowed: true, plan, current: subscription?.monthly_video_count ?? 0, limit };
  }

  let currentCount = subscription?.monthly_video_count ?? 0;

  // 無料プラン: 累計（lifetime）制限 — 全期間の生成数をカウント
  if (plan === "free") {
    const supabase = createServiceClient();

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

      currentCount = videoCount ?? 0;
    }
  }

  return {
    allowed: currentCount < limit,
    plan,
    current: currentCount,
    limit,
  };
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

/** 無料プラン サブスクリプションを作成（冪等・アトミック） */
export async function ensureFreeSubscription(userId: string): Promise<void> {
  const supabase = createServiceClient();

  // H-1: ON CONFLICT でアトミックに冪等性を保証（race condition 防止）
  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: "free",
      status: "active",
      monthly_video_count: 0,
    },
    { onConflict: "user_id", ignoreDuplicates: true }
  );
}
