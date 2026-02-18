import { InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export function Input({
  label,
  error,
  hint,
  optional,
  className = "",
  id: propId,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = propId || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error && errorId, hint && hintId]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
          {optional && (
            <span className="ml-1 text-muted-foreground">（任意）</span>
          )}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
            : "border-border focus:border-primary focus:ring-primary/20"
        } ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
