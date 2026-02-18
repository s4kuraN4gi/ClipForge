import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipForge - 商品写真からショート動画を自動生成",
  description:
    "商品写真をアップロードするだけで、TikTok・Reels・Shorts向けのプロ品質なショート動画を自動生成。個人セラー・ハンドメイド作家のための動画マーケティングツール。",
  openGraph: {
    title: "ClipForge - 商品写真からショート動画を自動生成",
    description:
      "写真を選んで、テンプレートを選ぶだけ。AIがプロ品質のショート動画を自動生成します。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
