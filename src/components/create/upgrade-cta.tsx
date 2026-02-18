"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

interface UpgradeCTAProps {
  variant: "result" | "upload" | "download";
  user: User | null;
}

const CTA_CONFIG = {
  result: {
    icon: "🎬",
    title: "これはサンプル動画です",
    description:
      "自分の商品写真を使ったオリジナル動画を作成してみませんか？",
  },
  upload: {
    icon: "📷",
    title: "自分の写真で動画を作成",
    description:
      "有料プランなら、自分の商品写真をアップロードして本格的な動画が作れます。",
  },
  download: {
    icon: "📥",
    title: "ダウンロードは有料プラン限定です",
    description:
      "アップグレードすると動画のダウンロードや SNS 投稿が可能になります。",
  },
};

export function UpgradeCTA({ variant, user }: UpgradeCTAProps) {
  const config = CTA_CONFIG[variant];
  const ctaHref = user ? "/pricing" : "/login";
  const ctaLabel = user ? "プランをアップグレード" : "無料アカウントを作成";

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary-light to-background p-6 text-center">
      <div className="mb-3 text-3xl">{config.icon}</div>
      <h3 className="mb-2 text-base font-semibold">{config.title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {config.description}
      </p>
      <Link href={ctaHref}>
        <Button size="lg" className="w-full">
          {ctaLabel}
        </Button>
      </Link>
      {!user && (
        <p className="mt-3 text-xs text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            ログイン
          </Link>
        </p>
      )}
    </div>
  );
}
