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

  // 無料プランで period_end が null の場合、当月の generated_videos をカウント
  if (plan === "free" && !subscription?.current_period_end) {
    const supabase = createServiceClient();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count } = await supabase
      .from("generated_videos")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart)
      .in("status", ["pending", "processing", "completed"])
      .eq(
        "project_id",
        supabase
          .from("projects")
          .select("id")
          .eq("user_id", userId) as unknown as string
      );

    // フォールバック: projects 経由で直接カウント
    if (count === null) {
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
          .gte("created_at", monthStart)
          .in("status", ["pending", "processing", "completed"]);

        currentCount = videoCount ?? 0;
      }
    } else {
      currentCount = count;
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

/** 動画生成カウントをデクリメント（PostgreSQL RPC） */
export async function decrementVideoCount(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.rpc("decrement_video_count", { target_user_id: userId });
}

/** 無料プラン サブスクリプションを作成（冪等） */
export async function ensureFreeSubscription(userId: string): Promise<void> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) return; // 既に存在する

  await supabase.from("subscriptions").insert({
    user_id: userId,
    plan: "free",
    status: "active",
    monthly_video_count: 0,
  });
}
