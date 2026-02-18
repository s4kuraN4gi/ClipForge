"use client";

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{clampedProgress}%</span>
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "進捗"}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{
            width: `${clampedProgress}%`,
            backgroundImage:
              clampedProgress < 100
                ? "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%)"
                : undefined,
            backgroundSize: clampedProgress < 100 ? "1rem 1rem" : undefined,
            animation:
              clampedProgress < 100
                ? "progress-stripe 0.5s linear infinite"
                : undefined,
          }}
        />
      </div>
    </div>
  );
}
