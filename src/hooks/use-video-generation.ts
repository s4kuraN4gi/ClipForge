"use client";

import { useState, useCallback, useRef } from "react";
import { POLL_INTERVAL_MS, MAX_POLL_ATTEMPTS } from "@/lib/constants";

type Status = "idle" | "uploading" | "generating" | "completed" | "failed";

interface GenerationState {
  status: Status;
  taskId: string | null;
  projectId: string | null;
  progress: number;
  videoUrl: string | null;
  error: string | null;
  upgradeRequired: boolean;
}

interface GenerateParams {
  imageUrls: string[];
  storagePaths?: string[];
  template: string;
  productName?: string;
  productPrice?: string;
  catchphrase?: string;
}

export function useVideoGeneration() {
  const [state, setState] = useState<GenerationState>({
    status: "idle",
    taskId: null,
    projectId: null,
    progress: 0,
    videoUrl: null,
    error: null,
    upgradeRequired: false,
  });

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const pollStatus = useCallback(
    (taskId: string) => {
      stopPolling();

      pollingRef.current = setInterval(async () => {
        attemptsRef.current++;

        if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
          stopPolling();
          setState((prev) => ({
            ...prev,
            status: "failed",
            error: "生成がタイムアウトしました。再度お試しください。",
          }));
          return;
        }

        try {
          const response = await fetch(`/api/generate/${taskId}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "ステータス確認に失敗しました");
          }

          setState((prev) => ({
            ...prev,
            progress: data.progress ?? prev.progress,
          }));

          if (data.status === "completed" && data.videoUrl) {
            stopPolling();
            setState((prev) => ({
              ...prev,
              status: "completed",
              progress: 100,
              videoUrl: data.videoUrl,
            }));
          } else if (data.status === "failed") {
            stopPolling();
            setState((prev) => ({
              ...prev,
              status: "failed",
              error: data.error || "動画生成に失敗しました",
            }));
          }
        } catch (error) {
          console.error("Polling error:", error);
          // ポーリングエラーは次の試行で再試行するため、即座に停止しない
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  const generate = useCallback(
    async (params: GenerateParams) => {
      setState({
        status: "generating",
        taskId: null,
        projectId: null,
        progress: 0,
        videoUrl: null,
        error: null,
        upgradeRequired: false,
      });

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403 && data.upgradeRequired) {
            setState({
              status: "failed",
              taskId: null,
              projectId: null,
              progress: 0,
              videoUrl: null,
              error: data.error || "月間生成上限に達しました",
              upgradeRequired: true,
            });
            return;
          }
          throw new Error(data.error || "動画生成の開始に失敗しました");
        }

        setState((prev) => ({
          ...prev,
          taskId: data.taskId,
          projectId: data.projectId || null,
          progress: 5,
        }));

        // ポーリング開始
        pollStatus(data.taskId);
      } catch (error) {
        setState({
          status: "failed",
          taskId: null,
          projectId: null,
          progress: 0,
          videoUrl: null,
          error:
            error instanceof Error
              ? error.message
              : "エラーが発生しました",
          upgradeRequired: false,
        });
      }
    },
    [pollStatus]
  );

  // DB からプロジェクト状態を復元
  const restoreFromProject = useCallback(
    async (projectId: string) => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();

        if (!response.ok || !data.project) {
          return false;
        }

        const project = data.project;
        const video = project.generated_videos?.[0];

        if (project.status === "completed" && video?.video_url) {
          setState({
            status: "completed",
            taskId: video.task_id,
            projectId: project.id,
            progress: 100,
            videoUrl: video.video_url,
            error: null,
            upgradeRequired: false,
          });
          return true;
        }

        if (project.status === "generating" && video?.task_id) {
          setState({
            status: "generating",
            taskId: video.task_id,
            projectId: project.id,
            progress: 0,
            videoUrl: null,
            error: null,
            upgradeRequired: false,
          });
          // ポーリング再開
          pollStatus(video.task_id);
          return true;
        }

        if (project.status === "failed") {
          setState({
            status: "failed",
            taskId: video?.task_id || null,
            projectId: project.id,
            progress: 0,
            videoUrl: null,
            error: video?.error_message || "動画生成に失敗しました",
            upgradeRequired: false,
          });
          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    [pollStatus]
  );

  const reset = useCallback(() => {
    stopPolling();
    setState({
      status: "idle",
      taskId: null,
      projectId: null,
      progress: 0,
      videoUrl: null,
      error: null,
      upgradeRequired: false,
    });
  }, [stopPolling]);

  return {
    ...state,
    generate,
    restoreFromProject,
    reset,
  };
}
