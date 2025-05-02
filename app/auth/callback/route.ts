import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirect") || "/dashboard"

  if (code) {
    const cookieStore = cookies()
    // 型パラメータを明示的に指定
    const supabase = createServerClient<Database, "public">(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.delete({ name, ...options })
          },
        },
      },
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=session_error`)
      }
    } catch (error) {
      console.error("Unexpected error during auth:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/signin?error=unexpected_error`)
    }
  }

  // リダイレクト先を決定
  const redirectUrl = redirectTo.startsWith("/") ? `${requestUrl.origin}${redirectTo}` : redirectTo

  return NextResponse.redirect(redirectUrl)
}
