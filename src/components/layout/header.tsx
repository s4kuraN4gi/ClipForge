"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MobileNav } from "./mobile-nav";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    addToast({ type: "info", title: "ログアウトしました" });
    router.push("/");
    router.refresh();
  }, [router, addToast]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="ClipForge ホーム"
          >
            <span className="text-xl font-bold tracking-tight text-primary">ClipForge</span>
          </Link>

          {/* デスクトップナビ */}
          <nav
            className="hidden items-center gap-3 sm:flex"
            aria-label="メインナビゲーション"
          >
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/create"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  動画を作成
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  ログイン
                </Link>
                <Link
                  href="/create"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  動画を作成
                </Link>
              </>
            )}
          </nav>

          {/* モバイルハンバーガー */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center rounded-lg p-2 text-foreground transition-colors hover:bg-muted sm:hidden"
            aria-label="メニューを開く"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav
        user={user}
        loading={loading}
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        onLogout={handleLogout}
      />
    </>
  );
}
