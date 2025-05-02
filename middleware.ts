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

  // デバッグログ
  console.log("Middleware path check:", path)

  // 認証が必要ないページはそのまま通す
  if (!isAuthRequired(path)) {
    console.log("No auth required for path:", path)
    return NextResponse.next()
  }

  // クッキーからセッションの存在を確認
  const hasAccessToken = request.cookies.has("sb-access-token")
  const hasRefreshToken = request.cookies.has("sb-refresh-token")
  const hasSession = hasAccessToken || hasRefreshToken

  console.log("Auth check - Access token:", hasAccessToken, "Refresh token:", hasRefreshToken)

  // セッションがない場合はログインページにリダイレクト
  if (!hasSession) {
    console.log("No session found, redirecting to signin")
    const redirectUrl = new URL("/auth/signin", request.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // セッションがある場合はそのまま通す
  console.log("Session found, proceeding to:", path)
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
