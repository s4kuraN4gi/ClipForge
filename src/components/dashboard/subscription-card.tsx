"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PortalButton } from "./portal-button";
import { PRICING_PLANS } from "@/lib/constants";
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
  const plan = PRICING_PLANS.find((p) => p.id === (subscription?.plan ?? "free"));
  const videoLimit = plan?.videoLimit;
  const currentCount = subscription?.monthly_video_count ?? 0;
  const progressPercent =
    videoLimit != null ? Math.min((currentCount / videoLimit) * 100, 100) : 0;

  return (
    <Card className="mb-6 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{plan?.name ?? "無料プラン"}</h3>
            {subscription?.cancel_at_period_end && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                期間終了で解約
              </span>
            )}
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                今月の生成数: {currentCount}
                {videoLimit != null ? ` / ${videoLimit}本` : "本（無制限）"}
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

            {videoLimit != null && (
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
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
