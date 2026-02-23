import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from "@/lib/constants";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const ip = getClientIp(request);
    const rl = rateLimit(`upload:${ip}`, RATE_LIMITS.upload);
    if (!rl.success) {
      return NextResponse.json(
        { error: "アップロードが多すぎます。しばらく待ってからお試しください。" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    if (files.length > 1) {
      return NextResponse.json(
        { error: "画像は1枚のみアップロードできます" },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    const uploadedUrls: string[] = [];
    const storagePaths: string[] = [];

    for (const file of files) {
      // ファイルタイプ検証（Content-Type）
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `対応していないファイル形式です: ${file.name}` },
          { status: 400 }
        );
      }

      // ファイル拡張子検証
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `対応していないファイル拡張子です: ${file.name}` },
          { status: 400 }
        );
      }

      // ファイルサイズ検証
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        return NextResponse.json(
          { error: `ファイルサイズが大きすぎます: ${file.name} (最大${MAX_IMAGE_SIZE_MB}MB)` },
          { status: 400 }
        );
      }
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await serviceClient.storage
        .from("product-images")
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: `アップロードに失敗しました: ${file.name}` },
          { status: 500 }
        );
      }

      // 署名付きURL生成（24時間有効 — 生成処理の待機時間を考慮）
      const { data: signedUrlData, error: signedUrlError } =
        await serviceClient.storage
          .from("product-images")
          .createSignedUrl(storagePath, 86400);

      if (signedUrlError || !signedUrlData) {
        console.error("Signed URL error:", signedUrlError);
        return NextResponse.json(
          { error: "URLの生成に失敗しました" },
          { status: 500 }
        );
      }

      uploadedUrls.push(signedUrlData.signedUrl);
      storagePaths.push(storagePath);
    }

    return NextResponse.json({
      urls: uploadedUrls,
      storagePaths,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "アップロードに失敗しました",
      },
      { status: 500 }
    );
  }
}
