import type {
  VideoGenerateResponse,
  VideoTaskStatus,
  VideoProvider,
  VideoGenerationParams,
} from "../types";

const BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3";

// Seedance 1.5 Pro（BytePlus で現在利用可能な最新モデル）
const MODEL_ID =
  process.env.SEEDANCE_MODEL_ID || "seedance-1-5-pro-251215";

function getApiKey(): string {
  const key = process.env.BYTEPLUS_API_KEY;
  if (!key) {
    throw new Error("BYTEPLUS_API_KEY is not set");
  }
  return key;
}

export class SeedanceProvider implements VideoProvider {
  readonly allowedVideoHosts = [
    "volces.com",
    "bytepluses.com",
    "byteplus.com",
  ];

  async createGeneration(
    params: VideoGenerationParams
  ): Promise<VideoGenerateResponse> {
    const requestBody = {
      model: MODEL_ID,
      content: [
        {
          type: "image_url",
          image_url: {
            url: params.imageUrl,
            detail: "first_frame",
          },
        },
        {
          type: "text",
          text: params.prompt,
        },
      ],
      ...(params.duration && { duration: params.duration }),
      ...(params.resolution && { resolution: params.resolution }),
      ...(params.aspectRatio && { aspect_ratio: params.aspectRatio }),
    };

    const response = await fetch(
      `${BASE_URL}/contents/generations/tasks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Seedance API error (${response.status}): ${errorBody}`
      );
    }

    const data = await response.json();

    return {
      id: data.id || data.task_id,
      status: data.status || "pending",
      message: data.message,
    };
  }

  async getStatus(taskId: string): Promise<VideoTaskStatus> {
    const response = await fetch(
      `${BASE_URL}/contents/generations/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Seedance API error (${response.status}): ${errorBody}`
      );
    }

    const data = await response.json();

    const apiStatus = data.status || "pending";
    const normalizedStatus =
      apiStatus === "succeeded"
        ? "completed"
        : apiStatus === "running"
          ? "processing"
          : apiStatus;

    return {
      id: data.id || taskId,
      status: normalizedStatus,
      progress: normalizedStatus === "completed" ? 100 : 0,
      data: data.content?.video_url
        ? { video_url: data.content.video_url }
        : undefined,
      error: data.error?.message,
      meta: data.usage
        ? { usage: { total_tokens: data.usage.total_tokens ?? 0 } }
        : undefined,
    };
  }
}
