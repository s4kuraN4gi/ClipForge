"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface MobileNavProps {
  user: User | null;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileNav({
  user,
  loading,
  isOpen,
  onClose,
  onLogout,
}: MobileNavProps) {
  const pathname = usePathname();

  // ルート変更時に閉じる
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Escape キーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* バックドロップ */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* スライドインパネル */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
        className="fixed inset-y-0 right-0 z-50 w-72 bg-background border-l border-border"
        style={{
          boxShadow: "var(--shadow-lg)",
          animation: "toast-enter 0.2s ease-out",
        }}
      >
        {/* 閉じるボタン */}
        <div className="flex h-14 items-center justify-end px-4">
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="メニューを閉じる"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* メニューアイテム */}
        <nav aria-label="モバイルメニュー" className="px-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-11 animate-pulse rounded-lg bg-muted" />
              <div className="h-11 animate-pulse rounded-lg bg-muted" />
            </div>
          ) : user ? (
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                ダッシュボード
              </Link>
              <Link
                href="/create"
                className="flex h-11 items-center rounded-lg px-3 text-sm font-medium text-primary transition-colors hover:bg-primary-light"
              >
                動画を作成
              </Link>
              <hr className="my-2 border-border" />
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex h-11 w-full items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/login"
                className="flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                ログイン
              </Link>
              <Link
                href="/create"
                className="flex h-11 items-center rounded-lg px-3 text-sm font-medium text-primary transition-colors hover:bg-primary-light"
              >
                動画を作成
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
