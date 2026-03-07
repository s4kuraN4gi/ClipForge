import type { Template, PricingPlan, TemplateType, TemplateCategory } from "@/types";

// テンプレートカテゴリ
export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "basic", label: "基本" },
  { id: "effects", label: "演出" },
  { id: "scene", label: "シーン" },
];

export const TEMPLATES: Template[] = [
  // ── 基本（Basic） ──
  {
    id: "showcase",
    name: "商品紹介",
    description: "標準的な商品紹介動画",
    icon: "📦",
    category: "basic",
    prompt:
      "Smooth product showcase with gentle camera movement, professional lighting, clean background transitions between each product angle",
  },
  {
    id: "rotation",
    name: "360°回転風",
    description: "回転するように見せる動画",
    icon: "🔄",
    category: "basic",
    prompt:
      "Smooth 360 degree rotation effect around the product, seamless transitions between different angles, professional turntable-style presentation",
  },
  {
    id: "close_up",
    name: "クローズアップ",
    description: "素材感・質感にフォーカスした接写風",
    icon: "🔍",
    category: "basic",
    prompt:
      "Extreme close-up macro shot revealing fine textures and material details, slow gentle camera drift across the surface, shallow depth of field with soft bokeh background",
  },
  {
    id: "minimal",
    name: "ミニマル",
    description: "シンプルな白背景で商品を際立たせる",
    icon: "⬜",
    category: "basic",
    prompt:
      "Clean minimal presentation on pure white background, soft even lighting with no shadows, subtle slow zoom emphasizing product silhouette",
  },
  // ── 演出（Effects） ──
  {
    id: "before_after",
    name: "Before / After",
    description: "変化を印象的に見せる比較動画",
    icon: "✨",
    category: "effects",
    prompt:
      "Dramatic before and after transformation, split screen transition effect, revealing the improved result with satisfying motion",
  },
  {
    id: "dramatic",
    name: "ドラマチック",
    description: "光と影の印象的な演出で高級感",
    icon: "🎬",
    category: "effects",
    prompt:
      "Cinematic dramatic lighting with deep shadows and golden highlights, slow reveal with lens flare, luxury brand advertisement style",
  },
  {
    id: "sparkle",
    name: "スパークル",
    description: "キラキラ輝くエフェクト（アクセサリー向け）",
    icon: "💎",
    category: "effects",
    prompt:
      "Sparkling glitter and light refraction effects around the product, shimmering particles floating in the air, jewelry commercial style presentation",
  },
  {
    id: "zoom_in",
    name: "ズームイン",
    description: "遠景→近景の引き込み効果",
    icon: "🎯",
    category: "effects",
    prompt:
      "Dynamic zoom-in from wide establishing shot to tight close-up, smooth accelerating camera movement, attention-grabbing reveal effect",
  },
  // ── シーン（Scene） ──
  {
    id: "lifestyle",
    name: "ライフスタイル",
    description: "使用シーンをイメージした日常感",
    icon: "🏠",
    category: "scene",
    prompt:
      "Warm lifestyle setting with natural daylight, cozy home environment, product placed naturally in everyday scene with gentle camera panning",
  },
  {
    id: "gift",
    name: "ギフト",
    description: "プレゼント・ギフト感を演出",
    icon: "🎁",
    category: "scene",
    prompt:
      "Gift unwrapping reveal with ribbon and wrapping paper, festive warm lighting, elegant presentation as a present with anticipation buildup",
  },
  {
    id: "seasonal",
    name: "シーズナル",
    description: "季節の雰囲気を演出",
    icon: "🌸",
    category: "scene",
    prompt:
      "Seasonal atmosphere with cherry blossoms or autumn leaves gently falling, soft natural lighting evoking the current season, dreamy aesthetic",
  },
  {
    id: "floating",
    name: "フローティング",
    description: "浮遊感のある幻想的な演出",
    icon: "🫧",
    category: "scene",
    prompt:
      "Product floating weightlessly in mid-air with soft bubbles and particles, ethereal dreamy atmosphere, gentle rotation while suspended",
  },
];

// ハイブリッド型料金定数
export const PRO_INCLUDED_VIDEOS = 5;
export const PRO_EXTRA_PRICE = 200;
export const PRO_SAFETY_CAP = 50; // 暴走防止（月50本上限 = 最大追加¥9,000）

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "無料プラン",
    price: 0,
    priceLabel: "¥0",
    features: [
      "1本無料で生成（透かし付き）",
      "12種類のテンプレート",
      "アカウント登録で利用可能",
    ],
    videoLimit: 1,
    includedVideos: 1,
    extraPricePerVideo: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: 980,
    priceLabel: "¥980/月",
    features: [
      "毎月5本まで追加料金なし",
      "追加は1本¥200（月末まとめ請求）",
      "透かしなし",
      "1080p画質",
      "12種類のテンプレート",
    ],
    videoLimit: null, // 従量課金のため上限なし（safety capは別管理）
    includedVideos: 5,
    extraPricePerVideo: 200,
    highlighted: true,
  },
];

export const MAX_IMAGES = 1;
export const MIN_IMAGES = 1;
export const MAX_IMAGE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

// 動画尺オプション
export const DURATION_OPTIONS = [
  { value: 5, label: "5秒" },
  { value: 10, label: "10秒" },
] as const;
export const DEFAULT_DURATION = 5;
export const VIDEO_DURATION_SECONDS = 5;
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

export const DEFAULT_SAMPLE_VIDEO = "/samples/videos/showcase.mp4";

export const SAMPLE_VIDEOS: Partial<Record<TemplateType, string>> = {
  showcase: "/samples/videos/showcase.mp4",
  before_after: "/samples/videos/before-after.mp4",
  rotation: "/samples/videos/rotation.mp4",
};

export const SAMPLE_GENERATION_DURATION_MS = 6000;
export const SAMPLE_PROGRESS_INTERVAL_MS = 300;
