import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getTaskStatus } from "@/lib/seedance/client";
import { decrementVideoCount } from "@/lib/subscription";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: "タスクIDが必要です" },
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

    // 所有権チェック: このユーザーが作成した動画タスクか確認（IDOR 対策）
    const { data: ownerCheck } = await supabase
      .from("generated_videos")
      .select("id, project_id, projects!inner(user_id)")
      .eq("task_id", taskId)
      .single();

    if (!ownerCheck) {
      return NextResponse.json(
        { error: "該当するタスクが見つかりません" },
        { status: 404 }
      );
    }

    const projectOwner = (ownerCheck.projects as unknown as { user_id: string }).user_id;
    if (projectOwner !== user.id) {
      return NextResponse.json(
        { error: "このタスクへのアクセス権がありません" },
        { status: 403 }
      );
    }

    const status = await getTaskStatus(taskId);

    // DB の generated_videos を更新
    {
      const updateData: Record<string, unknown> = {
        status: status.status === "completed" ? "completed"
          : status.status === "failed" ? "failed"
          : "processing",
      };

      if (status.status === "completed" && status.data?.video_url) {
        updateData.video_url = status.data.video_url;
        updateData.completed_at = new Date().toISOString();

        // 動画を Storage に保存（SSRF対策: 許可ドメインのみfetch）
        try {
          const videoUrl = status.data.video_url;
          const allowedHosts = ["volces.com", "bytepluses.com", "byteplus.com"];
          let isAllowed = false;
          try {
            const parsed = new URL(videoUrl);
            isAllowed =
              parsed.protocol === "https:" &&
              allowedHosts.some((h) => parsed.hostname.endsWith(h));
          } catch {
            isAllowed = false;
          }

          if (!isAllowed) {
            console.error("Blocked suspicious video_url:", videoUrl);
            return NextResponse.json({
              taskId: status.id,
              status: status.status,
              progress: status.progress,
              videoUrl: null,
              error: "動画URLの検証に失敗しました",
            });
          }

          const videoResponse = await fetch(videoUrl);
          if (videoResponse.ok) {
            const videoBuffer = await videoResponse.arrayBuffer();

            // generated_videos レコードからproject_idを取得
            const { data: videoRecord } = await supabase
              .from("generated_videos")
              .select("project_id")
              .eq("task_id", taskId)
              .single();

            if (videoRecord) {
              const serviceClient = createServiceClient();
              const storagePath = `${user.id}/${videoRecord.project_id}/${taskId}.mp4`;

              const { error: uploadError } = await serviceClient.storage
                .from("generated-videos")
                .upload(storagePath, videoBuffer, {
                  contentType: "video/mp4",
                  upsert: true,
                });

              if (!uploadError) {
                updateData.storage_path = storagePath;
              } else {
                console.error("Video storage upload error:", uploadError);
              }
            }
          }
        } catch (storageError) {
          console.error("Video storage save error:", storageError);
        }

        // プロジェクトのステータスも更新
        const { data: videoRecord } = await supabase
          .from("generated_videos")
          .select("project_id")
          .eq("task_id", taskId)
          .single();

        if (videoRecord) {
          await supabase
            .from("projects")
            .update({ status: "completed" })
            .eq("id", videoRecord.project_id);
        }
      }

      if (status.status === "failed") {
        updateData.error_message = status.error || "動画生成に失敗しました";

        const { data: videoRecord } = await supabase
          .from("generated_videos")
          .select("project_id, count_adjusted")
          .eq("task_id", taskId)
          .single();

        if (videoRecord) {
          await supabase
            .from("projects")
            .update({ status: "failed" })
            .eq("id", videoRecord.project_id);

          // 失敗時は生成カウントを戻す（1回のみ）
          if (!videoRecord.count_adjusted) {
            await decrementVideoCount(user.id);
            updateData.count_adjusted = true;
          }
        }
      }

      await supabase
        .from("generated_videos")
        .update(updateData)
        .eq("task_id", taskId);
    }

    return NextResponse.json({
      taskId: status.id,
      status: status.status,
      progress: status.progress,
      videoUrl: status.data?.video_url ?? null,
      error: status.error ?? null,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "ステータス確認に失敗しました" },
      { status: 500 }
    );
  }
}
