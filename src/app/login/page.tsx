"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        addToast({ type: "error", title: "ログインに失敗しました", description: error.message });
        setLoading(false);
        return;
      }
      // 無料プランのサブスクリプション自動作成
      await fetch("/api/auth/ensure-subscription", { method: "POST" });
      addToast({ type: "success", title: "ログインしました" });
      router.push("/create");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        addToast({ type: "error", title: "登録に失敗しました", description: error.message });
        setLoading(false);
        return;
      }
      setMessage("確認メールを送信しました。メールのリンクをクリックしてください。");
      addToast({ type: "success", title: "確認メールを送信しました" });
      setLoading(false);
    }
  };

  return (
    <div className="relative px-4 py-12 sm:py-20">
      {/* 装飾ブロブ */}
      <div className="blob-2 -left-40 top-20 opacity-30" />
      <div className="blob-3 -right-32 bottom-10 opacity-20" />

      <div className="relative mx-auto max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "ログイン" : "アカウント作成"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "ClipForge にログインして動画を作成しましょう"
              : "無料アカウントを作成して始めましょう"}
          </p>
        </div>

        <Card variant="elevated">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                error={error && mode === "login" ? " " : undefined}
              />

              <Input
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="6文字以上"
                hint={mode === "signup" ? "6文字以上で入力してください" : undefined}
              />

              {error && (
                <p className="text-sm text-destructive" role="alert">{error}</p>
              )}
              {message && (
                <p className="text-sm text-accent" role="status">{message}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {mode === "login" ? "ログイン" : "アカウント作成"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === "login" ? (
                <p>
                  アカウントをお持ちでない方は{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                      setMessage(null);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    新規登録
                  </button>
                </p>
              ) : (
                <p>
                  すでにアカウントをお持ちの方は{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                      setMessage(null);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    ログイン
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
