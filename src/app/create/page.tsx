"use client";

import { useState, useCallback } from "react";
import { StepIndicator } from "@/components/create/step-indicator";
import { FileUpload } from "@/components/ui/file-upload";
import { TemplateSelector } from "@/components/create/template-selector";
import { GenerationForm } from "@/components/create/generation-form";
import { SampleImageGallery } from "@/components/create/sample-image-gallery";
import { UpgradeCTA } from "@/components/create/upgrade-cta";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { Button, buttonStyles } from "@/components/ui/button";
import { useVideoGeneration } from "@/hooks/use-video-generation";
import { useSampleMode } from "@/hooks/use-sample-mode";
import { useSampleGeneration } from "@/hooks/use-sample-generation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { TEMPLATES, DURATION_OPTIONS, DEFAULT_DURATION } from "@/lib/constants";
import type { TemplateType } from "@/types";

const STEPS = ["写真選択", "テンプレート", "生成"];

const PROGRESS_MESSAGES = [
  { threshold: 0, message: "画像を処理中..." },
  { threshold: 20, message: "動画を構成中..." },
  { threshold: 50, message: "AIが動画を生成中..." },
  { threshold: 80, message: "仕上げ処理中..." },
];

function getProgressMessage(progress: number): string {
  for (let i = PROGRESS_MESSAGES.length - 1; i >= 0; i--) {
    if (progress >= PROGRESS_MESSAGES[i].threshold) {
      return PROGRESS_MESSAGES[i].message;
    }
  }
  return PROGRESS_MESSAGES[0].message;
}

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [sampleImages, setSampleImages] = useState<string[]>([]);
  const [template, setTemplate] = useState<TemplateType | null>(null);
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  const { isSampleMode, isLoading: modeLoading, user } = useSampleMode();
  const realGen = useVideoGeneration();
  const sampleGen = useSampleGeneration();
  const { addToast } = useToast();

  // アクティブな生成状態を選択
  const status = isSampleMode ? sampleGen.status : realGen.status;
  const progress = isSampleMode ? sampleGen.progress : realGen.progress;
  const videoUrl = isSampleMode ? sampleGen.videoUrl : realGen.videoUrl;
  const error = isSampleMode ? null : realGen.error;
  const upgradeRequired = isSampleMode ? false : realGen.upgradeRequired;

  const handleGenerate = useCallback(
    async (formData: {
      productName: string;
      productPrice: string;
      catchphrase: string;
    }) => {
      if (!template) return;

      if (isSampleMode) {
        sampleGen.generate(template);
        return;
      }

      if (files.length === 0) return;

      // Supabase Storage にアップロード
      const fd = new FormData();
      files.forEach((file) => fd.append("files", file));

      let imageUrls: string[];
      let storagePaths: string[];

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          addToast({
            type: "error",
            title: "アップロード失敗",
            description: uploadData.error || "画像のアップロードに失敗しました。再度お試しください。",
          });
          return;
        }

        imageUrls = uploadData.urls;
        storagePaths = uploadData.storagePaths;
      } catch {
        addToast({
          type: "error",
          title: "ネットワークエラー",
          description: "サーバーに接続できませんでした。通信環境を確認して再度お試しください。",
        });
        return;
      }

      await realGen.generate({
        imageUrls,
        storagePaths,
        template,
        duration,
        ...formData,
      });
    },
    [template, files, isSampleMode, realGen, sampleGen, addToast]
  );

  const isGenerating = status === "uploading" || status === "generating";
  const isCompleted = status === "completed";

  // サンプル画像の枚数（Step 3 サマリー用）
  const sampleImageCount = sampleImages.length;

  // ローディング中はスケルトン表示
  if (modeLoading) {
    return (
      <div className="px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 h-8 animate-pulse rounded-lg bg-muted" />
          <div className="mb-8 h-12 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-12 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-center text-2xl font-bold">動画を作成</h1>

        <div className="mb-8">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        {/* ステップ1: 写真選択 */}
        {currentStep === 1 && isSampleMode && (
          <div className="animate-fade-in space-y-6" key="step-1-sample">
            <div>
              <h2 className="mb-2 text-lg font-medium">
                サンプル写真を選択
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                動画に使うサンプル写真を選んでください
              </p>
              <SampleImageGallery
                selectedImages={sampleImages}
                onSelectionChange={setSampleImages}
              />
            </div>
            <UpgradeCTA variant="upload" user={user} />
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={sampleImages.length === 0}
              size="lg"
              className="w-full"
            >
              次へ：テンプレート選択
            </Button>
          </div>
        )}

        {currentStep === 1 && !isSampleMode && (
          <div className="animate-fade-in space-y-6" key="step-1">
            <div>
              <h2 className="mb-2 text-lg font-medium">
                商品写真をアップロード
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                商品写真を1枚選択してください。スマホで撮影した写真でOKです。
              </p>
              <FileUpload
                onFilesSelected={setFiles}
                selectedFiles={files}
              />
            </div>
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={files.length === 0}
              size="lg"
              className="w-full"
            >
              次へ：テンプレート選択
            </Button>
          </div>
        )}

        {/* ステップ2: テンプレート選択 */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-6" key="step-2">
            <div>
              <h2 className="mb-2 text-lg font-medium">
                テンプレートを選択
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                動画のスタイルを選んでください
              </p>
              <TemplateSelector
                selected={template}
                onSelect={setTemplate}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                size="lg"
                className="flex-1"
              >
                戻る
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!template}
                size="lg"
                className="flex-1"
              >
                次へ：動画生成
              </Button>
            </div>
          </div>
        )}

        {/* ステップ3: 生成 */}
        {currentStep === 3 && (
          <div className="animate-fade-in space-y-6" key="step-3">
            {!isGenerating && !isCompleted && status !== "failed" && (
              <>
                <div>
                  <h2 className="mb-2 text-lg font-medium">
                    {isSampleMode
                      ? "サンプル動画を生成"
                      : "商品情報を入力して生成"}
                  </h2>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {isSampleMode
                      ? "生成ボタンを押すと、サンプル動画が作成されます"
                      : "動画に表示する情報を入力してください（任意）"}
                  </p>
                </div>

                {/* 再生時間セレクター */}
                <div>
                  <h3 className="mb-2 text-sm font-medium">再生時間</h3>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDuration(opt.value)}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                          duration === opt.value
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 選択内容のサマリー */}
                <div className="rounded-xl bg-muted p-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">写真: </span>
                      <span className="font-medium">
                        {isSampleMode
                          ? `サンプル ${sampleImageCount}枚`
                          : `${files.length}枚`}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        テンプレート:{" "}
                      </span>
                      <span className="font-medium">
                        {TEMPLATES.find((t) => t.id === template)?.name ?? template}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">再生時間: </span>
                      <span className="font-medium">{duration}秒</span>
                    </div>
                  </div>
                </div>

                <GenerationForm
                  onSubmit={handleGenerate}
                  isGenerating={false}
                  submitLabel={
                    isSampleMode ? "サンプル動画を生成" : undefined
                  }
                />

                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="w-full"
                >
                  戻る
                </Button>
              </>
            )}

            {isGenerating && (
              <div className="animate-fade-in space-y-6 py-8 text-center" aria-live="polite">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
                  <Spinner size="lg" className="text-primary" />
                </div>
                <div>
                  <h2 className="mb-2 text-lg font-medium">
                    {getProgressMessage(progress)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isSampleMode
                      ? "サンプル動画を準備しています..."
                      : "AIが商品動画を作成しています。少々お待ちください。"}
                  </p>
                </div>
                <ProgressBar progress={progress} label="生成進捗" />
              </div>
            )}

            {/* 完了: サンプルモード */}
            {isCompleted && videoUrl && isSampleMode && (
              <div className="animate-fade-in space-y-6 text-center">
                <h2 className="text-lg font-medium">
                  サンプル動画が完成しました！
                </h2>
                <div className="mx-auto max-w-xs">
                  <div
                    className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                  >
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-contain"
                      aria-label="サンプル動画プレビュー"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                      SAMPLE
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <UpgradeCTA variant="download" user={user} />
                  <UpgradeCTA variant="result" user={user} />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(1);
                      setSampleImages([]);
                      setTemplate(null);
                      setDuration(DEFAULT_DURATION);
                      sampleGen.reset();
                    }}
                    className="w-full"
                  >
                    別のテンプレートで試す
                  </Button>
                </div>
              </div>
            )}

            {/* 完了: 有料ユーザー */}
            {isCompleted && videoUrl && !isSampleMode && (
              <div className="animate-fade-in space-y-6 text-center">
                <h2 className="text-lg font-medium">動画が完成しました！</h2>
                <div className="mx-auto max-w-xs">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black" style={{ boxShadow: "var(--shadow-lg)" }}>
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-contain"
                      aria-label="生成された動画プレビュー"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const res = await fetch(videoUrl);
                        const blob = await res.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = "clipforge-video.mp4";
                        a.click();
                        URL.revokeObjectURL(blobUrl);
                        addToast({ type: "success", title: "ダウンロードを開始しました" });
                      } catch {
                        addToast({ type: "error", title: "ダウンロードに失敗しました" });
                      }
                    }}
                  >
                    動画をダウンロード
                  </Button>
                  <Link href="/dashboard" className={`${buttonStyles({ variant: "secondary" })} w-full`}>
                    ダッシュボードで確認
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(1);
                      setFiles([]);
                      setTemplate(null);
                      setDuration(DEFAULT_DURATION);
                    }}
                    className="w-full"
                  >
                    新しい動画を作成
                  </Button>
                </div>
              </div>
            )}

            {status === "failed" && upgradeRequired && (
              <div className="animate-fade-in space-y-4 py-8 text-center">
                <div className="text-4xl">📊</div>
                <h2 className="text-lg font-medium">{error}</h2>
                <p className="text-sm text-muted-foreground">
                  プランをアップグレードすると、より多くの動画を生成できます。
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/pricing" className={`${buttonStyles({ size: "lg" })} w-full`}>
                    プランをアップグレード
                  </Link>
                  <Link href="/dashboard" className={`${buttonStyles({ variant: "outline" })} w-full`}>
                    ダッシュボードへ
                  </Link>
                </div>
              </div>
            )}

            {status === "failed" && !upgradeRequired && (
              <div className="animate-fade-in space-y-4 py-8 text-center">
                <div className="text-4xl">😞</div>
                <h2 className="text-lg font-medium">生成に失敗しました</h2>
                <p className="text-sm text-destructive" role="alert">{error}</p>
                <Button
                  onClick={() => {
                    realGen.reset();
                    sampleGen.reset();
                    setCurrentStep(1);
                    setFiles([]);
                    setSampleImages([]);
                    setTemplate(null);
                    setDuration(DEFAULT_DURATION);
                  }}
                  className="w-full"
                >
                  もう一度試す
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
