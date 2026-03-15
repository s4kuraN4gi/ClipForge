import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { TemplateCategory } from "@/types";

const execFileAsync = promisify(execFile);

const FFMPEG_TIMEOUT_MS = 60_000;

const BGM_MAP: Record<TemplateCategory, string> = {
  basic: "upbeat-corporate.mp3",
  effects: "cinematic-dramatic.mp3",
  scene: "warm-acoustic.mp3",
};

// assets ディレクトリのパス（Docker 内では /app/assets）
function getAssetsDir(): string {
  return process.env.ASSETS_DIR || join(process.cwd(), "assets");
}

export interface PostProcessOptions {
  videoBuffer: ArrayBuffer;
  productName?: string | null;
  productPrice?: string | null;
  catchphrase?: string | null;
  templateCategory: TemplateCategory;
  addWatermark: boolean;
  duration?: number; // 動画の長さ（秒）。デフォルト5
}

export interface PostProcessResult {
  buffer: Buffer;
}

/**
 * FFmpeg で動画に後処理を適用
 * - フェードイン/アウト (0.5秒)
 * - テキストオーバーレイ（商品名・価格・キャッチコピー）
 * - BGM合成（音量30%）
 * - ロゴ透かし（無料ユーザーのみ）
 */
export async function postProcessVideo(
  opts: PostProcessOptions
): Promise<PostProcessResult> {
  const tmpDir = await mkdtemp(join(tmpdir(), "picavel-ffmpeg-"));

  try {
    const inputPath = join(tmpDir, "input.mp4");
    const outputPath = join(tmpDir, "output.mp4");

    await writeFile(inputPath, Buffer.from(opts.videoBuffer));

    // 動画の実際の長さを ffprobe で取得（API指定値と微妙にずれる場合がある）
    let dur = opts.duration || 5;
    try {
      const { stdout } = await execFileAsync("ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        inputPath,
      ]);
      const probedDuration = parseFloat(stdout.trim());
      if (probedDuration > 0 && isFinite(probedDuration)) {
        dur = Math.round(probedDuration);
      }
    } catch {
      // ffprobe 失敗時は opts.duration を使用
    }
    const assetsDir = getAssetsDir();
    const bgmFile = BGM_MAP[opts.templateCategory] || BGM_MAP.basic;
    const bgmPath = join(assetsDir, "bgm", bgmFile);
    const logoPath = join(assetsDir, "watermark", "picavel-logo.png");

    // フォントパス（Alpine: font-noto-cjk パッケージ）
    const fontPath =
      process.env.FFMPEG_FONT_PATH ||
      "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc";

    // ビデオフィルター構築
    const videoFilters: string[] = [];

    // フェードイン/アウト
    videoFilters.push("fade=in:0:d=0.5");
    videoFilters.push(`fade=out:st=${dur - 0.5}:d=0.5`);

    // テキストオーバーレイ
    if (opts.productName) {
      const escapedName = escapeFFmpegText(opts.productName);
      videoFilters.push(
        `drawtext=text='${escapedName}':fontfile='${fontPath}':fontsize=42:` +
          "fontcolor=white:shadowcolor=black@0.7:shadowx=2:shadowy=2:" +
          "x=(w-tw)/2:y=h*0.70"
      );
    }

    if (opts.productPrice) {
      const escapedPrice = escapeFFmpegText(opts.productPrice);
      videoFilters.push(
        `drawtext=text='${escapedPrice}':fontfile='${fontPath}':fontsize=52:` +
          "fontcolor=white:shadowcolor=black@0.7:shadowx=2:shadowy=2:" +
          "x=(w-tw)/2:y=h*0.76"
      );
    }

    if (opts.catchphrase) {
      const escapedCatchphrase = escapeFFmpegText(opts.catchphrase);
      videoFilters.push(
        `drawtext=text='${escapedCatchphrase}':fontfile='${fontPath}':fontsize=28:` +
          "fontcolor=white@0.9:shadowcolor=black@0.7:shadowx=1:shadowy=1:" +
          "x=(w-tw)/2:y=h*0.83"
      );
    }

    // ── BGM前処理: アルバムアート除去 ──
    // Pixabay等のMP3にはアルバムアート（カバー画像）が映像ストリームとして
    // 埋め込まれていることがある。FFmpegはこれを映像入力として認識するため、
    // filter_complex のストリームインデックスがずれ、意図しない映像が
    // 出力に混入する原因になる。事前にffmpegで音声のみ抽出して防ぐ。
    const cleanBgmPath = join(tmpDir, "bgm_clean.aac");
    try {
      await execFileAsync("ffmpeg", [
        "-i", bgmPath,
        "-vn",              // 映像ストリーム（アルバムアート含む）を除外
        "-acodec", "copy",  // 再エンコードせずコピー（高速）
        "-y", cleanBgmPath,
      ], { timeout: 10_000 });
    } catch {
      // acodec copy が失敗する場合は再エンコード（MP3→AAC）
      await execFileAsync("ffmpeg", [
        "-i", bgmPath,
        "-vn",
        "-acodec", "aac",
        "-b:a", "128k",
        "-y", cleanBgmPath,
      ], { timeout: 15_000 });
    }

    // filter_complex の構築
    // 入力構成（アルバムアート除去済み）:
    //   input 0: AI生成動画 (映像のみ)
    //   input 1: BGM (音声のみ、映像ストリームなし)
    //   input 2: ロゴPNG (透かし用、addWatermark時のみ)
    const args: string[] = ["-i", inputPath, "-i", cleanBgmPath];
    let filterComplex: string;

    if (opts.addWatermark) {
      args.push("-i", logoPath);
      const videoChain = videoFilters.join(",");
      filterComplex =
        `[0:v]${videoChain}[v];` +
        `[2:v]scale=80:-1,colorchannelmixer=aa=0.4[logo];` +
        `[v][logo]overlay=W-w-20:H-h-20[outv]`;
      args.push("-filter_complex", filterComplex);
      args.push("-map", "[outv]");
    } else {
      const videoChain = videoFilters.join(",");
      filterComplex = `[0:v]${videoChain}[outv]`;
      args.push("-filter_complex", filterComplex);
      args.push("-map", "[outv]");
    }

    // オーディオ: BGM ミックス
    args.push("-map", "1:a");
    args.push(
      "-af",
      `afade=in:0:d=0.5,afade=out:st=${dur - 1}:d=1,volume=0.3`
    );
    // -shortest は -filter_complex と併用時に無視されるバグがあるため
    // -t で明示的に出力時間を制限する（FFmpeg Bug #3789）
    args.push("-t", String(dur));

    // エンコード設定
    args.push(
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-y",
      outputPath
    );

    await execFileAsync("ffmpeg", args, {
      timeout: FFMPEG_TIMEOUT_MS,
    });

    const outputBuffer = await readFile(outputPath);
    return { buffer: outputBuffer };
  } finally {
    // クリーンアップ
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * FFmpeg drawtext 用のテキストエスケープ
 */
function escapeFFmpegText(text: string): string {
  return text
    .replace(/\\/g, "\\\\\\\\")
    .replace(/'/g, "'\\''")
    .replace(/:/g, "\\:")
    .replace(/%/g, "%%");
}
