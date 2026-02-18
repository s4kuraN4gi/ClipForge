"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-5xl">
        <span aria-hidden="true">&#9888;&#65039;</span>
      </div>
      <h1 className="mb-3 text-2xl font-bold">
        エラーが発生しました
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        予期しないエラーが発生しました。もう一度お試しください。
      </p>
      <Button onClick={reset} size="lg">
        もう一度試す
      </Button>
    </div>
  );
}
