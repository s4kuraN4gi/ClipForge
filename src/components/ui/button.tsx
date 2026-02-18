import { ButtonHTMLAttributes } from "react";
import { Spinner } from "./spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary/50",
  secondary:
    "bg-secondary text-foreground hover:bg-secondary/90 focus-visible:ring-secondary/50",
  outline:
    "border border-border bg-transparent hover:bg-muted focus-visible:ring-primary/50",
  ghost:
    "bg-transparent hover:bg-muted focus-visible:ring-primary/50",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-7 py-3 text-base rounded-full",
};

const spinnerSizes = {
  sm: "sm" as const,
  md: "sm" as const,
  lg: "md" as const,
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variantStyles[variant]} ${sizeStyles[size]} ${loading ? "cursor-wait" : ""} ${className}`}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading && <Spinner size={spinnerSizes[size]} />}
      {children}
    </button>
  );
}
