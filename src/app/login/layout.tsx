import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description:
    "Picavelにログインまたは新規登録して、商品写真からショート動画を自動生成しましょう。",
  openGraph: {
    title: "ログイン | Picavel",
    description:
      "Picavelにログインまたは新規登録して、商品写真からショート動画を自動生成しましょう。",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
