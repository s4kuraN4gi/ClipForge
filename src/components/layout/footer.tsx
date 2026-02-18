export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-primary">ClipForge</span>
            <span className="text-sm text-muted-foreground">&copy; 2026</span>
          </div>
          <nav aria-label="フッターナビゲーション" className="flex gap-8">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              利用規約
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              プライバシーポリシー
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              お問い合わせ
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
