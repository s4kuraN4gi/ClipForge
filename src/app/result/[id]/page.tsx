"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { VideoPreview } from "@/components/result/video-preview";
import { DownloadButton } from "@/components/result/download-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVideoGeneration } from "@/hooks/use-video-generation";
import Link from "next/link";

export default function ResultPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { status, progress, videoUrl, error, restoreFromProject } =
    useVideoGeneration();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    if (projectId && status === "idle") {
      restoreFromProject(projectId);
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
            <Link href="/dashboard" className="block">
              <Button variant="secondary" className="w-full">
                ダッシュボードに戻る
              </Button>
            </Link>
            <Link href="/create" className="block">
              <Button variant="outline" className="w-full">
                新しい動画を作成
              </Button>
            </Link>
          </div>
        )}

        {status === "failed" && (
          <div className="animate-fade-in space-y-4 py-8 text-center">
            <div className="text-4xl">😞</div>
            <h2 className="text-lg font-medium">生成に失敗しました</h2>
            <p className="text-sm text-destructive" role="alert">{error}</p>
            <Link href="/create">
              <Button className="w-full">もう一度試す</Button>
            </Link>
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-6 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center">
              <Spinner size="lg" className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              プロジェクト情報を読み込み中...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
