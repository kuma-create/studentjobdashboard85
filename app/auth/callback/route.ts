import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=no_code`)
    }

    // クッキーストアを取得
    const cookieStore = await cookies()

    // レスポンスを作成
    const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)

    // Supabaseクライアントを作成
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
            response.cookies.set({ name, value: "", ...options })
          },
        },
      },
    )

    // コードをセッションに交換
    await supabase.auth.exchangeCodeForSession(code)

    // ダッシュボードにリダイレクト
    return response
  } catch (error) {
    console.error("Error in auth callback:", error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/signin?error=callback_error`)
  }
}
