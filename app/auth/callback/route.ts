import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRouteHandlerClient } from "@/lib/supabase/route-handlers"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      // API ルートハンドラー用のクライアントを使用
      const supabase = await createRouteHandlerClient(request)
      await supabase.auth.exchangeCodeForSession(code)
    }

    // URL から code パラメータを削除
    requestUrl.searchParams.delete("code")

    // ダッシュボードにリダイレクト
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  } catch (error) {
    console.error("Error in auth callback:", error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/signin?error=callback_error`)
  }
}
