"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { PlanType } from "@/types";

interface CheckoutButtonProps {
  plan: PlanType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline";
}

export function CheckoutButton({
  plan,
  children,
  className,
  variant = "primary",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "チェックアウトの作成に失敗しました");
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
      variant={variant}
      size="lg"
      className={className}
      loading={loading}
      onClick={handleCheckout}
    >
      {children}
    </Button>
  );
}
