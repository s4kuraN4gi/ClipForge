import { NextRequest, NextResponse } from "next/server";

// 開発環境のみ使用可能なテストエンドポイント
// タスク作成: GET /api/test-seedance
// ステータス確認: GET /api/test-seedance?taskId=cgt-xxx
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const apiKey = process.env.BYTEPLUS_API_KEY;
  const modelId = process.env.SEEDANCE_MODEL_ID || "seedance-1-5-pro-251215";
  const taskId = request.nextUrl.searchParams.get("taskId");

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "BYTEPLUS_API_KEY is not set",
    });
  }

  const baseUrl = "https://ark.ap-southeast.bytepluses.com/api/v3";

  // taskId がある場合はステータス確認
  if (taskId) {
    try {
      const response = await fetch(
        `${baseUrl}/contents/generations/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      const data = await response.json();

      return NextResponse.json({
        action: "status",
        taskId,
        httpStatus: response.status,
        status: data.status,
        videoUrl: data.content?.video_url ?? null,
        resolution: data.resolution,
        duration: data.duration,
        ratio: data.ratio,
        usage: data.usage,
      });
    } catch (error) {
      return NextResponse.json({
        action: "status",
        taskId,
        error: String(error),
      });
    }
  }

  // taskId がない場合は新規タスク作成
  const requestBody = {
    model: modelId,
    content: [
      {
        type: "text",
        text: "Smooth product showcase with gentle camera movement, professional lighting",
      },
    ],
    duration: 5,
    resolution: "720p",
    aspect_ratio: "9:16",
  };

  try {
    const response = await fetch(`${baseUrl}/contents/generations/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const responseText = await response.text();

    return NextResponse.json({
      action: "create",
      modelId,
      httpStatus: response.status,
      body: responseText.slice(0, 1000),
      hint: "タスクのステータス確認: /api/test-seedance?taskId=<id>",
    });
  } catch (error) {
    return NextResponse.json({
      action: "create",
      modelId,
      error: String(error),
    });
  }
}
