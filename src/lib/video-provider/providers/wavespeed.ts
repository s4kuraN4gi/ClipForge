import type {
  VideoGenerateResponse,
  VideoTaskStatus,
  VideoProvider,
  VideoGenerationParams,
} from "../types";

const BASE_URL = "https://api.wavespeed.ai/api/v3";

export type WaveSpeedModel = "wan-720p" | "wan-720p-fast" | "wan-480p";

const MODEL_PATHS: Record<WaveSpeedModel, string> = {
  "wan-720p": "wavespeed-ai/wan-2.1/i2v-720p",
  "wan-720p-fast": "wavespeed-ai/wan-2.1/i2v-720p-ultra-fast",
  "wan-480p": "wavespeed-ai/wan-2.1/i2v-480p",
};

function getApiKey(): string {
  const key = process.env.WAVESPEED_API_KEY;
  if (!key) {
    throw new Error("WAVESPEED_API_KEY is not set");
  }
  return key;
}

export class WaveSpeedProvider implements VideoProvider {
  private modelPath: string;
  // WaveSpeed は CloudFront CDN 経由で動画を配信
  readonly allowedVideoHosts = [
    "d2p7pge43lyniu.cloudfront.net",
    "wavespeed.ai",
  ];

  constructor(model: WaveSpeedModel = "wan-720p") {
    this.modelPath =
      MODEL_PATHS[model] || MODEL_PATHS["wan-720p"];
  }

  async createGeneration(
    params: VideoGenerationParams
  ): Promise<VideoGenerateResponse> {
    // aspectRatio に応じてサイズを決定（デフォルト: 9:16 縦型）
    const isVertical = params.aspectRatio === "9:16" || !params.aspectRatio;
    const size = isVertical ? "720*1280" : "1280*720";

    const response = await fetch(`${BASE_URL}/${this.modelPath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: params.imageUrl,
        prompt: params.prompt,
        size,
        duration: params.duration || 5,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `WaveSpeed API error (${response.status}): ${errorBody}`
      );
    }

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(
        `WaveSpeed API error: ${result.message || "Unknown error"}`
      );
    }

    return {
      id: result.data.id,
      status: "queued",
      message: "WaveSpeed task submitted",
    };
  }

  async getStatus(taskId: string): Promise<VideoTaskStatus> {
    const response = await fetch(
      `${BASE_URL}/predictions/${taskId}/result`,
      {
        headers: { Authorization: `Bearer ${getApiKey()}` },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `WaveSpeed status error (${response.status}): ${errorBody}`
      );
    }

    const result = await response.json();
    const data = result.data;

    // 完了
    if (data.status === "completed") {
      return {
        id: taskId,
        status: "completed",
        progress: 100,
        data: data.outputs?.[0]
          ? { video_url: data.outputs[0] }
          : undefined,
      };
    }

    // 失敗
    if (data.status === "failed") {
      return {
        id: taskId,
        status: "failed",
        progress: 0,
        error: data.error || "WaveSpeed generation failed",
      };
    }

    // created or processing
    return {
      id: taskId,
      status: data.status === "created" ? "queued" : "processing",
      progress: data.status === "created" ? 0 : 50,
    };
  }
}
