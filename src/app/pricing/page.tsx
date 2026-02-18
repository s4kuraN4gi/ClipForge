import Link from "next/link";
import { PRICING_PLANS } from "@/lib/constants";
import { CheckoutButton } from "@/components/pricing/checkout-button";

export default function PricingPage() {
  return (
    <div className="relative px-4 py-12 sm:py-20">
      <div className="blob-1 -left-60 top-40 opacity-20" />

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-4 text-center text-sm font-medium text-primary">
          PRICING
        </div>
        <h1 className="mb-4 text-center text-2xl font-bold sm:text-3xl">
          料金プラン
        </h1>
        <p className="mb-14 text-center text-muted-foreground">
          まずは無料プランからお試しください
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border-2 bg-background p-7 transition-all duration-200 hover:-translate-y-1 ${
                plan.highlighted ? "border-primary" : "border-border"
              }`}
              style={{
                boxShadow: plan.highlighted
                  ? "var(--shadow-glow)"
                  : "var(--shadow-sm)",
              }}
            >
              {plan.highlighted && (
                <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                      clipRule="evenodd"
                    />
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
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
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
    </div>
  );
}
