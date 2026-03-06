export type GenerationStatus =
  | "queued"
  | "pending"
  | "running"
  | "processing"
  | "succeeded"
  | "completed"
  | "failed";

export interface VideoGenerateResponse {
  id: string;
  status: GenerationStatus;
  message?: string;
}

export interface VideoTaskStatus {
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

export interface VideoGenerationParams {
  imageUrl: string;
  prompt: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  watermark?: boolean;
}

export interface VideoProvider {
  createGeneration(
    params: VideoGenerationParams
  ): Promise<VideoGenerateResponse>;
  getStatus(taskId: string): Promise<VideoTaskStatus>;
  readonly allowedVideoHosts: string[];
}
