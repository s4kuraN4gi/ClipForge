import type {
  SeedanceGenerateRequest,
  SeedanceGenerateResponse,
  SeedanceTaskStatus,
} from "./types";
import { createMockGeneration, getMockTaskStatus } from "./mock";

const BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3";
const MODEL_ID = "seedance-2.0";

function getApiKey(): string {
  const key = process.env.BYTEPLUS_API_KEY;
  if (!key) {
    throw new Error("BYTEPLUS_API_KEY is not set");
  }
  return key;
}

function useMock(): boolean {
  // 明示的にモック指定、または API キー未設定時は自動でモックを使用
  return process.env.SEEDANCE_USE_MOCK === "true" || !process.env.BYTEPLUS_API_KEY;
}

export async function createVideoGeneration(params: {
  imageUrl: string;
  prompt: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  watermark?: boolean;
}): Promise<SeedanceGenerateResponse> {
  if (useMock()) {
    return createMockGeneration();
  }

  const request: SeedanceGenerateRequest = {
    model: MODEL_ID,
    image_url: params.imageUrl,
    prompt: params.prompt,
    duration: params.duration ?? 8,
    resolution: params.resolution ?? "1080p",
    aspect_ratio: params.aspectRatio ?? "9:16",
    watermark: params.watermark ?? false,
  };

  const response = await fetch(`${BASE_URL}/video/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Seedance API error (${response.status}): ${errorBody}`
    );
  }

  return response.json();
}

export async function getTaskStatus(
  taskId: string
): Promise<SeedanceTaskStatus> {
  if (useMock()) {
    return getMockTaskStatus(taskId);
  }

  const response = await fetch(
    `${BASE_URL}/video/generations/${taskId}`,
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

  return response.json();
}
