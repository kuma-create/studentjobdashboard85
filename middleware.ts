import { type NextRequest, NextResponse } from "next/server"

const publicPaths = [
  "/",
  "/jobs",
  "/features",
  "/grandprix",
  "/auth/signin",
  "/auth/signup",
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 静的ファイルなどはスキップ
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".")
  ) {
    return NextResponse.next()
  }

  // 公開ページはそのまま
  if (publicPaths.some((p) => path === p || path.startsWith(p))) {
    return NextResponse.next()
  }

  // その他はセッションチェックをページ側に任せる
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
