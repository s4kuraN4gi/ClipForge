"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
      aria-hidden="true"
    />
  );
}
