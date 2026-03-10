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
      "slowly rotating on a turntable, smooth orbit camera, soft studio lighting with white background, clean product photography",
  },
  {
    id: "rotation",
    name: "360°回転風",
    description: "回転するように見せる動画",
    icon: "🔄",
    category: "basic",
    prompt:
      "smooth 360 degree continuous rotation on turntable, seamless loop, even studio lighting from all angles, product centered in frame",
  },
  {
    id: "close_up",
    name: "クローズアップ",
    description: "素材感・質感にフォーカスした接写風",
    icon: "🔍",
    category: "basic",
    prompt:
      "extreme macro close-up slowly drifting across surface textures, shallow depth of field with creamy bokeh, revealing fine material details and craftsmanship",
  },
  {
    id: "minimal",
    name: "ミニマル",
    description: "シンプルな白背景で商品を際立たせる",
    icon: "⬜",
    category: "basic",
    prompt:
      "clean minimal presentation on pure white infinity background, soft even shadowless lighting, subtle slow push-in zoom on product silhouette",
  },
  // ── 演出（Effects） ──
  {
    id: "before_after",
    name: "Before / After",
    description: "変化を印象的に見せる比較動画",
    icon: "✨",
    category: "effects",
    prompt:
      "dramatic before-and-after split wipe transition from left to right, dull version transforms into vibrant polished result, satisfying reveal with flash of light",
  },
  {
    id: "dramatic",
    name: "ドラマチック",
    description: "光と影の印象的な演出で高級感",
    icon: "🎬",
    category: "effects",
    prompt:
      "cinematic slow reveal from darkness, deep shadows with warm golden rim lighting, subtle lens flare, luxury brand commercial, moody atmosphere",
  },
  {
    id: "sparkle",
    name: "スパークル",
    description: "キラキラ輝くエフェクト（アクセサリー向け）",
    icon: "💎",
    category: "effects",
    prompt:
      "sparkling light refractions on surface, shimmering particles floating, slow rotation under spotlight, jewelry commercial with black velvet background",
  },
  {
    id: "zoom_in",
    name: "ズームイン",
    description: "遠景→近景の引き込み効果",
    icon: "🎯",
    category: "effects",
    prompt:
      "dynamic dolly zoom from wide establishing shot to tight close-up, smooth accelerating camera push, dramatic rack focus pulling attention to product center",
  },
  // ── シーン（Scene） ──
  {
    id: "lifestyle",
    name: "ライフスタイル",
    description: "使用シーンをイメージした日常感",
    icon: "🏠",
    category: "scene",
    prompt:
      "warm lifestyle scene with golden hour natural window light, cozy home interior, product placed on wooden table, gentle camera pan with shallow depth of field",
  },
  {
    id: "gift",
    name: "ギフト",
    description: "プレゼント・ギフト感を演出",
    icon: "🎁",
    category: "scene",
    prompt:
      "elegant gift unwrapping reveal with satin ribbon slowly untying, festive warm bokeh lights in background, anticipation buildup with final product reveal",
  },
  {
    id: "seasonal",
    name: "シーズナル",
    description: "季節の雰囲気を演出",
    icon: "🌸",
    category: "scene",
    prompt:
      "soft cherry blossom petals gently falling around product, warm spring sunlight with lens flare, dreamy pastel color palette, slow gentle camera drift",
  },
  {
    id: "floating",
    name: "フローティング",
    description: "浮遊感のある幻想的な演出",
    icon: "🫧",
    category: "scene",
    prompt:
      "product floating weightlessly in mid-air with soft light particles and bubbles, ethereal dreamy gradient background, gentle slow rotation while suspended",
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
