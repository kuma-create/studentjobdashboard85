import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CompanyJobsClient from "./company-jobs-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

// データベースから取得した求人情報の型
interface JobData {
  id: string
  title: string
  description: string
  company_id: string
  location: string | null
  job_type: string | null
  salary_range: string | null // データベースでは文字列として保存されている
  requirements: string | null
  application_deadline: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
  [key: string]: any
}

// アプリケーションで使用する求人情報の型
interface Job {
  id: string
  title: string
  description: string
  company_id: string
  location: string | null
  job_type: string | null
  salary_range: {
    min: number | null
    max: number | null
  } | null
  requirements: string | null
  application_deadline: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
  [key: string]: any
}

export default async function CompanyJobsPage() {
  try {
    const supabase = await createClient()

    // セッションの取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/auth/signin?redirect=/company/jobs")
    }

    // ユーザーロールの取得
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role, is_approved")
      .eq("id", session.user.id)
      .single()

    if (!userRole || userRole.role !== "company") {
      redirect("/dashboard")
    }

    if (userRole.is_approved === false) {
      redirect("/company/pending")
    }

    // 企業ユーザー情報を取得
    const { data: companyUser, error: companyUserError } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", session.user.id)
      .single()

    if (companyUserError || !companyUser) {
      console.error("Error fetching company user:", companyUserError)
      redirect("/company/dashboard")
    }

    const companyId = companyUser.company_id

    // 求人情報を取得
    const { data: jobsData, error: jobsError } = await supabase
      .from("job_postings")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError)
      throw new Error("求人情報の取得に失敗しました")
    }

    // データ変換: salary_rangeを適切な形式に変換
    const jobs: Job[] = (jobsData || []).map((job: JobData) => {
      // salary_rangeを適切な形式に変換
      let parsedSalaryRange: { min: number | null; max: number | null } | null = null

      if (job.salary_range) {
        try {
          // 文字列の場合はJSONとしてパース
          const parsed = JSON.parse(job.salary_range)

          // パースしたデータが期待する形式かチェック
          if (parsed && typeof parsed === "object") {
            parsedSalaryRange = {
              min: typeof parsed.min === "number" ? parsed.min : null,
              max: typeof parsed.max === "number" ? parsed.max : null,
            }
          }
        } catch (e) {
          console.error(`Failed to parse salary_range for job ${job.id}:`, e)
        }
      }

      // 変換したデータを返す
      return {
        ...job,
        salary_range: parsedSalaryRange,
      } as Job
    })

    // 各求人ごとの応募数をまとめて取得
    const { data: applications } = await supabase.from("applications").select("job_id").eq("company_id", companyId)

    // 求人IDごとに応募数をカウント
    const applicationCounts: Record<string, number> = {}
    if (applications) {
      applications.forEach((app) => {
        if (app.job_id) {
          applicationCounts[app.job_id] = (applicationCounts[app.job_id] || 0) + 1
        }
      })
    }

    return <CompanyJobsClient jobs={jobs} applicationCounts={applicationCounts} companyId={companyId} />
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
