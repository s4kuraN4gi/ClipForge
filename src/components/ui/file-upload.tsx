"use client";

import { useCallback, useRef, useState } from "react";
import {
  MAX_IMAGES,
  MAX_IMAGE_SIZE_MB,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  maxFiles?: number;
}

export function FileUpload({
  onFilesSelected,
  selectedFiles,
  maxFiles = MAX_IMAGES,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      setError(null);
      const valid: File[] = [];

      for (const file of files) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          setError("JPEG または PNG 画像のみアップロードできます");
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          setError(`ファイルサイズは${MAX_IMAGE_SIZE_MB}MB以下にしてください`);
          continue;
        }
        valid.push(file);
      }

      const totalCount = selectedFiles.length + valid.length;
      if (totalCount > maxFiles) {
        setError(`画像は${maxFiles}枚まで選択できます`);
        return valid.slice(0, maxFiles - selectedFiles.length);
      }

      return valid;
    },
    [selectedFiles, maxFiles]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesSelected([...selectedFiles, ...validFiles]);
      }
    },
    [validateFiles, onFilesSelected, selectedFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    []
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = selectedFiles.filter((_, i) => i !== index);
      onFilesSelected(next);
      setError(null);
    },
    [selectedFiles, onFilesSelected]
  );

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="商品写真をアップロード"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-200 ${
          isDragOver
            ? "border-primary bg-primary-light"
            : "border-border hover:border-primary/50 hover:bg-muted"
        }`}
        style={{
          boxShadow: isDragOver ? "var(--shadow-sm)" : undefined,
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
      >
        <div className="mb-3 text-4xl" aria-hidden="true">
          {selectedFiles.length > 0 ? "+" : "📷"}
        </div>
        <p className="text-sm font-medium">
          {selectedFiles.length > 0
            ? "さらに画像を追加"
            : "商品写真をドラッグ&ドロップ"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          またはクリックして選択（JPEG/PNG、最大{maxFiles}枚）
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="group relative">
              <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`商品画像 ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                aria-label={`画像${index + 1}を削除`}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {index + 1}枚目
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
