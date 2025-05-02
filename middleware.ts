import { type NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

const publicPaths = ["/", "/jobs", "/features", "/grandprix", "/auth/signin", "/auth/signup"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 静的ファイルなどはスキップ
  if (path.startsWith("/_next") || path.startsWith("/api") || path.includes(".")) {
    return NextResponse.next()
  }

  // 公開ページはそのまま
  if (publicPaths.some((p) => path === p || path.startsWith(p))) {
    return NextResponse.next()
  }

  // Supabaseクライアントを作成
  const res = NextResponse.next()
  // 型パラメータを明示的に指定
  const supabase = createMiddlewareClient<Database, "public">({ req: request, res })

  // セッションをチェック
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // セッションがない場合はログインページにリダイレクト
  if (!session && path !== "/auth/signin") {
    const redirectUrl = new URL("/auth/signin", request.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
