import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createVideoGeneration, getProviderTypeForPlan } from "@/lib/video-provider";
import type { ProviderType } from "@/lib/video-provider";
import { TEMPLATES, PRO_SAFETY_CAP, PRO_EXTRA_PRICE } from "@/lib/constants";
import { buildVideoPrompt } from "@/lib/prompt-builder";
import {
  checkVideoLimit,
  tryIncrementVideoCount,
  tryIncrementVideoCountPro,
  reportMeteredUsage,
  incrementExtraVideoCount,
  incrementMeteredPending,
} from "@/lib/subscription";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type { TemplateType } from "@/types";

interface GenerateRequestBody {
  imageUrls: string[];
  storagePaths?: string[];
  template: TemplateType;
  duration?: number;
  productName?: string;
  productPrice?: string;
  catchphrase?: string;
  customPrompt?: string;
  confirmExtra?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const ip = getClientIp(request);
    const rl = await rateLimit(`generate:${ip}`, RATE_LIMITS.generate);
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

    // S-2: imageUrl が Supabase Storage の署名付きURLであることを検証
    try {
      const parsedUrl = new URL(body.imageUrls[0]);
      const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
      if (parsedUrl.hostname !== supabaseHost) {
        return NextResponse.json(
          { error: "無効な画像URLです" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "無効な画像URLです" },
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

    // duration バリデーション（5秒 or 10秒、デフォルト5）
    const ALLOWED_DURATIONS = [5, 10];
    const requestedDuration = ALLOWED_DURATIONS.includes(body.duration ?? 5)
      ? (body.duration ?? 5)
      : 5;

    // 入力バリデーション
    if (body.productName && body.productName.length > 100) {
      return NextResponse.json(
        { error: "商品名は100文字以内で入力してください" },
        { status: 400 }
      );
    }
    if (body.productPrice && body.productPrice.length > 20) {
      return NextResponse.json(
        { error: "価格は20文字以内で入力してください" },
        { status: 400 }
      );
    }
    if (body.catchphrase && body.catchphrase.length > 200) {
      return NextResponse.json(
        { error: "キャッチフレーズは200文字以内で入力してください" },
        { status: 400 }
      );
    }
    if (body.customPrompt && body.customPrompt.length > 200) {
      return NextResponse.json(
        { error: "カスタムプロンプトは200文字以内で入力してください" },
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

    // 無料プランで上限到達
    if (!limitResult.allowed && limitResult.plan === "free") {
      return NextResponse.json(
        {
          error: "無料プランの生成上限（1本）に達しました",
          upgradeRequired: true,
          current: limitResult.current,
          limit: limitResult.includedLimit,
          plan: limitResult.plan,
        },
        { status: 403 }
      );
    }

    // Pro プランで safety cap 到達
    if (!limitResult.allowed && limitResult.plan === "pro") {
      return NextResponse.json(
        {
          error: `今月の安全上限（${PRO_SAFETY_CAP}本）に達しました。来月までお待ちください。`,
          current: limitResult.current,
          plan: limitResult.plan,
        },
        { status: 403 }
      );
    }

    // Pro で追加料金が発生する場合 → 確認要求
    if (limitResult.isMetered && !body.confirmExtra) {
      return NextResponse.json(
        {
          requiresConfirmation: true,
          extraCharge: PRO_EXTRA_PRICE,
          current: limitResult.current,
          includedLimit: limitResult.includedLimit,
          extraCount: limitResult.extraCount,
          plan: limitResult.plan,
        },
        { status: 402 }
      );
    }

    // DB にプロジェクトを保存
    let projectId: string | null = null;

    {
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

        if (body.storagePaths && body.storagePaths.length > 0) {
          // storagePaths が自ユーザーのパスであることを検証
          const validPaths = body.storagePaths.filter(
            (path) => path.startsWith(`${user.id}/`) && !path.includes("..")
          );
          const imageRecords = validPaths.map((path, index) => ({
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

    // プロンプト生成（モーション・カメラ指示のみ。商品名はFFmpegオーバーレイで表示）
    const prompt = buildVideoPrompt({
      templatePrompt: template.prompt,
      customPrompt: body.customPrompt,
    });

    // 無料プランは透かし付き
    const useWatermark = limitResult.plan === "free";

    // プラン別プロバイダー選択
    const providerType: ProviderType = getProviderTypeForPlan(
      limitResult.plan as "free" | "pro"
    );

    // 動画生成タスクを作成
    const result = await createVideoGeneration(
      {
        imageUrl: body.imageUrls[0],
        prompt,
        duration: requestedDuration,
        resolution: "1080p",
        aspectRatio: "9:16",
        watermark: useWatermark,
      },
      providerType,
    );

    // カウントをアトミックにインクリメント
    if (limitResult.plan === "free") {
      const ok = await tryIncrementVideoCount(user.id, 1);
      if (!ok) {
        return NextResponse.json(
          { error: "無料プランの生成上限に達しました", upgradeRequired: true },
          { status: 403 }
        );
      }
    } else {
      const ok = await tryIncrementVideoCountPro(user.id, PRO_SAFETY_CAP);
      if (!ok) {
        return NextResponse.json(
          { error: `今月の安全上限（${PRO_SAFETY_CAP}本）に達しました。` },
          { status: 403 }
        );
      }
    }

    // メーター課金の場合: Stripe に usage 報告 + extra_video_count インクリメント
    if (limitResult.isMetered && limitResult.stripeCustomerId) {
      await incrementExtraVideoCount(user.id);
      try {
        await reportMeteredUsage(limitResult.stripeCustomerId, 1);
      } catch (err) {
        console.error("Metered usage report error:", err);
        // Stripe 報告失敗 → DB に未報告フラグを立てる（後でリトライ可能）
        await incrementMeteredPending(user.id);
      }
    }

    // DB に生成動画レコードを作成
    if (projectId) {
      const { error: videoError } = await supabase
        .from("generated_videos")
        .insert({
          project_id: projectId,
          task_id: result.id,
          status: "pending",
          provider_type: providerType,
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
      { error: "動画生成に失敗しました" },
      { status: 500 }
    );
  }
}
