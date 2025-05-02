import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CompanyJobsClient from "./company-jobs-client"
import type { Job } from "@/types/job"


// 動的レンダリングを強制
export const dynamic = "force-dynamic"

export default async function CompanyJobsPage() {
  try {
    // Supabase クライアントを await する
    const supabase = await createClient()

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
    if (!userRole || userRole.role !== "company") {
      redirect("/dashboard")
    }

    // 企業アカウントで未承認の場合は承認待ちページにリダイレクト
    if (userRole.is_approved === false) {
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

    // 求人情報の取得
    const { data: jobsData, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("company_id", companyUser.company_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching jobs:", error)
      throw new Error("求人情報の取得に失敗しました")
    }

    // 型アサーションを使用して型の互換性を確保
    const jobs: Job[] = jobsData || []

    return <CompanyJobsClient jobs={jobs} />
  } catch (error) {
    console.error("Error in CompanyJobsPage:", error)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">求人管理</h1>
        <p className="text-red-500">求人情報の読み込み中にエラーが発生しました。</p>
      </div>
    )
  }
}
