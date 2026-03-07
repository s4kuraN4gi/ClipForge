"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  requiresConfirmation: boolean;
  extraCharge: number | null;
  extraCount: number;
}

interface GenerateParams {
  imageUrls: string[];
  storagePaths?: string[];
  template: string;
  duration?: number;
  productName?: string;
  productPrice?: string;
  catchphrase?: string;
  confirmExtra?: boolean;
}

const INITIAL_STATE: GenerationState = {
  status: "idle",
  taskId: null,
  projectId: null,
  progress: 0,
  videoUrl: null,
  error: null,
  upgradeRequired: false,
  requiresConfirmation: false,
  extraCharge: null,
  extraCount: 0,
};

export function useVideoGeneration() {
  const [state, setState] = useState<GenerationState>(INITIAL_STATE);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const pendingParamsRef = useRef<GenerateParams | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const startProgressSimulation = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const simulated = Math.min(90, Math.floor(90 * (1 - Math.exp(-elapsed / 40))));
      setState((prev) => {
        if (prev.status !== "generating" || prev.progress >= 100) return prev;
        return { ...prev, progress: Math.max(prev.progress, simulated) };
      });
    }, 1000);
  }, []);

  const pollStatus = useCallback(
    (taskId: string) => {
      stopPolling();
      startProgressSimulation();

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
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling, startProgressSimulation]
  );

  const generate = useCallback(
    async (params: GenerateParams) => {
      setState({
        ...INITIAL_STATE,
        status: "generating",
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
              ...INITIAL_STATE,
              status: "failed",
              error: data.error || "月間生成上限に達しました",
              upgradeRequired: true,
            });
            return;
          }

          // 402: 追加料金の確認が必要
          if (response.status === 402 && data.requiresConfirmation) {
            pendingParamsRef.current = params;
            setState({
              ...INITIAL_STATE,
              requiresConfirmation: true,
              extraCharge: data.extraCharge,
              extraCount: data.extraCount ?? 0,
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

        pollStatus(data.taskId);
      } catch (error) {
        setState({
          ...INITIAL_STATE,
          status: "failed",
          error:
            error instanceof Error
              ? error.message
              : "エラーが発生しました",
        });
      }
    },
    [pollStatus]
  );

  /** 追加料金確認後にリトライ */
  const confirmAndGenerate = useCallback(async () => {
    const params = pendingParamsRef.current;
    if (!params) return;
    pendingParamsRef.current = null;
    await generate({ ...params, confirmExtra: true });
  }, [generate]);

  /** 確認をキャンセル */
  const cancelConfirmation = useCallback(() => {
    pendingParamsRef.current = null;
    setState(INITIAL_STATE);
  }, []);

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
            ...INITIAL_STATE,
            status: "completed",
            taskId: video.task_id,
            projectId: project.id,
            progress: 100,
            videoUrl: video.video_url,
          });
          return true;
        }

        if (project.status === "generating" && video?.task_id) {
          setState({
            ...INITIAL_STATE,
            status: "generating",
            taskId: video.task_id,
            projectId: project.id,
          });
          pollStatus(video.task_id);
          return true;
        }

        if (project.status === "failed") {
          setState({
            ...INITIAL_STATE,
            status: "failed",
            taskId: video?.task_id || null,
            projectId: project.id,
            error: video?.error_message || "動画生成に失敗しました",
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

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    pendingParamsRef.current = null;
    setState(INITIAL_STATE);
  }, [stopPolling]);

  return {
    ...state,
    generate,
    confirmAndGenerate,
    cancelConfirmation,
    restoreFromProject,
    reset,
  };
}
