"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GenerationFormProps {
  onSubmit: (data: {
    productName: string;
    productPrice: string;
    catchphrase: string;
  }) => void;
  isGenerating: boolean;
  submitLabel?: string;
}

export function GenerationForm({
  onSubmit,
  isGenerating,
  submitLabel,
}: GenerationFormProps) {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [catchphrase, setCatchphrase] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ productName, productPrice, catchphrase });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="商品名"
        optional
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="例: ハンドメイド レザーウォレット"
      />

      <Input
        label="価格"
        optional
        type="text"
        value={productPrice}
        onChange={(e) => setProductPrice(e.target.value)}
        placeholder="例: ¥3,980"
      />

      <Input
        label="キャッチコピー"
        optional
        type="text"
        value={catchphrase}
        onChange={(e) => setCatchphrase(e.target.value)}
        placeholder="例: 手に馴染む、一生モノの革財布"
      />

      <Button
        type="submit"
        size="lg"
        loading={isGenerating}
        className="w-full"
      >
        {submitLabel ?? "動画を生成する"}
      </Button>
    </form>
  );
}
