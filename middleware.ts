import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // セッションの取得を試みる
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 保護されたルートへのアクセスをチェック
    const protectedRoutes = ["/dashboard", "/profile", "/applications", "/jobs", "/messages", "/offers"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    // 認証が必要なページで未認証の場合はリダイレクト
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/auth/signin", request.url)
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 認証済みユーザーが認証ページにアクセスした場合はダッシュボードにリダイレクト
    if (
      session &&
      (request.nextUrl.pathname.startsWith("/auth/signin") || request.nextUrl.pathname.startsWith("/auth/signup"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // エラーが発生した場合でも、ページの表示は許可する
    return NextResponse.next()
  }
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * 以下のパスにミドルウェアを適用:
     * - /dashboard, /profile, /applications などの保護されたルート
     * - /auth/signin, /auth/signup などの認証ページ
     */
    "/dashboard/:path*",
    "/profile/:path*",
    "/applications/:path*",
    "/jobs/:path*",
    "/messages/:path*",
    "/offers/:path*",
    "/auth/:path*",
  ],
}
