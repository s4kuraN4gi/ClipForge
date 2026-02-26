import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/pricing");
  }

  return (
    <div className="px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-md text-center">
        <Card variant="elevated" className="p-8">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="mb-2 text-2xl font-bold">
            プランのアップグレードが完了しました
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            ご利用ありがとうございます。さっそく動画を作成しましょう。
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/create" className={`${buttonStyles({ size: "lg" })} w-full`}>
              動画を作成する
            </Link>
            <Link href="/dashboard" className={`${buttonStyles({ variant: "outline", size: "lg" })} w-full`}>
              ダッシュボードへ
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
