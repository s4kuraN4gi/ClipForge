/**
 * 構造化プロンプトビルダー
 * Image-to-Video ではモーション・カメラ指示のみに特化する。
 * 商品名等の被写体情報はプロンプトに含めない（AIが画像を無視して新規生成するため）。
 * 商品名・価格・キャッチコピーはFFmpegテキストオーバーレイで表示する。
 */

const MAX_PROMPT_LENGTH = 200;

export function buildVideoPrompt(ctx: {
  templatePrompt: string;
  customPrompt?: string;
}): string {
  const base = ctx.customPrompt?.trim() || ctx.templatePrompt;
  return base.slice(0, MAX_PROMPT_LENGTH);
}
