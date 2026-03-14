import type {
  VideoGenerateResponse,
  VideoTaskStatus,
  VideoProvider,
  VideoGenerationParams,
} from "../types";

const PREDICTIONS_URL = "https://api.replicate.com/v1/predictions";
const MODEL_OWNER = "kwaivgi";
const MODEL_NAME = "kling-v3-omni-video";
const CREATE_URL = `https://api.replicate.com/v1/models/${MODEL_OWNER}/${MODEL_NAME}/predictions`;

function getApiToken(): string {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }
  return token;
}

export class KlingProvider implements VideoProvider {
  readonly allowedVideoHosts = [
    "replicate.delivery",
    "pbxt.replicate.delivery",
  ];

  async createGeneration(
    params: VideoGenerationParams
  ): Promise<VideoGenerateResponse> {
    const response = await fetch(CREATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${getApiToken()}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        input: {
          reference_images: [params.imageUrl],
          prompt: params.prompt,
          duration: params.duration || 5,
          aspect_ratio: params.aspectRatio || "9:16",
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Replicate API error (${response.status}): ${errorBody}`
      );
    }

    const data = await response.json();

    return {
      id: data.id,
      status: mapStatus(data.status),
      message: "Kling 3.0 task submitted via Replicate",
    };
  }

  async getStatus(taskId: string): Promise<VideoTaskStatus> {
    const response = await fetch(`${PREDICTIONS_URL}/${taskId}`, {
      headers: {
        Authorization: `Token ${getApiToken()}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Replicate status error (${response.status}): ${errorBody}`
      );
    }

    const data = await response.json();
    const status = mapStatus(data.status);

    if (status === "completed" && data.output) {
      const videoUrl = Array.isArray(data.output)
        ? data.output[0]
        : data.output;
      return {
        id: taskId,
        status: "completed",
        progress: 100,
        data: videoUrl ? { video_url: videoUrl } : undefined,
      };
    }

    if (status === "failed") {
      return {
        id: taskId,
        status: "failed",
        progress: 0,
        error: data.error || "Kling generation failed",
      };
    }

    return {
      id: taskId,
      status,
      progress: status === "processing" ? 50 : 0,
    };
  }
}

function mapStatus(
  replicateStatus: string
): "queued" | "processing" | "completed" | "failed" {
  switch (replicateStatus) {
    case "succeeded":
      return "completed";
    case "failed":
    case "canceled":
      return "failed";
    case "processing":
      return "processing";
    default:
      return "queued";
  }
}
