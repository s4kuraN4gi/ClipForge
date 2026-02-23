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
      "無料アカウントを作成すると、自分の商品写真で3本まで動画を作れます。",
  },
  upload: {
    icon: "📷",
    title: "自分の写真で動画を作成",
    description:
      "アカウントを作成すると、自分の商品写真をアップロードして動画を作れます。",
  },
  download: {
    icon: "📥",
    title: "ダウンロードはアカウント登録が必要です",
    description:
      "無料アカウントでも3本までダウンロード可能。アップグレードでさらに多くの動画を。",
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
