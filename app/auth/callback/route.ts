import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("Auth callback received with code:", code ? "present" : "missing")

  if (!code) {
    console.log("No code provided in callback")
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code`)
  }

  // リダイレクト先を取得（デフォルトはダッシュボード）
  const redirectPath = requestUrl.searchParams.get("redirect") || "/dashboard"
  console.log("Redirect path from callback:", redirectPath)

  try {
    // Supabaseクライアントを作成
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // コードをセッションに交換
    console.log("Exchanging code for session")
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=session_error`)
    }

    // セッションが正しく設定されたことを確認
    const { data: sessionData } = await supabase.auth.getSession()
    console.log("Session confirmed:", sessionData.session ? "valid" : "invalid")

    // 成功した場合はダッシュボードにリダイレクト
    console.log("Redirecting to:", redirectPath)
    return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
  } catch (error) {
    console.error("Unexpected error during auth:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=unexpected_error`)
  }
}
