"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PortalButton } from "./portal-button";
import { PRO_INCLUDED_VIDEOS, PRO_EXTRA_PRICE } from "@/lib/constants";
import type { Subscription } from "@/types";

interface SubscriptionInfo {
  subscription: Subscription | null;
}

export function SubscriptionCard() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setInfo(data);
        }
      } catch {
        // サブスク情報取得失敗は無視
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <Card className="mb-6 p-4">
        <div className="h-16 animate-pulse rounded-lg bg-muted" />
      </Card>
    );
  }

  const subscription = info?.subscription;
  const plan = subscription?.plan ?? "free";
  const currentCount = subscription?.monthly_video_count ?? 0;
  const extraCount = subscription?.extra_video_count ?? 0;

  const isFree = plan === "free";
  const isPro = plan === "pro";

  // Free: 累計1本、Pro: 含む分5本のプログレス
  const includedLimit = isFree ? 1 : PRO_INCLUDED_VIDEOS;
  const includedUsed = isPro ? Math.min(currentCount, PRO_INCLUDED_VIDEOS) : currentCount;
  const progressPercent = Math.min((includedUsed / includedLimit) * 100, 100);

  return (
    <Card className="mb-6 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">
              {isFree ? "無料プラン" : "Pro"}
            </h3>
            {subscription?.cancel_at_period_end && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                期間終了で解約
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1.5">
            {/* 含む分の使用量 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {isPro
                  ? `含む分: ${includedUsed} / ${PRO_INCLUDED_VIDEOS}本`
                  : `生成数: ${currentCount} / 1本`}
              </span>
              {subscription?.current_period_end && (
                <span>
                  次回更新:{" "}
                  {new Date(subscription.current_period_end).toLocaleDateString(
                    "ja-JP"
                  )}
                </span>
              )}
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Pro: 追加生成分の表示 */}
            {isPro && extraCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  追加生成: {extraCount}本
                </span>
                <span className="font-medium text-foreground">
                  ¥{(extraCount * PRO_EXTRA_PRICE).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {subscription?.stripe_customer_id && (
          <PortalButton />
        )}
      </div>
    </Card>
  );
}
