"use client";

interface VideoPreviewProps {
  videoUrl: string;
}

export function VideoPreview({ videoUrl }: VideoPreviewProps) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div
        className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <video
          src={videoUrl}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-contain"
          aria-label="生成された動画プレビュー"
        />
      </div>
    </div>
  );
}
