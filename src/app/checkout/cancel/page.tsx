import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <div className="px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-md text-center">
        <Card variant="elevated" className="p-8">
          <div className="mb-4 text-5xl">↩️</div>
          <h1 className="mb-2 text-2xl font-bold">
            お支払いがキャンセルされました
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            プランの選択をやり直す場合は、料金プランページからお選びください。
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/#pricing">
              <Button size="lg" className="w-full">
                料金プランを見る
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full">
                ダッシュボードへ
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
