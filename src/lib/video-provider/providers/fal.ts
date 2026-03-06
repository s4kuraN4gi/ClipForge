import type {
  VideoGenerateResponse,
  VideoTaskStatus,
  VideoProvider,
  VideoGenerationParams,
} from "../types";

const FAL_QUEUE_URL = "https://queue.fal.run";

export type FalModel = "wan" | "hailuo";

interface FalModelConfig {
  modelId: string;
  mapInput: (params: VideoGenerationParams) => Record<string, unknown>;
}

const FAL_MODELS: Record<FalModel, FalModelConfig> = {
  wan: {
    modelId: process.env.FAL_WAN_MODEL_ID || "fal-ai/wan-i2v",
    mapInput: (params) => ({
      image_url: params.imageUrl,
      prompt: params.prompt,
      num_frames: 81, // ~5.4s at 15fps (720p)
      resolution: "720p",
    }),
  },
  hailuo: {
    modelId:
      process.env.FAL_HAILUO_MODEL_ID ||
      "fal-ai/minimax/hailuo-02/standard/image-to-video",
    mapInput: (params) => ({
      image_url: params.imageUrl,
      prompt: params.prompt,
      duration: "5",
      prompt_optimizer: true,
    }),
  },
};

function getApiKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY is not set");
  }
  return key;
}

// submit応答に含まれるURLをキャッシュ（ネストされたモデルIDのURL構築問題を回避）
const taskUrlCache = new Map<
  string,
  { statusUrl: string; responseUrl: string }
>();

export class FalProvider implements VideoProvider {
  private config: FalModelConfig;
  readonly allowedVideoHosts = ["fal.media"];

  constructor(model: FalModel) {
    this.config = FAL_MODELS[model];
  }

  async createGeneration(
    params: VideoGenerationParams
  ): Promise<VideoGenerateResponse> {
    const input = this.config.mapInput(params);

    const response = await fetch(
      `${FAL_QUEUE_URL}/${this.config.modelId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${getApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `fal.ai API error (${response.status}): ${errorBody}`
      );
    }

    const data = await response.json();
    const requestId = data.request_id;

    // submit応答のURLをキャッシュ
    if (data.status_url && data.response_url) {
      taskUrlCache.set(requestId, {
        statusUrl: data.status_url,
        responseUrl: data.response_url,
      });
    }

    return {
      id: requestId,
      status: "queued",
      message: "fal.ai task submitted",
    };
  }

  private getTaskUrls(taskId: string) {
    const cached = taskUrlCache.get(taskId);
    if (cached) return cached;

    // キャッシュミス時はURL構築にフォールバック
    return {
      statusUrl: `${FAL_QUEUE_URL}/${this.config.modelId}/requests/${taskId}/status`,
      responseUrl: `${FAL_QUEUE_URL}/${this.config.modelId}/requests/${taskId}`,
    };
  }

  async getStatus(taskId: string): Promise<VideoTaskStatus> {
    const urls = this.getTaskUrls(taskId);

    const statusResponse = await fetch(urls.statusUrl, {
      headers: { Authorization: `Key ${getApiKey()}` },
    });

    if (!statusResponse.ok) {
      const errorBody = await statusResponse.text();
      throw new Error(
        `fal.ai status error (${statusResponse.status}): ${errorBody}`
      );
    }

    const statusData = await statusResponse.json();

    // 完了: 結果を取得して動画URLを返す
    if (statusData.status === "COMPLETED") {
      const resultResponse = await fetch(urls.responseUrl, {
        headers: { Authorization: `Key ${getApiKey()}` },
      });

      if (!resultResponse.ok) {
        const errorBody = await resultResponse.text();
        throw new Error(
          `fal.ai result error (${resultResponse.status}): ${errorBody}`
        );
      }

      const resultData = await resultResponse.json();

      // 完了後キャッシュをクリーンアップ
      taskUrlCache.delete(taskId);

      return {
        id: taskId,
        status: "completed",
        progress: 100,
        data: resultData.video?.url
          ? { video_url: resultData.video.url }
          : undefined,
      };
    }

    // 失敗
    if (statusData.status === "FAILED") {
      taskUrlCache.delete(taskId);
      return {
        id: taskId,
        status: "failed",
        progress: 0,
        error: statusData.error || "fal.ai generation failed",
      };
    }

    // キュー待ち or 処理中
    return {
      id: taskId,
      status: statusData.status === "IN_QUEUE" ? "queued" : "processing",
      progress: statusData.status === "IN_QUEUE" ? 0 : 50,
    };
  }
}
