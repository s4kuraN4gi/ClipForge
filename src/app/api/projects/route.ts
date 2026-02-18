import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        project_images (*),
        generated_videos (*)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Projects fetch error:", error);
      return NextResponse.json(
        { error: "プロジェクト一覧の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { template, productName, productPrice, catchphrase, storagePaths } =
      body;

    // プロジェクト作成
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        template,
        status: "draft",
        product_name: productName || null,
        product_price: productPrice || null,
        catchphrase: catchphrase || null,
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error("Project create error:", projectError);
      return NextResponse.json(
        { error: "プロジェクトの作成に失敗しました" },
        { status: 500 }
      );
    }

    // 画像レコード作成
    if (storagePaths && storagePaths.length > 0) {
      const imageRecords = storagePaths.map(
        (path: string, index: number) => ({
          project_id: project.id,
          storage_path: path,
          display_order: index,
        })
      );

      const { error: imagesError } = await supabase
        .from("project_images")
        .insert(imageRecords);

      if (imagesError) {
        console.error("Images insert error:", imagesError);
      }
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Project create API error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
