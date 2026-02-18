import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "interactive";
}

const variantStyles = {
  default: "border border-border rounded-2xl bg-background",
  elevated: "border border-border rounded-2xl bg-background",
  interactive:
    "border border-border rounded-2xl bg-background transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5",
};

export function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      style={{
        boxShadow:
          variant === "elevated"
            ? "var(--shadow-md)"
            : variant === "interactive"
              ? "var(--shadow-sm)"
              : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
