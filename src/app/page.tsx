import Link from "next/link";
import { PRICING_PLANS } from "@/lib/constants";
import { CheckoutButton } from "@/components/pricing/checkout-button";

export default function Home() {
  return (
    <div>
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 text-center sm:pb-32 sm:pt-40">
        {/* 装飾ブロブ */}
        <div className="blob-1 -left-48 -top-24" />
        <div className="blob-2 -right-32 top-20" />
        <div className="blob-3 left-1/4 bottom-0" />

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light px-4 py-1.5 text-sm font-medium text-primary">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
            個人セラー・ハンドメイド作家のための
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            商品写真から
            <br />
            <span className="bg-gradient-to-r from-primary to-[#D4956A] bg-clip-text text-transparent">
              ショート動画
            </span>
            を自動生成
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            写真をアップロードするだけで、TikTok・Reels・Shorts向けの
            <br className="hidden sm:inline" />
            プロ品質な商品動画をAIが自動で作成します。
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/create"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-hover hover:-translate-y-0.5 sm:w-auto"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M3.75 3A1.75 1.75 0 002 4.75v10.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-8.5A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H3.75z" />
              </svg>
              無料で動画を作成
            </Link>
            <a
              href="#pricing"
              className="inline-flex h-13 w-full items-center justify-center rounded-full border border-border bg-background px-8 text-base font-medium transition-all duration-200 hover:bg-muted hover:-translate-y-0.5 sm:w-auto"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              料金プランを見る
            </a>
          </div>
        </div>
      </section>

      {/* 3ステップ説明 */}
      <section className="relative border-t border-border bg-muted/50 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 text-center text-sm font-medium text-primary">
            HOW IT WORKS
          </div>
          <h2 className="mb-14 text-center text-2xl font-bold sm:text-3xl">
            たった3ステップで完成
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {[
              {
                step: "1",
                icon: (
                  <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                ),
                title: "写真を選択",
                description:
                  "商品写真を1〜5枚アップロード。スマホで撮った写真でOK。",
              },
              {
                step: "2",
                icon: (
                  <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="2" y1="7" x2="7" y2="7" />
                    <line x1="2" y1="17" x2="7" y2="17" />
                    <line x1="17" y1="7" x2="22" y2="7" />
                    <line x1="17" y1="17" x2="22" y2="17" />
                  </svg>
                ),
                title: "テンプレートを選択",
                description:
                  "商品紹介・Before/After・360°回転風の3種類から選ぶだけ。",
              },
              {
                step: "3",
                icon: (
                  <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="23,7 16,12 23,17" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                ),
                title: "AIが動画を生成",
                description:
                  "30秒で完成。商品名やキャッチコピーも自動で入ります。",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="animate-card-enter group flex flex-col items-center rounded-2xl bg-background p-8 text-center transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <div className="mb-2 text-xs font-semibold tracking-wider text-accent">
                  STEP {item.step}
                </div>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 対応プラットフォーム */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="blob-3 -right-40 top-10 opacity-20" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 text-sm font-medium text-primary">
            PLATFORMS
          </div>
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
            主要プラットフォームに対応
          </h2>
          <p className="mb-10 text-muted-foreground">
            9:16の縦型フォーマットで、そのまま投稿できます
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            {[
              { name: "TikTok", color: "from-[#E8725A]/10 to-[#E8725A]/5" },
              { name: "Instagram Reels", color: "from-[#F2CC8F]/15 to-[#F2CC8F]/5" },
              { name: "YouTube Shorts", color: "from-[#3CB4A0]/10 to-[#3CB4A0]/5" },
            ].map((platform) => (
              <div
                key={platform.name}
                className={`flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r ${platform.color} px-8 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5`}
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                {platform.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section
        id="pricing"
        className="relative border-t border-border bg-muted/50 px-4 py-20 sm:py-28"
      >
        <div className="blob-1 -left-60 top-40 opacity-20" />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-4 text-center text-sm font-medium text-primary">
            PRICING
          </div>
          <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">
            料金プラン
          </h2>
          <p className="mb-14 text-center text-muted-foreground">
            まずは無料プランからお試しください
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border-2 bg-background p-7 transition-all duration-200 hover:-translate-y-1 ${
                  plan.highlighted
                    ? "border-primary"
                    : "border-border"
                }`}
                style={{
                  boxShadow: plan.highlighted
                    ? "var(--shadow-glow)"
                    : "var(--shadow-sm)",
                }}
              >
                {plan.highlighted && (
                  <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                    </svg>
                    おすすめ
                  </div>
                )}
                <h3 className="mb-1 text-lg font-bold">{plan.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-bold">{plan.priceLabel}</span>
                </div>
                <ul className="mb-7 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.price === 0 ? (
                  <Link
                    href="/create"
                    className="flex h-11 items-center justify-center rounded-full border border-border text-sm font-semibold transition-all duration-200 hover:bg-muted hover:-translate-y-0.5"
                  >
                    無料で始める
                  </Link>
                ) : (
                  <CheckoutButton
                    plan={plan.id}
                    variant={plan.highlighted ? "primary" : "outline"}
                    className="w-full rounded-full"
                  >
                    プランを選択
                  </CheckoutButton>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-4 py-20 text-center sm:py-28">
        <div className="blob-2 left-1/3 -top-20 opacity-30" />
        <div className="blob-1 -right-40 bottom-0 opacity-20" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
            今すぐ動画を作成しませんか？
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            アカウント登録なしですぐに試せます。
          </p>
          <Link
            href="/create"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-10 text-base font-semibold text-white transition-all duration-200 hover:bg-primary-hover hover:-translate-y-0.5"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M3.75 3A1.75 1.75 0 002 4.75v10.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-8.5A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H3.75z" />
            </svg>
            無料で動画を作成
          </Link>
        </div>
      </section>
    </div>
  );
}
