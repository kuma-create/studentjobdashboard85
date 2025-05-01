import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ApplicationsClient from "./applications-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ApplicationsPage() {
  try {
    const supabase = await createClient()

    // セッションの取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/auth/signin?redirect=/applications")
    }

    // ユーザーロールの取得
    const { data: userRole } = await supabase.from("user_roles").select("role").eq("id", session.user.id).single()

    if (!userRole || userRole.role !== "student") {
      redirect("/dashboard")
    }

    // 応募履歴の取得
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        job_postings (
          id,
          title,
          location,
          job_type,
          company_id,
          companies (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq("student_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching applications:", error)
    }

    return <ApplicationsClient applications={applications || []} />
  } catch (error) {
    console.error("Error in ApplicationsPage:", error)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">応募履歴</h1>
        <p className="text-red-500">応募履歴の読み込み中にエラーが発生しました。</p>
      </div>
    )
  }
}
