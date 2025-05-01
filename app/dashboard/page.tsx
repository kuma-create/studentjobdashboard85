import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"
import CompanyDashboardClient from "./company-dashboard-client"
import type { CompanyDashboardClientProps } from "./types"

export const revalidate = 0
export const dynamic = "force-dynamic"

// 求人情報の型定義
interface Job {
  id: string
  title: string
  description: string
  company_id: string
  location: string | null
  job_type: string | null
  salary_range: string | null
  requirements: string | null
  application_deadline: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

// アプリケーションの型定義
interface Application {
  id: string
  status: string
  created_at: string
  job_id: string
  student_id?: string
  job_postings?: {
    id: string | null
    title: string | null
    company_id?: string
    companies?: {
      id: string | null
      name: string | null
      logo_url: string | null
    } | null
  } | null
  student_profiles?: {
    id: string | null
    first_name: string | null
    last_name: string | null
    university: string | null
    graduation_year: string | null
    avatar_url: string | null
  } | null
}

// 保存済み求人の型定義
interface SavedJob {
  id: string
  created_at: string
  job_id: string
  job_postings?: {
    id: string | null
    title: string | null
    location: string | null
    salary_range: string | null
    company_id: string
    companies?: {
      id: string | null
      name: string | null
      logo_url: string | null
    } | null
  } | null
}

// おすすめ求人の型定義
interface RecommendedJob {
  id: string
  title: string
  location: string | null
  salary_range: string | null
  company_id: string
  companies?: {
    id: string | null
    name: string | null
    logo_url: string | null
  } | null
}

export default async function DashboardPage() {
  try {
    // サーバーサイドのSupabaseクライアントを作成
    const supabase = await createClient()

    // ユーザー認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // セッションがない場合はログインページにリダイレクト
    if (!session) {
      return redirect("/auth/signin?redirect=/dashboard")
    }

    const user = session.user

    // ユーザーロールを取得
    let { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role, is_approved")
      .eq("id", user.id)
      .single()

    if (roleError) {
      console.error("Error fetching user role:", roleError)

      // ユーザーロールが存在しない場合は作成
      if (roleError.code === "PGRST116") {
        // レコードが見つからないエラー
        const { error: insertError } = await supabase.from("user_roles").insert([
          {
            id: user.id,
            role: "student", // デフォルトは学生ロール
            is_approved: true,
          },
        ])

        if (insertError) {
          console.error("Error creating user role:", insertError)
          throw new Error("ユーザーロールの作成に失敗しました")
        }

        // 作成したロールを取得
        const { data: newRole, error: newRoleError } = await supabase
          .from("user_roles")
          .select("role, is_approved")
          .eq("id", user.id)
          .single()

        if (newRoleError) {
          console.error("Error fetching new user role:", newRoleError)
          throw new Error("新しいユーザーロールの取得に失敗しました")
        }

        userRole = newRole
      } else {
        throw new Error("ユーザーロールの取得に失敗しました")
      }
    }

    const userRoleData = userRole || { role: "student", is_approved: true }

    // 企業アカウントの場合
    if (userRoleData.role === "company") {
      // 承認されていない場合は保留ページにリダイレクト
      if (userRoleData.is_approved === false) {
        return redirect("/company/pending")
      }

      // 求人情報を取得
      const { data: jobsData = [], error: jobsError } = await supabase
        .from("job_postings")
        .select("*")
        .eq("company_id", user.id)
        .order("created_at", { ascending: false })

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError)
        throw new Error("求人情報の取得に失敗しました")
      }

      // 型アサーションを使用して、jobsDataをJob[]型として扱う
      const jobs = jobsData as Job[]

      // jobIdsを取得（空の配列の場合は考慮済み）
      const jobIds = jobs.map((job) => job.id)

      // 応募情報を取得 - 空の配列の場合はスキップ
      let applications: Application[] = []
      if (jobIds.length > 0) {
        const { data: applicationsData = [], error: applicationsError } = await supabase
          .from("applications")
          .select(`
            id,
            status,
            created_at,
            student_id,
            student_profiles (
              id,
              first_name,
              last_name,
              university,
              graduation_year,
              avatar_url
            ),
            job_id,
            job_postings:job_id ( 
              id,
              title
            )
          `)
          .in("job_id", jobIds)
          .order("created_at", { ascending: false })

        if (applicationsError) {
          console.error("Error fetching applications:", applicationsError)
          throw new Error("応募情報の取得に失敗しました")
        } else {
          applications = applicationsData as Application[]
        }
      }

      // アプリケーションデータを変換
      const transformedApplications = applications.map((app) => {
        // job_postingsが存在するか確認
        const jobPosting = app.job_postings || { id: null, title: null }

        return {
          ...app,
          jobs: {
            id: jobPosting.id,
            job_title: jobPosting.title,
          },
        }
      })

      // 企業情報を取得
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", user.id)
        .single()

      // 企業情報が存在しない場合は作成
      let companyInfo: CompanyDashboardClientProps["company"] | null = null
      if (companyError && companyError.code === "PGRST116") {
        // デフォルトの企業情報を作成
        const { data: newCompany, error: insertCompanyError } = await supabase
          .from("companies")
          .insert([
            {
              id: user.id,
              name: user.email?.split("@")[0] || "企業名未設定",
              industry: null,
              location: null,
              size: null,
              description: null,
              website_url: null,
              logo_url: null,
            },
          ])
          .select()
          .single()

        if (insertCompanyError) {
          console.error("Error creating company:", insertCompanyError)
          throw new Error("企業情報の作成に失敗しました")
        }

        // 取得したデータをCompanyDashboardClientPropsのcompany型に変換
        companyInfo = {
          id: newCompany.id,
          company_name: newCompany.name,
          email: user.email,
          industry: newCompany.industry,
          location: newCompany.location,
          company_size: newCompany.size,
          description: newCompany.description,
          website_url: newCompany.website_url,
          logo_url: newCompany.logo_url,
        }
      } else if (companyError) {
        console.error("Error fetching company:", companyError)
        throw new Error("企業情報の取得に失敗しました")
      } else {
        // 取得したデータをCompanyDashboardClientPropsのcompany型に変換
        companyInfo = {
          id: companyData.id,
          company_name: companyData.name,
          email: user.email,
          industry: companyData.industry,
          location: companyData.location,
          company_size: companyData.size,
          description: companyData.description,
          website_url: companyData.website_url,
          logo_url: companyData.logo_url,
        }
      }

      return (
        <CompanyDashboardClient user={user} company={companyInfo} jobs={jobs} applications={transformedApplications} />
      )
    }

    // 学生ダッシュボードの処理
    // 学生プロフィールを取得
    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // プロフィールが存在しない場合は作成
    let studentProfile = null
    if (profileError && profileError.code === "PGRST116") {
      // デフォルトのプロフィールを作成
      const { data: newProfile, error: insertProfileError } = await supabase
        .from("student_profiles")
        .insert([
          {
            id: user.id,
            first_name: null,
            last_name: null,
            university: null,
            major: null,
            graduation_year: null,
            skills: [],
            bio: null,
            avatar_url: null,
            resume_url: null,
          },
        ])
        .select()
        .single()

      if (insertProfileError) {
        console.error("Error creating profile:", insertProfileError)
        throw new Error("プロフィールの作成に失敗しました")
      }

      studentProfile = newProfile
    } else if (profileError) {
      console.error("Error fetching profile:", profileError)
      throw new Error("プロフィールの取得に失敗しました")
    } else {
      studentProfile = profile
    }

    // 応募履歴を取得
    const { data: applications = [], error: applicationsError } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        job_id,
        job_postings:job_id (
          id,
          title,
          company_id,
          companies:company_id (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })

    if (applicationsError) {
      console.error("Error fetching applications:", applicationsError)
      throw new Error("応募履歴の取得に失敗しました")
    }

    // アプリケーションデータを変換
    const transformedApplications = (applications as Application[]).map((app) => {
      // job_postingsとcompaniesが存在するか確認
      const jobPosting = app.job_postings || { id: null, title: null, companies: null }
      const company = jobPosting.companies || { id: null, name: null, logo_url: null }

      return {
        ...app,
        jobs: {
          id: jobPosting.id,
          job_title: jobPosting.title,
          companies: {
            id: company.id,
            company_name: company.name,
            logo_url: company.logo_url,
          },
        },
      }
    })

    // 保存済み求人を取得
    const { data: savedJobs = [], error: savedJobsError } = await supabase
      .from("saved_jobs")
      .select(`
        id,
        created_at,
        job_id,
        job_postings:job_id (
          id,
          title,
          location,
          salary_range,
          company_id,
          companies:company_id (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })

    if (savedJobsError) {
      console.error("Error fetching saved jobs:", savedJobsError)
      throw new Error("保存済み求人の取得に失敗しました")
    }

    // 保存済み求人データを変換
    const transformedSavedJobs = (savedJobs as SavedJob[]).map((job) => {
      // job_postingsとcompaniesが存在するか確認
      const jobPosting = job.job_postings || {
        id: null,
        title: null,
        location: null,
        salary_range: null,
        companies: null,
      }
      const company = jobPosting.companies || { id: null, name: null, logo_url: null }

      // salary_rangeが存在するか確認してから分割
      let salaryMin = 0
      let salaryMax = 0

      if (jobPosting.salary_range) {
        const salaryParts = jobPosting.salary_range.split("〜")
        salaryMin = salaryParts[0] ? Number.parseInt(salaryParts[0], 10) || 0 : 0
        salaryMax = salaryParts[1] ? Number.parseInt(salaryParts[1], 10) || 0 : 0
      }

      return {
        ...job,
        jobs: {
          id: jobPosting.id,
          job_title: jobPosting.title,
          location: jobPosting.location,
          salary_min: salaryMin,
          salary_max: salaryMax,
          companies: {
            id: company.id,
            company_name: company.name,
            logo_url: company.logo_url,
          },
        },
      }
    })

    // おすすめ求人を取得
    const { data: recommendedJobs = [], error: recommendedJobsError } = await supabase
      .from("job_postings")
      .select(`
        id,
        title,
        location,
        salary_range,
        company_id,
        companies:company_id (
          id,
          name,
          logo_url
        )
      `)
      .eq("is_active", true)
      .limit(5)

    if (recommendedJobsError) {
      console.error("Error fetching recommended jobs:", recommendedJobsError)
      throw new Error("おすすめ求人の取得に失敗しました")
    }

    // おすすめ求人データを変換
    const transformedRecommendedJobs = (recommendedJobs as RecommendedJob[]).map((job) => {
      // companiesが存在するか確認
      const company = job.companies || { id: null, name: null, logo_url: null }

      // salary_rangeが存在するか確認してから分割
      let salaryMin = 0
      let salaryMax = 0

      if (job.salary_range) {
        const salaryParts = job.salary_range.split("〜")
        salaryMin = salaryParts[0] ? Number.parseInt(salaryParts[0], 10) || 0 : 0
        salaryMax = salaryParts[1] ? Number.parseInt(salaryParts[1], 10) || 0 : 0
      }

      return {
        id: job.id,
        job_title: job.title,
        location: job.location,
        salary_min: salaryMin,
        salary_max: salaryMax,
        companies: {
          id: company.id,
          company_name: company.name,
          logo_url: company.logo_url,
        },
      }
    })

    return (
      <DashboardClient
        user={user}
        userRole={userRoleData.role}
        profile={studentProfile || null}
        applications={transformedApplications}
        savedJobs={transformedSavedJobs}
        recommendedJobs={transformedRecommendedJobs}
      />
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
