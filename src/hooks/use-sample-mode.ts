"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlanType } from "@/types";
import type { User } from "@supabase/supabase-js";

interface SampleModeState {
  isSampleMode: boolean;
  isLoading: boolean;
  user: User | null;
  plan: PlanType | null;
}

export function useSampleMode(): SampleModeState {
  const [state, setState] = useState<SampleModeState>({
    isSampleMode: true,
    isLoading: true,
    user: null,
    plan: null,
  });

  useEffect(() => {
    async function checkMode() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 未ログイン → サンプルモード
      if (!user) {
        setState({ isSampleMode: true, isLoading: false, user: null, plan: null });
        return;
      }

      // ログイン済み → 全プランで実生成（無料プランは累計3本、有料は月次制限）
      try {
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const data = await res.json();
          const plan: PlanType = data.subscription?.plan ?? "free";
          setState({
            isSampleMode: false,
            isLoading: false,
            user,
            plan,
          });
        } else {
          setState({ isSampleMode: false, isLoading: false, user, plan: "free" });
        }
      } catch {
        setState({ isSampleMode: false, isLoading: false, user, plan: "free" });
      }
    }
    checkMode();
  }, []);

  return state;
}
