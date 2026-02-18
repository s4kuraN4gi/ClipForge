"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DownloadButtonProps {
  videoUrl: string;
  filename?: string;
}

export function DownloadButton({
  videoUrl,
  filename = "clipforge-video.mp4",
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const { addToast } = useToast();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({ type: "success", title: "ダウンロードを開始しました" });
    } catch {
      window.open(videoUrl, "_blank");
      addToast({ type: "info", title: "新しいタブで開きました" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      size="lg"
      className="w-full"
      loading={downloading}
      aria-label="動画をダウンロード"
    >
      動画をダウンロード
    </Button>
  );
}
