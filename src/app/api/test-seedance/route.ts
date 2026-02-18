import { NextResponse } from "next/server";
import { createVideoGeneration, getTaskStatus } from "@/lib/seedance/client";

// 開発環境のみ使用可能なテストエンドポイント
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const useMock = process.env.SEEDANCE_USE_MOCK === "true";

  try {
    // Step 1: タスク作成テスト
    const startTime = Date.now();
    const createResult = await createVideoGeneration({
      imageUrl: "https://via.placeholder.com/1080x1920.png?text=Test+Product",
      prompt: "Smooth product showcase with gentle camera movement",
      duration: 4,
      resolution: "1080p",
      aspectRatio: "9:16",
    });
    const createTime = Date.now() - startTime;

    // Step 2: ステータス確認テスト
    const statusStartTime = Date.now();
    const statusResult = await getTaskStatus(createResult.id);
    const statusTime = Date.now() - statusStartTime;

    return NextResponse.json({
      success: true,
      mode: useMock ? "mock" : "live",
      tests: {
        createTask: {
          ok: true,
          taskId: createResult.id,
          status: createResult.status,
          responseTimeMs: createTime,
        },
        checkStatus: {
          ok: true,
          status: statusResult.status,
          progress: statusResult.progress,
          responseTimeMs: statusTime,
        },
      },
      config: { useMock },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      mode: useMock ? "mock" : "live",
      error: error instanceof Error ? error.message : "Unknown error",
      config: { useMock },
    });
  }
}
