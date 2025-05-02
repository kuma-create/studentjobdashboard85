import { createClient } from "@/lib/supabase/server"
import JobsClient from "./jobs-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function JobsPage() {
  try {
    const supabase = await createClient()

    const { data: jobsRaw, error } = await supabase
      .from("job_postings")
      .select(`
        *,
        companies (
          id,
          name,
          industry,
          logo_url
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching jobs:", error)
    }

    // `is_active: boolean | null` → `boolean` に強制変換して型を整える
    const jobs = (jobsRaw || []).map((job) => ({
      ...job,
      is_active: !!job.is_active,
    }))

    const industries = [
      { value: "all", label: "すべての業界" },
      { value: "it", label: "IT・通信" },
      { value: "finance", label: "金融・保険" },
      { value: "consulting", label: "コンサルティング" },
      { value: "manufacturing", label: "メーカー" },
      { value: "trading", label: "商社" },
      { value: "media", label: "広告・メディア" },
    ]

    const jobTypes = [
      { value: "all", label: "すべての職種" },
      { value: "engineer", label: "エンジニア" },
      { value: "consultant", label: "コンサルタント" },
      { value: "designer", label: "デザイナー" },
      { value: "marketing", label: "マーケティング" },
      { value: "sales", label: "営業" },
      { value: "datascientist", label: "データサイエンティスト" },
    ]

    const locations = [
      { value: "all", label: "すべての勤務地" },
      { value: "tokyo", label: "東京都" },
      { value: "osaka", label: "大阪府" },
      { value: "nagoya", label: "愛知県" },
      { value: "fukuoka", label: "福岡県" },
      { value: "remote", label: "リモート可" },
    ]

    return (
      <JobsClient
        initialJobs={jobs}
        industries={industries}
        jobTypes={jobTypes}
        locations={locations}
      />
    )
  } catch (error) {
    console.error("Error in JobsPage:", error)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">求人一覧</h1>
        <p className="text-red-500">求人情報の読み込み中にエラーが発生しました。</p>
      </div>
    )
  }
}
