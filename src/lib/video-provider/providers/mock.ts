import type {
  VideoGenerateResponse,
  VideoTaskStatus,
  VideoProvider,
  VideoGenerationParams,
} from "../types";

// モックタスクの進行状態を管理
const mockTasks = new Map<
  string,
  { createdAt: number; duration: number }
>();

// モック動画生成時間（ミリ秒）
const MOCK_GENERATION_TIME_MS = 15000;

// サンプル動画URL（Big Buck Bunny の短いクリップ - パブリックドメイン）
const SAMPLE_VIDEO_URL =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4";

export class MockProvider implements VideoProvider {
  readonly allowedVideoHosts = ["test-videos.co.uk"];

  async createGeneration(
    _params: VideoGenerationParams
  ): Promise<VideoGenerateResponse> {
    const taskId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    mockTasks.set(taskId, {
      createdAt: Date.now(),
      duration: MOCK_GENERATION_TIME_MS,
    });

    return {
      id: taskId,
      status: "queued",
      message: "Mock task created successfully",
    };
  }

  async getStatus(taskId: string): Promise<VideoTaskStatus> {
    const task = mockTasks.get(taskId);

    if (!task) {
      return {
        id: taskId,
        status: "completed",
        progress: 100,
        data: { video_url: SAMPLE_VIDEO_URL },
      };
    }

    const elapsed = Date.now() - task.createdAt;
    const progress = Math.min(
      Math.floor((elapsed / task.duration) * 100),
      100
    );

    if (progress >= 100) {
      mockTasks.delete(taskId);
      return {
        id: taskId,
        status: "completed",
        progress: 100,
        data: { video_url: SAMPLE_VIDEO_URL },
        meta: { usage: { total_tokens: 108900 } },
      };
    }

    if (progress < 10) {
      return { id: taskId, status: "queued", progress };
    }

    return { id: taskId, status: "processing", progress };
  }
}
