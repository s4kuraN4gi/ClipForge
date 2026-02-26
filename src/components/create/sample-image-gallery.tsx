"use client";

import { useCallback } from "react";
import Image from "next/image";
import { SAMPLE_IMAGE_POOL, MAX_IMAGES } from "@/lib/constants";

interface SampleImageGalleryProps {
  selectedImages: string[];
  onSelectionChange: (images: string[]) => void;
}

export function SampleImageGallery({
  selectedImages,
  onSelectionChange,
}: SampleImageGalleryProps) {
  const toggleImage = useCallback(
    (src: string) => {
      if (selectedImages.includes(src)) {
        onSelectionChange(selectedImages.filter((s) => s !== src));
      } else if (selectedImages.length < MAX_IMAGES) {
        onSelectionChange([...selectedImages, src]);
      }
    },
    [selectedImages, onSelectionChange]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary-light/30 p-4 text-center">
        <p className="text-sm font-medium text-primary">
          サンプル画像から選択してください
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          1〜{MAX_IMAGES}枚を選択（タップで選択/解除）
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SAMPLE_IMAGE_POOL.map((image) => {
          const isSelected = selectedImages.includes(image.src);
          const selectionIndex = selectedImages.indexOf(image.src);

          return (
            <button
              key={image.src}
              type="button"
              onClick={() => toggleImage(image.src)}
              className={`group relative rounded-xl transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-primary ring-offset-2"
                  : selectedImages.length >= MAX_IMAGES
                    ? "opacity-40"
                    : "hover:ring-2 hover:ring-primary/30 hover:ring-offset-1"
              }`}
              aria-pressed={isSelected}
              aria-label={`${image.label}${isSelected ? "（選択中）" : ""}`}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image
                  src={image.src}
                  alt={image.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              {isSelected && (
                <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm">
                  {selectionIndex + 1}
                </div>
              )}
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {image.label}
              </p>
            </button>
          );
        })}
      </div>
      {selectedImages.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {selectedImages.length}枚選択中
        </p>
      )}
    </div>
  );
}
