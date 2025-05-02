import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// 公開ページのパス
const publicPaths = [
  "/",
  "/jobs",
  "/features",
  "/grandprix",
  "/auth/signin",
  "/auth/signup",
  "/auth/callback",
  "/auth/reset-password",
  "/auth/update-password",
]

// 認証が必要なページかどうかをチェック
function isAuthRequired(path: string): boolean {
  // 静的ファイルやAPIルートはスキップ
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".") ||
    path.startsWith("/images") ||
    path.startsWith("/fonts")
  ) {
    return false
  }

  // 公開ページはスキップ
  if (publicPaths.some((p) => path === p || (p !== "/" && path.startsWith(p)))) {
    return false
  }

  // それ以外は認証が必要
  return true
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  console.log("ミドルウェアパスチェック:", path)

  // 認証が必要ないページはそのまま通す
  if (!isAuthRequired(path)) {
    console.log("認証不要のパス:", path)
    return NextResponse.next()
  }

  // レスポンスを作成
  const res = NextResponse.next()

  // supabaseクライアントを作成
  const supabase = createMiddlewareClient({ req: request, res })

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("セッションチェック:", session ? "セッションあり" : "セッションなし")

  // セッションがない場合はログインページにリダイレクト
  if (!session) {
    console.log("セッションなし、ログインページへリダイレクト")
    // リダイレクトURLを作成
    const redirectUrl = new URL("/auth/signin", request.url)
    redirectUrl.searchParams.set("redirect", path)

    // リダイレクトレスポンスを返す
    return NextResponse.redirect(redirectUrl)
  }

  // セッションがある場合はそのまま通す
  console.log("セッションあり、次へ進む:", path)
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
