"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  SAMPLE_VIDEOS,
  SAMPLE_GENERATION_DURATION_MS,
  SAMPLE_PROGRESS_INTERVAL_MS,
} from "@/lib/constants";
import type { TemplateType } from "@/types";

type Status = "idle" | "generating" | "completed";

interface SampleGenerationState {
  status: Status;
  progress: number;
  videoUrl: string | null;
}

export function useSampleGeneration() {
  const [state, setState] = useState<SampleGenerationState>({
    status: "idle",
    progress: 0,
    videoUrl: null,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const generate = useCallback(
    (template: TemplateType) => {
      stopTimer();
      setState({ status: "generating", progress: 0, videoUrl: null });

      const totalSteps = Math.floor(
        SAMPLE_GENERATION_DURATION_MS / SAMPLE_PROGRESS_INTERVAL_MS
      );
      const incrementPerStep = 100 / totalSteps;
      let currentProgress = 0;

      timerRef.current = setInterval(() => {
        currentProgress += incrementPerStep;
        if (currentProgress >= 100) {
          stopTimer();
          setState({
            status: "completed",
            progress: 100,
            videoUrl: SAMPLE_VIDEOS[template],
          });
        } else {
          setState((prev) => ({
            ...prev,
            progress: Math.round(currentProgress),
          }));
        }
      }, SAMPLE_PROGRESS_INTERVAL_MS);
    },
    [stopTimer]
  );

  // アンマウント時にタイマーを確実に停止
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    setState({ status: "idle", progress: 0, videoUrl: null });
  }, [stopTimer]);

  return {
    ...state,
    generate,
    reset,
  };
}
