import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createVideoGeneration } from "@/lib/seedance/client";
import { TEMPLATES } from "@/lib/constants";
import { checkVideoLimit, incrementVideoCount } from "@/lib/subscription";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type { TemplateType } from "@/types";

interface GenerateRequestBody {
  imageUrls: string[];
  storagePaths?: string[];
  template: TemplateType;
  productName?: string;
  productPrice?: string;
  catchphrase?: string;
}

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const ip = getClientIp(request);
    const rl = rateLimit(`generate:${ip}`, RATE_LIMITS.generate);
    if (!rl.success) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらく待ってからお試しください。" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body: GenerateRequestBody = await request.json();

    // バリデーション
    if (!body.imageUrls || body.imageUrls.length === 0) {
      return NextResponse.json(
        { error: "画像を1枚以上アップロードしてください" },
        { status: 400 }
      );
    }

    if (body.imageUrls.length > 1) {
      return NextResponse.json(
        { error: "画像は1枚のみアップロードできます" },
        { status: 400 }
      );
    }

    const template = TEMPLATES.find((t) => t.id === body.template);
    if (!template) {
      return NextResponse.json(
        { error: "無効なテンプレートです" },
        { status: 400 }
      );
    }

    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // プラン制限チェック
    const limitResult = await checkVideoLimit(user.id);
    if (!limitResult.allowed) {
      return NextResponse.json(
        {
          error: `月間生成上限（${limitResult.limit}本）に達しました`,
          upgradeRequired: true,
          current: limitResult.current,
          limit: limitResult.limit,
          plan: limitResult.plan,
        },
        { status: 403 }
      );
    }

    // DB にプロジェクトを保存
    let projectId: string | null = null;

    {
      // プロジェクト作成
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          template: body.template,
          status: "generating",
          product_name: body.productName || null,
          product_price: body.productPrice || null,
          catchphrase: body.catchphrase || null,
        })
        .select()
        .single();

      if (projectError) {
        console.error("Project create error:", projectError);
      } else if (project) {
        projectId = project.id;

        // 画像レコード保存
        if (body.storagePaths && body.storagePaths.length > 0) {
          const imageRecords = body.storagePaths.map((path, index) => ({
            project_id: project.id,
            storage_path: path,
            display_order: index,
          }));

          const { error: imagesError } = await supabase
            .from("project_images")
            .insert(imageRecords);

          if (imagesError) {
            console.error("Images insert error:", imagesError);
          }
        }
      }
    }

    // テンプレートに基づくプロンプト生成
    let prompt = template.prompt;
    if (body.productName) {
      prompt += `, featuring "${body.productName}"`;
    }

    // 無料プランは透かし付き
    const useWatermark = limitResult.plan === "free";

    // Seedance API で動画生成タスクを作成（最初の画像を使用）
    const result = await createVideoGeneration({
      imageUrl: body.imageUrls[0],
      prompt,
      duration: 8,
      resolution: "1080p",
      aspectRatio: "9:16",
      watermark: useWatermark,
    });

    // 生成カウントをインクリメント
    await incrementVideoCount(user.id);

    // DB に生成動画レコードを作成
    if (projectId) {
      const { error: videoError } = await supabase
        .from("generated_videos")
        .insert({
          project_id: projectId,
          task_id: result.id,
          status: "pending",
        });

      if (videoError) {
        console.error("Video record create error:", videoError);
      }
    }

    return NextResponse.json({
      taskId: result.id,
      projectId,
      status: result.status,
      message: "動画生成を開始しました",
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "動画生成に失敗しました",
      },
      { status: 500 }
    );
  }
}
