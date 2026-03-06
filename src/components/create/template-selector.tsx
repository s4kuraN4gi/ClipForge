"use client";

import { useState } from "react";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/constants";
import type { TemplateType, TemplateCategory } from "@/types";

interface TemplateSelectorProps {
  selected: TemplateType | null;
  onSelect: (template: TemplateType) => void;
}

export function TemplateSelector({
  selected,
  onSelect,
}: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("basic");

  const filtered = TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* カテゴリタブ */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="テンプレートカテゴリ"
      >
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            aria-controls={`panel-${cat.id}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* テンプレートグリッド */}
      <div
        id={`panel-${activeCategory}`}
        role="tabpanel"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {filtered.map((template) => {
          const isSelected = selected === template.id;
          return (
            <button
              key={template.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={template.name}
              onClick={() => onSelect(template.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary-light scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:-translate-y-0.5"
              }`}
              style={{
                boxShadow: isSelected ? "var(--shadow-glow)" : "var(--shadow-sm)",
              }}
            >
              <span className="text-3xl">{template.icon}</span>
              <span className="text-sm font-medium">{template.name}</span>
              <span className="text-xs leading-tight text-muted-foreground">
                {template.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
