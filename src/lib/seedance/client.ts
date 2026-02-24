import type {
  SeedanceGenerateResponse,
  SeedanceTaskStatus,
} from "./types";
import { createMockGeneration, getMockTaskStatus } from "./mock";

const BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3";

// Seedance 1.5 Pro（BytePlus で現在利用可能な最新モデル）
// Seedance 2.0 が正式リリースされたらモデル ID を更新
const MODEL_ID = process.env.SEEDANCE_MODEL_ID || "seedance-1-5-pro-251215";

function getApiKey(): string {
  const key = process.env.BYTEPLUS_API_KEY;
  if (!key) {
    throw new Error("BYTEPLUS_API_KEY is not set");
  }
  return key;
}

function useMock(): boolean {
  // 明示的にモック指定時のみモックを使用（開発用）
  if (process.env.SEEDANCE_USE_MOCK === "true") {
    return true;
  }
  // 本番環境で API キー未設定は設定ミス → エラーにする
  if (!process.env.BYTEPLUS_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "BYTEPLUS_API_KEY が未設定です。本番環境では API キーの設定が必須です。"
      );
    }
    // 開発環境では API キー未設定時に自動でモック
    return true;
  }
  return false;
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

  // BytePlus ModelArk Video Generation API 形式
  // content 配列で画像（first_frame）とテキスト（prompt）を指定
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

  const response = await fetch(`${BASE_URL}/contents/generations/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Seedance API error (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();

  // ModelArk のレスポンスを統一形式に変換
  return {
    id: data.id || data.task_id,
    status: data.status || "pending",
    message: data.message,
  };
}

export async function getTaskStatus(
  taskId: string
): Promise<SeedanceTaskStatus> {
  if (useMock()) {
    return getMockTaskStatus(taskId);
  }

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

  // ModelArk の実レスポンス形式に基づく変換
  // API status: "running" → 生成中, "succeeded" → 完了, "failed" → 失敗
  // content.video_url に動画 URL が格納される（content はオブジェクト）
  const apiStatus = data.status || "pending";

  // アプリ内部の統一ステータスに変換
  const normalizedStatus =
    apiStatus === "succeeded" ? "completed"
    : apiStatus === "running" ? "processing"
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
