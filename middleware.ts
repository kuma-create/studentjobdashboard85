import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  console.log("ミドルウェアパスチェック:", path)

  // 認証が必要ないページはそのまま通す
  if (!isAuthRequired(path)) {
    console.log("認証不要のパス:", path)
    return NextResponse.next()
  }

  // クッキーからセッションの存在を確認
  const cookieNames = [
    "sb-access-token",
    "sb-refresh-token",
    "sb-access-token-secure",
    "sb-refresh-token-secure",
    "supabase-auth-token",
  ]

  let hasSession = false

  for (const name of cookieNames) {
    if (request.cookies.has(name)) {
      console.log(`クッキー ${name} が見つかりました`)
      hasSession = true
      break
    }
  }

  // すべてのクッキーをログに出力（デバッグ用）
  console.log(
    "すべてのクッキー:",
    Array.from(request.cookies.getAll()).map((c) => c.name),
  )

  // セッションがない場合はログインページにリダイレクト
  if (!hasSession) {
    console.log("セッションなし、ログインページへリダイレクト")
    const redirectUrl = new URL("/auth/signin", request.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // セッションがある場合はそのまま通す
  console.log("セッションあり、次へ進む:", path)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
