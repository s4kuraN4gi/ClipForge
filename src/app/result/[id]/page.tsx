"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { VideoPreview } from "@/components/result/video-preview";
import { DownloadButton } from "@/components/result/download-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { buttonStyles } from "@/components/ui/button";
import { useVideoGeneration } from "@/hooks/use-video-generation";
import Link from "next/link";

export default function ResultPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { status, progress, videoUrl, error, restoreFromProject } =
    useVideoGeneration();
  const restoredRef = useRef(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    if (projectId && status === "idle") {
      restoreFromProject(projectId).then((restored) => {
        if (!restored) {
          setNotFound(true);
        }
      });
    }
  }, [projectId, status, restoreFromProject]);

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold">生成結果</h1>

        {status === "generating" && (
          <div className="animate-fade-in space-y-6 py-8 text-center" aria-live="polite">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <Spinner size="lg" className="text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-medium">動画を生成中...</h2>
              <p className="text-sm text-muted-foreground">
                AIが商品動画を作成しています
              </p>
            </div>
            <ProgressBar progress={progress} label="生成進捗" />
          </div>
        )}

        {status === "completed" && videoUrl && (
          <div className="animate-fade-in space-y-6">
            <VideoPreview videoUrl={videoUrl} />
            <DownloadButton videoUrl={videoUrl} />
            <Link href="/dashboard" className={`${buttonStyles({ variant: "secondary" })} w-full`}>
              ダッシュボードに戻る
            </Link>
            <Link href="/create" className={`${buttonStyles({ variant: "outline" })} w-full`}>
              新しい動画を作成
            </Link>
          </div>
        )}

        {status === "failed" && (
          <div className="animate-fade-in space-y-4 py-8 text-center">
            <div className="text-4xl">😞</div>
            <h2 className="text-lg font-medium">生成に失敗しました</h2>
            <p className="text-sm text-destructive" role="alert">{error}</p>
            <Link href="/create" className={`${buttonStyles()} w-full`}>
              もう一度試す
            </Link>
          </div>
        )}

        {status === "idle" && !notFound && (
          <div className="space-y-6 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center">
              <Spinner size="lg" className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              プロジェクト情報を読み込み中...
            </p>
          </div>
        )}

        {notFound && (
          <div className="animate-fade-in space-y-4 py-8 text-center">
            <div className="text-4xl">📋</div>
            <h2 className="text-lg font-medium">
              プロジェクトが見つかりません
            </h2>
            <p className="text-sm text-muted-foreground">
              このプロジェクトはまだ生成されていないか、存在しません。
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/create" className={`${buttonStyles()} w-full`}>
                動画を作成する
              </Link>
              <Link href="/dashboard" className={`${buttonStyles({ variant: "outline" })} w-full`}>
                ダッシュボードへ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
