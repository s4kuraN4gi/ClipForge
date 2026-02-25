import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// CSP ディレクティブ
// Supabase / Stripe / BytePlus / Sentry の外部ドメインを許可
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co",
  "media-src 'self' blob: https://*.supabase.co https://*.volces.com",
  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://open.byteplusapi.com https://*.ingest.sentry.io",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

const cspHeader = cspDirectives.join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry org / project はビルド時に環境変数から取得
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // ソースマップアップロード用トークン
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // CI 以外ではログを抑制
  silent: !process.env.CI,

  // /monitoring を経由してSentryに送信（ad-blocker 回避）
  tunnelRoute: "/monitoring",

  // ソースマップアップロード後に削除（デフォルト true）
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // ソースマップアップロード対象を拡張
  widenClientFileUpload: true,
});
