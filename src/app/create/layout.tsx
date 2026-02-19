import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "動画を作成",
  description:
    "商品写真をアップロードしてテンプレートを選ぶだけ。AIが自動でショート動画を生成します。",
  openGraph: {
    title: "動画を作成 | ClipForge",
    description:
      "商品写真をアップロードしてテンプレートを選ぶだけ。AIが自動でショート動画を生成します。",
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
