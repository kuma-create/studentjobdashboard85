import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProfileClient from "./profile-client"
import type { StudentProfile } from "@/types/student"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProfilePage() {
  try {
    const supabase = await createClient()

    // セッションの取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/auth/signin?redirect=/profile")
    }

    // ユーザーロールの取得
    const { data: userRole } = await supabase.from("user_roles").select("role").eq("id", session.user.id).single()

    if (!userRole || userRole.role !== "student") {
      redirect("/dashboard")
    }

    // 学生プロフィールの取得
    const { data: profileData } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    // データを StudentProfile 型に変換
    const profile: StudentProfile = profileData
      ? {
          id: profileData.id,
          first_name: profileData.first_name || undefined,
          last_name: profileData.last_name || undefined,
          university: profileData.university || undefined,
          major: profileData.major || undefined,
          graduation_year: profileData.graduation_year || undefined,
          skills: profileData.skills || undefined,
          bio: profileData.bio || undefined,
          avatar_url: profileData.avatar_url || undefined,
          resume_url: profileData.resume_url || undefined,
          created_at: profileData.created_at || undefined, // ← 修正ポイント
          updated_at: profileData.updated_at || undefined,
        }
      : {} as StudentProfile // fallback に型アサーションを追加

    return <ProfileClient initialProfile={profile} userId={session.user.id} />
  } catch (error) {
    console.error("Error in ProfilePage:", error)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">プロフィール</h1>
        <p className="text-red-500">プロフィールの読み込み中にエラーが発生しました。</p>
      </div>
    )
  }
}
