import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  try {
    // サーバーサイドのSupabaseクライアントを作成
    const supabase = createClient()

    // ユーザー認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // セッションがない場合はログインページにリダイレクト
    if (!session) {
      console.log("No session found, redirecting to signin page")
      return redirect("/auth/signin?redirect=/dashboard")
    }

    const user = session.user
    console.log("User authenticated:", user.id)

    // 簡易的なダッシュボードを表示（テスト用）
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-4">ようこそ、{user.email || "ユーザー"}さん！</p>
          <p>ユーザーID: {user.id}</p>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    // エラーページを表示
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
        <p className="mb-6">ダッシュボードの読み込み中にエラーが発生しました。</p>
        <p className="mb-6 text-sm text-gray-600">
          {error instanceof Error ? error.message : "不明なエラーが発生しました"}
        </p>
        <a
          href="/auth/signin?redirect=/dashboard"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          ログインページに戻る
        </a>
      </div>
    )
  }
}
