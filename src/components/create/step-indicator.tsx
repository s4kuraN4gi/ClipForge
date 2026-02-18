"use client";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2" role="list" aria-label="ステップ進捗">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div
            key={label}
            className="flex items-center gap-2"
            role="listitem"
            aria-current={isActive ? "step" : undefined}
            aria-label={`ステップ${stepNum}: ${label}${isCompleted ? "（完了）" : isActive ? "（現在）" : ""}`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-accent text-white"
                    : isActive
                      ? "bg-primary text-white scale-110"
                      : "bg-muted text-muted-foreground"
                }`}
                style={{
                  boxShadow: isActive ? "var(--shadow-glow)" : undefined,
                }}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  isActive ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="relative h-px w-10 bg-border sm:w-16">
                <div
                  className="absolute inset-y-0 left-0 bg-accent transition-all duration-500 ease-out"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
