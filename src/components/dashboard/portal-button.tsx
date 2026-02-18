"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PortalButtonProps {
  className?: string;
}

export function PortalButton({ className }: PortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handlePortal = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ポータルの作成に失敗しました");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "エラーが発生しました";
      addToast({ type: "error", title: "エラー", description: message });
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      loading={loading}
      onClick={handlePortal}
    >
      プランを管理
    </Button>
  );
}
