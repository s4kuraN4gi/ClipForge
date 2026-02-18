"use client";

import { TEMPLATES } from "@/lib/constants";
import type { TemplateType } from "@/types";

interface TemplateSelectorProps {
  selected: TemplateType | null;
  onSelect: (template: TemplateType) => void;
}

export function TemplateSelector({
  selected,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      role="radiogroup"
      aria-label="テンプレート選択"
    >
      {TEMPLATES.map((template) => {
        const isSelected = selected === template.id;
        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={template.name}
            onClick={() => onSelect(template.id)}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-200 ${
              isSelected
                ? "border-primary bg-primary-light scale-[1.02]"
                : "border-border hover:border-primary/50 hover:-translate-y-0.5"
            }`}
            style={{
              boxShadow: isSelected ? "var(--shadow-glow)" : "var(--shadow-sm)",
            }}
          >
            <span className="text-4xl">{template.icon}</span>
            <span className="text-base font-medium">{template.name}</span>
            <span className="text-xs text-muted-foreground">
              {template.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
