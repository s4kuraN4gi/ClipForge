import type { Template, PricingPlan, TemplateType } from "@/types";

export const TEMPLATES: Template[] = [
  {
    id: "showcase",
    name: "商品紹介",
    description: "写真を順番に見せる標準的な商品紹介動画",
    icon: "📦",
    prompt:
      "Smooth product showcase with gentle camera movement, professional lighting, clean background transitions between each product angle",
  },
  {
    id: "before_after",
    name: "Before / After",
    description: "使用前→使用後の変化を印象的に見せる比較動画",
    icon: "✨",
    prompt:
      "Dramatic before and after transformation, split screen transition effect, revealing the improved result with satisfying motion",
  },
  {
    id: "rotation",
    name: "360° 回転風",
    description: "複数アングルの写真を回転するように見せる動画",
    icon: "🔄",
    prompt:
      "Smooth 360 degree rotation effect around the product, seamless transitions between different angles, professional turntable-style presentation",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "無料プラン",
    price: 0,
    priceLabel: "¥0",
    features: [
      "サンプル動画で体験",
      "3種類のテンプレート",
      "アカウント登録不要",
    ],
    videoLimit: 0,
  },
  {
    id: "basic",
    name: "ベーシック",
    price: 980,
    priceLabel: "¥980/月",
    features: [
      "月30本まで生成",
      "透かしなし",
      "1080p画質",
      "3種類のテンプレート",
      "BGM自動選択",
    ],
    videoLimit: 30,
    highlighted: true,
  },
  {
    id: "pro",
    name: "プロ",
    price: 1980,
    priceLabel: "¥1,980/月",
    features: [
      "無制限生成",
      "透かしなし",
      "4K対応",
      "全テンプレート",
      "BGM自動選択",
      "独自ブランディング",
    ],
    videoLimit: null,
  },
];

export const MAX_IMAGES = 5;
export const MIN_IMAGES = 1;
export const MAX_IMAGE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

export const VIDEO_DURATION_SECONDS = 8;
export const VIDEO_RESOLUTION = "1080p";
export const VIDEO_ASPECT_RATIO = "9:16";

export const POLL_INTERVAL_MS = 5000;
export const MAX_POLL_ATTEMPTS = 60;

// サンプル体験用定数
export const SAMPLE_IMAGE_POOL = [
  { src: "/samples/images/showcase-1.png", label: "レザーウォレット 正面" },
  { src: "/samples/images/showcase-2.png", label: "レザーウォレット 内側" },
  { src: "/samples/images/showcase-3.png", label: "レザーウォレット ディテール" },
  { src: "/samples/images/before-after-1.png", label: "キャンドル素材 Before" },
  { src: "/samples/images/before-after-2.png", label: "ボタニカルキャンドル After" },
  { src: "/samples/images/rotation-1.png", label: "陶器マグカップ 正面" },
  { src: "/samples/images/rotation-2.png", label: "陶器マグカップ 斜め" },
  { src: "/samples/images/rotation-3.png", label: "陶器マグカップ 背面" },
];

export const SAMPLE_VIDEOS: Record<TemplateType, string> = {
  showcase: "/samples/videos/showcase.mp4",
  before_after: "/samples/videos/before-after.mp4",
  rotation: "/samples/videos/rotation.mp4",
};

export const SAMPLE_GENERATION_DURATION_MS = 6000;
export const SAMPLE_PROGRESS_INTERVAL_MS = 300;
