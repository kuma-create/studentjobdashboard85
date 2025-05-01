import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import JobCreateForm from "./job-create-form"

// 動的レンダリングを強制
export const dynamic = "force-dynamic"

export default async function CreateJobPage() {
  const supabase = await createClient()

  try {
    // セッションの取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/auth/signin")
    }

    // ユーザーロールの取得
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role, is_approved")
      .eq("id", session.user.id)
      .single()

    // 企業アカウントでない場合はリダイレクト
    if (userRole?.role !== "company") {
      redirect("/dashboard")
    }

    // 企業アカウントで未承認の場合は承認待ちページにリダイレクト
    if (userRole?.is_approved === false) {
      redirect("/company/pending")
    }

    // 企業IDの取得
    const { data: companyUser } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", session.user.id)
      .single()

    if (!companyUser) {
      // 企業ユーザーが見つからない場合はダッシュボードにリダイレクト
      redirect("/company/dashboard")
    }

    // 企業情報の取得
    const { data: companyData } = await supabase
      .from("companies")
      .select("id, name, industry, location")
      .eq("id", companyUser.company_id)
      .single()

    // companyDataがnullの場合やプロパティがnullの場合にデフォルト値を設定
    const company = {
      id: companyData?.id || "",
      name: companyData?.name || "",
      industry: companyData?.industry || "",
      location: companyData?.location || "",
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">求人を作成</h1>
        <JobCreateForm company={company} userId={session.user.id} />
      </div>
    )
  } catch (error) {
    console.error("Error in CreateJobPage:", error)
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">求人を作成</h1>
        <p className="text-red-500">エラーが発生しました。再度お試しください。</p>
      </div>
    )
  }
}
