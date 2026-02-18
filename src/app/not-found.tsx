import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl font-bold text-muted-foreground/30">
        404
      </div>
      <h1 className="mb-3 text-2xl font-bold">
        ページが見つかりません
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          トップページへ
        </Link>
        <Link
          href="/create"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
        >
          動画を作成
        </Link>
      </div>
    </div>
  );
}
