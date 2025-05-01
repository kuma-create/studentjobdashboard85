import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CompanyPricingPage() {
  try {
    const supabase = await createClient()

    // セッションの取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/auth/signin?redirect=/company/pricing")
    }

    // ユーザーロールの取得
    const { data: userRole } = await supabase.from("user_roles").select("role").eq("id", session.user.id).single()

    if (!userRole || userRole.role !== "company") {
      redirect("/dashboard")
    }

    // 料金プランの表示
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">料金プラン</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">スタータープラン</h2>
            <p className="text-3xl font-bold mb-4">
              ¥0 <span className="text-sm font-normal text-gray-500">/月</span>
            </p>
            <ul className="space-y-2 mb-6">
              <li>• 求人掲載 3件まで</li>
              <li>• 応募者管理機能</li>
              <li>• 基本的なメッセージ機能</li>
            </ul>
            <button className="w-full py-2 bg-gray-200 rounded-md">現在のプラン</button>
          </div>

          <div className="border rounded-lg p-6 bg-gradient-to-b from-red-50 to-white border-red-200">
            <h2 className="text-xl font-semibold mb-2">スタンダードプラン</h2>
            <p className="text-3xl font-bold mb-4">
              ¥9,800 <span className="text-sm font-normal text-gray-500">/月</span>
            </p>
            <ul className="space-y-2 mb-6">
              <li>• 求人掲載 10件まで</li>
              <li>• 応募者管理機能（高度な検索）</li>
              <li>• メッセージ機能（既読確認）</li>
              <li>• 応募者分析レポート</li>
            </ul>
            <button className="w-full py-2 bg-red-600 text-white rounded-md">アップグレード</button>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">エンタープライズプラン</h2>
            <p className="text-3xl font-bold mb-4">
              ¥29,800 <span className="text-sm font-normal text-gray-500">/月</span>
            </p>
            <ul className="space-y-2 mb-6">
              <li>• 求人掲載 無制限</li>
              <li>• 応募者管理機能（AI推薦）</li>
              <li>• メッセージ機能（高度な分析）</li>
              <li>• 応募者分析レポート</li>
              <li>• 優先サポート</li>
            </ul>
            <button className="w-full py-2 bg-gray-800 text-white rounded-md">お問い合わせ</button>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in CompanyPricingPage:", error)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">料金プラン</h1>
        <p className="text-red-500">料金情報の読み込み中にエラーが発生しました。</p>
      </div>
    )
  }
}
