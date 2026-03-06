"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { buttonStyles } from "@/components/ui/button";
import type { Project, GeneratedVideo, ProjectImage } from "@/types";

interface ProjectWithRelations extends Project {
  project_images: ProjectImage[];
  generated_videos: GeneratedVideo[];
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "下書き", className: "bg-muted text-muted-foreground" },
  generating: {
    label: "生成中",
    className: "bg-yellow-100 text-yellow-800",
  },
  completed: { label: "完了", className: "bg-green-100 text-green-800" },
  failed: { label: "失敗", className: "bg-red-100 text-red-800" },
};

import { TEMPLATES } from "@/lib/constants";

const TEMPLATE_LABELS: Record<string, string> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t.name])
);

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setError(null);
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "プロジェクトの取得に失敗しました");
      }

      setProjects(data.projects);
    } catch (err) {
      const message = err instanceof Error ? err.message : "エラーが発生しました";
      setError(message);
      addToast({ type: "error", title: "読み込みエラー", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <Link href="/create" className={buttonStyles()}>
            新しい動画を作成
          </Link>
        </div>

        <SubscriptionCard />

        {loading && (
          <div className="space-y-4" role="status" aria-label="読み込み中">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card variant="elevated" className="p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={fetchProjects}
              className="mt-4"
            >
              再読み込み
            </Button>
          </Card>
        )}

        {!loading && !error && projects.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <div className="mb-4 text-4xl">🎬</div>
            <h2 className="mb-2 text-lg font-medium">
              まだプロジェクトがありません
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              最初の動画を作成してみましょう
            </p>
            <Link href="/create" className={buttonStyles()}>
              動画を作成する
            </Link>
          </Card>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="space-y-3" role="list" aria-label="プロジェクト一覧">
            {projects.map((project) => {
              const video = project.generated_videos[0];
              const statusInfo = STATUS_LABELS[project.status] || STATUS_LABELS.draft;

              return (
                <Link
                  key={project.id}
                  href={`/result/${project.id}`}
                  role="listitem"
                  aria-label={`${project.product_name || "無題のプロジェクト"} を開く`}
                >
                  <Card variant="interactive" className="p-4">
                    <div className="flex items-start gap-4">
                      {/* サムネイル */}
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                        {video?.status === "completed" ? "🎥" : "📷"}
                      </div>

                      {/* 情報 */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-medium">
                            {project.product_name || "無題のプロジェクト"}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            {TEMPLATE_LABELS[project.template] || project.template}
                          </span>
                          <span>
                            {project.project_images.length}枚
                          </span>
                          <span>
                            {new Date(project.created_at).toLocaleDateString(
                              "ja-JP"
                            )}
                          </span>
                        </div>
                        {project.catchphrase && (
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {project.catchphrase}
                          </p>
                        )}
                      </div>

                      {/* 動画プレビュー */}
                      {video?.video_url && video.status === "completed" && (
                        <div className="hidden shrink-0 sm:block">
                          <div className="h-16 w-9 overflow-hidden rounded bg-black">
                            <video
                              src={video.video_url}
                              muted
                              playsInline
                              className="h-full w-full object-cover"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
