import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code`)
  }

  // レスポンスオブジェクトを作成
  const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)

  // クッキーストアを取得
  const cookieStore = cookies()

  // Supabaseクライアントを作成
  const supabase = createServerClient<Database, "public">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // レスポンスオブジェクトにクッキーを設定
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          // レスポンスオブジェクトからクッキーを削除
          response.cookies.delete({ name, ...options })
        },
      },
    },
  )

  try {
    // コードをセッションに交換
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=session_error`)
    }

    // 成功した場合はダッシュボードにリダイレクト
    return response
  } catch (error) {
    console.error("Unexpected error during auth:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=unexpected_error`)
  }
}
