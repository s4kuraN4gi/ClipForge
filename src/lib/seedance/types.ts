// BytePlus ModelArk API の実際のステータス値
export type GenerationStatus =
  | "queued"
  | "pending"
  | "running"
  | "processing"
  | "succeeded"
  | "completed"
  | "failed";

export interface SeedanceGenerateRequest {
  model: string;
  image_url: string;
  prompt: string;
  duration: number;
  resolution: string;
  aspect_ratio: string;
  seed?: number;
  watermark?: boolean;
}

export interface SeedanceGenerateResponse {
  id: string;
  status: GenerationStatus;
  message?: string;
}

export interface SeedanceTaskStatus {
  id: string;
  status: GenerationStatus;
  progress: number;
  data?: {
    video_url: string;
  };
  error?: string;
  meta?: {
    usage?: {
      total_tokens: number;
    };
  };
}

export interface SeedanceError {
  error: {
    code: string;
    message: string;
  };
}
