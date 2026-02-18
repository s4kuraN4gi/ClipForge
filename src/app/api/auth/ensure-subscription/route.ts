import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureFreeSubscription } from "@/lib/subscription";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    await ensureFreeSubscription(user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "サブスクリプションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
