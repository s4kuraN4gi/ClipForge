import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export function Label({
  children,
  required,
  optional,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium ${className}`}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
      {optional && (
        <span className="ml-1 text-muted-foreground">（任意）</span>
      )}
    </label>
  );
}
