import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const subscription = await getSubscription(user.id);

    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json(
      { error: "サブスクリプションの取得に失敗しました" },
      { status: 500 }
    );
  }
}
