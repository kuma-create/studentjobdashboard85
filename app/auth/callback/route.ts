import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      const supabase = await createClient()
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
