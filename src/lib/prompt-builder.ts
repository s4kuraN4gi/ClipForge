/**
 * 構造化プロンプトビルダー
 * テンプレートプロンプト + 商品名 + 品質ブースターを結合
 */

const MAX_PROMPT_LENGTH = 200;

function sanitize(input: string): string {
  return input.replace(/[\x00-\x1F\x7F"\\]/g, "").trim();
}

export function buildVideoPrompt(ctx: {
  templatePrompt: string;
  productName?: string;
  customPrompt?: string;
}): string {
  const base = ctx.customPrompt?.trim() || ctx.templatePrompt;
  const parts: string[] = [];

  if (ctx.productName) {
    parts.push(`A ${sanitize(ctx.productName)}`);
  }

  parts.push(base);
  parts.push("high quality commercial, professional production");

  return parts.join(", ").slice(0, MAX_PROMPT_LENGTH);
}
