import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureFreeSubscription } from "@/lib/subscription";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // リバースプロキシ背後では request.url が内部URL(0.0.0.0:3000)になるため
  // forwarded headers または NEXT_PUBLIC_SITE_URL からoriginを取得
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin);

  console.log("[auth/callback] origin:", origin, "code:", code ? "present" : "missing");

  // オープンリダイレクト対策: 相対パスのみ許可
  const rawNext = searchParams.get("next") ?? "/create";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/\\")
      ? rawNext
      : "/create";

  try {
    if (code) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      console.log("[auth/callback] supabaseUrl:", supabaseUrl ? "set" : "MISSING");
      console.log("[auth/callback] supabaseAnonKey:", supabaseAnonKey ? "set" : "MISSING");

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("[auth/callback] Missing env vars, redirecting to /login?error=config");
        return NextResponse.redirect(`${origin}/login?error=config`);
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      console.log("[auth/callback] Exchanging code for session...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[auth/callback] exchangeCodeForSession error:", error.message);
        return NextResponse.redirect(`${origin}/login?error=auth`);
      }

      if (data.user) {
        console.log("[auth/callback] User authenticated:", data.user.id);
        await ensureFreeSubscription(data.user.id);
        return response;
      }
    }
  } catch (err) {
    console.error("[auth/callback] Unexpected error:", err);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
